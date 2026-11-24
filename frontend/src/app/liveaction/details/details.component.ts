import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WatchStatus } from '@models/anime';
import { ExtRating } from '@models/components';
import {
  countryNames,
  infoboxValue,
  Liveaction,
  liveactionPoster,
  platformName,
} from '@models/liveaction';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BangumiRelatedSubject, BangumiService } from '@services/anime/bangumi.service';
import { SimklService } from '@services/anime/simkl.service';
import { TraktService } from '@services/anime/trakt.service';
import { AnisearchService } from '@services/anisearch.service';
import { DialogueService } from '@services/dialogue.service';
import { GlobalService } from '@services/global.service';
import { LiveactionService } from '@services/liveaction/liveaction.service';
import { SettingsService } from '@services/settings.service';

import { LiveactionEditComponent } from './edit/liveaction-edit.component';

@Component({
  selector: 'myanili-liveaction-details',
  templateUrl: './details.component.html',
  styleUrls: ['../../manga/details/details.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class LiveactionDetailsComponent implements OnInit {
  @Input() id = 0;
  @Input() inModal = false;
  liveaction?: Liveaction;
  notFound = false;
  loggedIn = false;
  busy = false;
  activeTab = 1;
  showOriginalSummary = false;
  ratings: Array<{ provider: string; rating: ExtRating }> = [];
  related: BangumiRelatedSubject[] = [];
  traktSlug?: string;
  simklId?: number;
  language: 'default' | 'en' | 'jp' = 'default';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private liveactionService: LiveactionService,
    private bangumi: BangumiService,
    private trakt: TraktService,
    private simkl: SimklService,
    private anisearch: AnisearchService,
    private glob: GlobalService,
    private modalService: NgbModal,
    private dialogue: DialogueService,
    settings: SettingsService,
  ) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId && newId !== this.id) {
        this.id = newId;
        this.reset();
        await this.ngOnInit();
      }
    });
    this.bangumi.user.subscribe(user => (this.loggedIn = !!user));
    settings.language$.subscribe(language => (this.language = language));
  }

  private reset() {
    this.ratings = [];
    this.related = [];
    delete this.liveaction;
    delete this.traktSlug;
    delete this.simklId;
    this.notFound = false;
    this.activeTab = 1;
  }

  async ngOnInit() {
    if (!this.id) return;
    const liveaction = await this.liveactionService.getLiveaction(this.id);
    if (!liveaction) {
      this.notFound = true;
      return;
    }
    this.liveaction = liveaction;
    this.glob.setTitle(this.title);
    if (liveaction.rating?.score) {
      this.setRating('bangumi', {
        nom: liveaction.rating.score,
        norm: liveaction.rating.score * 10,
        ratings: liveaction.rating.total,
      });
    }
    this.loadExternal();
    this.bangumi.getRelatedSubjects(this.id).then(related => {
      this.related = related.filter(subject => [1, 2, 6].includes(subject.type));
    });
  }

  private loadExternal() {
    const meta = this.liveaction?.meta;
    if (!meta) return;
    const id = this.id;
    if (meta.rating && meta.votes) {
      this.setRating('tmdb', {
        nom: Math.round(meta.rating * 10) / 10,
        norm: meta.rating * 10,
        ratings: meta.votes,
      });
    }
    this.traktSlug = meta.trakt || undefined;
    this.simklId = meta.simkl || undefined;
    if (this.traktSlug) {
      this.trakt
        .getRating(this.traktSlug, meta.mediaType === 'movie' ? -1 : meta.season || 1)
        .then(rating => id === this.id && this.setRating('trakt', rating));
    }
    if (this.simklId) {
      this.simkl
        .getRating(this.simklId)
        .then(rating => id === this.id && this.setRating('simkl', rating));
    }
    if (meta.anisearch) {
      this.anisearch
        .getRating(meta.anisearch, 'movie')
        .then(rating => id === this.id && this.setRating('anisearch', rating));
    }
  }

  get title(): string {
    const meta = this.liveaction?.meta;
    const original = this.liveaction?.name || '';
    if (this.language === 'jp') return original;
    return meta?.title || this.liveaction?.name_cn || original;
  }

  get alternativeTitles(): string[] {
    if (!this.liveaction) return [];
    return [this.liveaction.name, this.liveaction.meta?.title || '', this.liveaction.name_cn]
      .filter(title => title && title !== this.title)
      .filter((title, index, titles) => titles.indexOf(title) === index);
  }

  get poster(): string | undefined {
    if (!this.liveaction) return undefined;
    return liveactionPoster(this.liveaction, 'large');
  }

  get countries(): string[] {
    return this.liveaction ? countryNames(this.liveaction) : [];
  }

  get platform(): string {
    return platformName(this.liveaction);
  }

  get isMovie(): boolean {
    return this.liveaction?.meta?.mediaType === 'movie' || this.liveaction?.platform === '电影';
  }

  get episodes(): number {
    if (!this.liveaction) return 0;
    return this.liveactionService.getEpisodes(this.liveaction, this.liveaction.meta);
  }

  info(...keys: string[]): string[] {
    return this.liveaction ? infoboxValue(this.liveaction, ...keys) : [];
  }

  get meanRating(): number {
    if (this.liveaction?.my_list_status?.score) {
      return this.liveaction.my_list_status.score * 10;
    }
    let count = 0;
    let weighted = 0;
    for (const rating of this.ratings) {
      count += rating.rating.ratings || 0;
      weighted += rating.rating.norm * (rating.rating.ratings || 0);
    }
    return count ? weighted / count : 0;
  }

  getRating(provider: string): { provider: string; rating: ExtRating } | undefined {
    return this.ratings.find(rating => rating.provider === provider);
  }

  setRating(provider: string, rating?: ExtRating) {
    if (!rating) return;
    const existing = this.getRating(provider);
    if (existing) {
      existing.rating = rating;
    } else {
      this.ratings.push({ provider, rating });
    }
  }

  get traktUrl(): string | undefined {
    if (!this.traktSlug) return undefined;
    return `https://trakt.tv/${this.isMovie ? 'movies' : 'shows'}/${this.traktSlug}`;
  }

  get simklUrl(): string | undefined {
    if (!this.simklId) return undefined;
    return `https://simkl.com/${this.isMovie ? 'movies' : 'tv'}/${this.simklId}`;
  }

  relatedLink(subject: BangumiRelatedSubject): string {
    switch (subject.type) {
      case 6:
        return `/liveaction/details/${subject.id}`;
      case 2:
        return `/search/anime/${encodeURIComponent(subject.name)}`;
      default:
        return `/search/manga/${encodeURIComponent(subject.name)}`;
    }
  }

  async editSave() {
    if (this.busy || !this.liveaction) return;
    if (this.liveaction.my_list_status) {
      this.openEditModal();
    } else {
      await this.setStatus('plan_to_watch');
    }
  }

  openEditModal() {
    if (!this.liveaction) return;
    const modal = this.modalService.open(LiveactionEditComponent, { size: 'xl' });
    modal.componentInstance.liveaction = this.liveaction;
    modal.componentInstance.title = this.title;
    modal.closed.subscribe(async result => {
      if (result) await this.reload();
    });
  }

  async setStatus(status: WatchStatus) {
    if (!this.liveaction) return;
    const current = this.liveaction.my_list_status;
    const num_watched_episodes =
      status === 'completed' ? this.episodes : current?.num_watched_episodes;
    await this.update({ status, num_watched_episodes });
  }

  async plusOne() {
    const current = this.liveaction?.my_list_status;
    if (!this.liveaction || !current) return;
    const watched = current.num_watched_episodes + 1;
    const completed = !!this.episodes && watched >= this.episodes;
    if (completed && !(await this.dialogue.confirm('Mark as completed?', 'Last episode watched'))) {
      return this.update({ status: current.status, num_watched_episodes: watched });
    }
    await this.update({
      status: completed ? 'completed' : current.status,
      num_watched_episodes: watched,
    });
  }

  private async update(data: { status: WatchStatus; num_watched_episodes?: number }) {
    if (!this.liveaction) return;
    this.busy = true;
    this.glob.busy();
    try {
      await this.liveactionService.update(this.liveaction, data);
      await this.reload();
    } catch (error: unknown) {
      const message = (error as { message?: string })?.message || 'Unknown error';
      await this.dialogue.confirm(`Failed to update: ${message}`, 'Update Failed');
    }
    this.busy = false;
    this.glob.notbusy();
  }

  private async reload() {
    const liveaction = await this.liveactionService.getLiveaction(this.id);
    if (liveaction) this.liveaction = liveaction;
  }

  openRelated(subject: BangumiRelatedSubject) {
    this.router.navigateByUrl(this.relatedLink(subject));
  }
}
