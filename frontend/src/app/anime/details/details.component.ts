import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExtRating, MainService } from '@models/components';
import { AnimeExtension } from '@models/mal-anime';
import { Media, MediaExtension, MyMediaUpdate, PersonalStatus } from '@models/media';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Base64 } from 'js-base64';
import * as moment from 'moment';
import { AnilistService } from 'src/app/anilist.service';
import { AnisearchService } from 'src/app/anisearch.service';
import { AnisearchComponent } from 'src/app/anisearch/anisearch.component';
import { GlobalService } from 'src/app/global.service';
import { KitsuService } from 'src/app/kitsu.service';
import { MalService } from 'src/app/mal.service';
import { StreamPipe } from 'src/app/stream.pipe';

import { AnimeService } from '../anime.service';
import { AnnictService } from '../annict.service';
import { SimklService } from '../simkl.service';
import { TraktService } from '../trakt.service';
import { TraktComponent } from '../trakt/trakt.component';

@Component({
  selector: 'app-anime-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class AnimeDetailsComponent implements OnInit {
  @Input() id = 0;
  @Input() service: MainService = 'mal';
  anime?: Media;

  edit = false;
  busy = false;
  editBackup?: Partial<MyMediaUpdate>;
  editExtension?: MediaExtension;
  traktUser?: string;
  activeTab = 1;
  ratings: Array<{ provider: string; rating: ExtRating }> = [];
  @Input() inModal = false;

  constructor(
    private animeService: AnimeService,
    private route: ActivatedRoute,
    public streamPipe: StreamPipe,
    private glob: GlobalService,
    private trakt: TraktService,
    private modalService: NgbModal,
    private mal: MalService,
    private anilist: AnilistService,
    private kitsu: KitsuService,
    private simkl: SimklService,
    private annict: AnnictService,
    private anisearch: AnisearchService,
  ) {
    this.route.paramMap.subscribe(async params => {
      const [service, newId] = params.get('id')?.split(':') || [];
      if (Number(newId) !== this.id) {
        this.ratings = [];
        this.id = Number(newId);
        this.service = service as MainService;
        delete this.anime;
        this.busy = false;
        this.edit = false;
        this.glob.busy();
        await this.ngOnInit();
      }
    });
    this.trakt.user.subscribe(user => {
      this.traktUser = user;
    });
  }

  async ngOnInit() {
    const anime = await this.animeService.getAnime(this.id, this.service);
    if (!anime) return;
    if (anime.mean) {
      this.setRating(this.service, {
        nom: anime.mean,
        norm: anime.mean * 10,
        ratings: anime.num_scoring_users,
      });
    }
    this.anime = { ...anime };
    if (this.anime?.title) {
      this.glob.setTitle(this.anime.title);
    }
    const malId = anime.id_mal;
    if (!this.anime.my_extension) {
      this.anime.my_extension = { malId };
    } else {
      this.anime.my_extension.malId = malId;
    }
    if (this.service === 'anilist') {
      this.anime.my_extension.anilistId = anime.id;
    }
    if (this.service === 'kitsu') {
      this.anime.my_extension.kitsuId = { kitsuId: anime.id };
    }
    this.glob.notbusy();
    if (
      malId &&
      (!this.anime.my_extension.kitsuId ||
        !this.anime.my_extension.anilistId ||
        !this.anime.my_extension.simklId ||
        !this.anime.my_extension.annictId)
    ) {
      const [anilistId, kitsuId, simklId, annictId] = await Promise.all([
        this.anilist.getId(malId, 'ANIME'),
        this.kitsu.getId(malId, 'anime'),
        this.simkl.getId(malId),
        this.annict.getId(malId, anime.alternative_titles?.ja || anime.title),
      ]);
      if (this.service !== 'anilist') {
        this.anime.my_extension.anilistId = anilistId || this.anime.my_extension.anilistId;
      }
      if (this.service !== 'kitsu') {
        this.anime.my_extension.kitsuId = kitsuId || this.anime.my_extension.kitsuId;
      }
      this.anime.my_extension.simklId = simklId || this.anime.my_extension.simklId;
      this.anime.my_extension.annictId = annictId || this.anime.my_extension.annictId;
      if (anime.my_extension) {
        await this.animeService.updateAnime(
          { malId, kitsuId, simklId, anilistId, annictId },
          {
            comments: Base64.encode(
              JSON.stringify({
                ...anime.my_extension,
                kitsuId,
                anilistId,
                simklId,
                annictId,
              }),
            ),
          },
        );
      }
    }
    if (!this.anime.related.filter(rel => rel.type === 'manga').length) {
      this.anime.related_manga_promise?.then(relatedManga => {
        if (this.anime) this.anime.related.push(...relatedManga);
      });
    }
    this.glob.notbusy();
    await this.getRatings();
    // await this.findAnisearch();
  }

  async editSave() {
    if (this.busy) return;
    if (this.anime?.my_list_status) {
      if (this.edit) return this.save();
      this.startEdit();
    } else {
      this.addAnime();
    }
  }

  async startEdit() {
    if (!this.anime?.my_list_status) return;
    this.edit = true;
    this.editBackup = {
      status: this.anime.my_list_status.status || 'planning',
      repeating: this.anime.my_list_status.repeating,
      score: this.anime.my_list_status.score,
      repeats: this.anime.my_list_status.repeats,
      priority: this.anime.my_list_status.priority,
      repeat_value: this.anime.my_list_status.repeat_value,
      tags: this.anime.my_list_status.tags?.join(','),
    };
    try {
      const extension = JSON.parse(
        Base64.decode(this.anime.my_list_status.comments),
      ) as unknown as Partial<AnimeExtension>;
      this.editExtension = {
        series: '',
        seasonNumber: 1,
        episodeCorOffset: 0,
        ...this.anime.my_extension,
        ...extension,
      };
    } catch (e) {
      this.editExtension = {
        series: '',
        seasonNumber: 1,
        episodeCorOffset: 0,
        externalStreaming: '',
        externalStreamingId: '',
        simulCountry: '',
        simulDay: undefined,
        simulTime: undefined,
        ...this.anime.my_extension,
      };
    }
  }

  async save() {
    if (!this.anime?.my_list_status) return;
    if (!this.editBackup) {
      this.edit = false;
      return;
    }
    this.busy = true;
    if (this.editExtension && this.editExtension.simulDay) {
      this.editExtension.simulDay = Number(this.editExtension.simulDay);
    }
    const updateData = {
      comments: Base64.encode(JSON.stringify(this.editExtension)),
    } as Partial<MyMediaUpdate>;
    if (this.editBackup.status !== this.anime.my_list_status.status) {
      updateData.status = this.editBackup?.status;
    }
    if (this.editBackup.repeating !== this.anime.my_list_status.repeating) {
      updateData.repeating = this.editBackup?.repeating;
    }
    if (this.editBackup.score !== this.anime.my_list_status.score) {
      updateData.score = this.editBackup?.score;
    }
    if (this.editBackup.progress !== this.anime.my_list_status.progress) {
      updateData.progress = this.editBackup?.progress;
    }
    if (this.editBackup.priority !== this.anime.my_list_status.priority) {
      updateData.priority = this.editBackup?.priority;
    }
    if (this.editBackup.repeat_value !== this.anime.my_list_status.repeat_value) {
      updateData.repeat_value = this.editBackup?.repeat_value;
    }
    if (this.editBackup.tags !== this.anime.my_list_status.tags?.join(',')) {
      updateData.tags = this.editBackup?.tags;
    }
    await this.animeService.updateAnime(
      {
        malId: this.anime.my_extension?.malId,
        anilistId: this.anime.my_extension?.anilistId,
        kitsuId: this.anime.my_extension?.kitsuId,
        simklId: this.anime.my_extension?.simklId,
        annictId: this.anime.my_extension?.annictId,
        trakt: {
          id: this.anime.my_extension?.trakt,
          season: this.anime.media_type === 'movie' ? -1 : this.anime.my_extension?.seasonNumber,
        },
      },
      updateData,
    );
    this.stopEdit();
    await this.ngOnInit();
    this.busy = false;
  }

  stopEdit() {
    this.edit = false;
    delete this.editBackup;
    delete this.editExtension;
  }

  enableKitsu() {
    if (!this.editExtension) return false;
    if (!this.editExtension.kitsuId) {
      this.editExtension.kitsuId = { kitsuId: '' };
    }
    return true;
  }

  async addAnime() {
    if (!this.anime) return;
    this.busy = true;
    await this.animeService.updateAnime(
      {
        malId: this.anime.my_extension?.malId,
        anilistId: this.anime.my_extension?.anilistId,
        kitsuId: this.anime.my_extension?.kitsuId,
        simklId: this.anime.my_extension?.simklId,
        annictId: this.anime.my_extension?.annictId,
      },
      { status: 'planning' },
    );
    await this.ngOnInit();
    this.busy = false;
  }

  async setStatus(status: PersonalStatus) {
    if (!this.anime) return;
    this.glob.busy();
    this.busy = true;
    await this.animeService.updateAnime(
      {
        malId: this.anime.my_extension?.malId,
        anilistId: this.anime.my_extension?.anilistId,
        kitsuId: this.anime.my_extension?.kitsuId,
        simklId: this.anime.my_extension?.simklId,
        annictId: this.anime.my_extension?.annictId,
      },
      { status },
    );
    await this.ngOnInit();
    this.busy = false;
  }

  async rewatch() {
    if (!this.anime) return;
    this.glob.busy();
    this.busy = true;
    await this.animeService.updateAnime(
      {
        malId: this.anime.my_extension?.malId,
        anilistId: this.anime.my_extension?.anilistId,
        kitsuId: this.anime.my_extension?.kitsuId,
        simklId: this.anime.my_extension?.simklId,
        annictId: this.anime.my_extension?.annictId,
      },
      {
        status: 'completed',
        repeating: true,
        progress: 0,
      },
    );
    await this.ngOnInit();
    this.busy = false;
  }

  async plusOne() {
    if (!this.anime || !this.anime.my_list_status) return;
    this.glob.busy();
    const currentEpisode = this.anime.my_list_status?.progress || 0;
    const data = {
      progress: currentEpisode + 1,
    } as Partial<MyMediaUpdate>;
    let completed = false;
    if (currentEpisode + 1 === this.anime.num_parts) {
      data.status = 'completed';
      data.repeating = false;
      if (this.anime.my_list_status.repeating) {
        data.repeats = this.anime.my_list_status.repeats + 1 || 1;
      }
      completed = true;
      if (!this.anime.my_list_status?.score) {
        const myScore = Math.round(Number(prompt('Your score (1-10)?')));
        if (myScore > 0 && myScore <= 10) data.score = myScore;
      }
    }
    const [animeStatus] = await Promise.all([
      this.animeService.updateAnime(
        {
          malId: this.anime.my_extension?.malId,
          anilistId: this.anime.my_extension?.anilistId,
          kitsuId: this.anime.my_extension?.kitsuId,
          simklId: this.anime.my_extension?.simklId,
          annictId: this.anime.my_extension?.annictId,
        },
        data,
      ),
      this.scrobbleTrakt(),
      this.simkl.scrobble(
        { simkl: this.anime.my_extension?.simklId, mal: this.anime.id },
        currentEpisode + 1,
      ),
    ]);
    if (animeStatus) {
      if (completed) {
        animeStatus.repeating = false;
        const sequels = this.anime.related.filter(related => related.relation_type === 'sequel');
        if (sequels.length) {
          const sequel = await this.animeService.getAnime(sequels[0].node.id);
          if (sequel) {
            if (sequel.my_list_status?.status === 'completed') {
              const startSequel = confirm(`Rewatch sequel "${sequel.title}"?`);
              if (startSequel) {
                await this.animeService.updateAnime(
                  { malId: sequel.id },
                  { status: 'completed', repeating: true, progress: 0 },
                );
              }
            } else {
              const startSequel = confirm(`Start watching sequel "${sequel.title}"?`);
              if (startSequel) {
                await this.animeService.updateAnime({ malId: sequel.id }, { status: 'current' });
              }
            }
          }
          this.ngOnInit();
        }
      }
      this.anime.my_list_status.progress = animeStatus.progress;
      this.anime.my_list_status.status = animeStatus.status;
      this.anime.my_list_status.score = animeStatus.score;
      this.anime.my_list_status.repeating = animeStatus.repeating;
      this.anime.my_list_status.repeats = animeStatus.repeats;
    }
    this.glob.notbusy();
  }

  async scrobbleTrakt(): Promise<boolean> {
    if (!this.anime) return false;
    return new Promise(async r => {
      if (!this.anime) return r(false);
      if (!this.traktUser || !this.anime.my_extension?.trakt) return r(false);
      r(
        this.anime.media_type === 'movie'
          ? await this.trakt.scrobbleMovie(this.anime.my_extension.trakt)
          : await this.trakt.scrobble(
              this.anime.my_extension.trakt,
              this.anime.my_extension.seasonNumber || 1,
              (this.anime.my_list_status?.progress || 0) +
                1 +
                (this.anime.my_extension.episodeCorOffset || 0),
            ),
      );
    });
  }

  async deleteEntry(): Promise<boolean> {
    if (!this.anime) return false;
    if (!confirm(`Are you sure you want to delete "${this.anime.title}"?`)) return false;
    this.glob.busy();
    this.busy = true;
    await this.animeService.deleteAnime({
      malId: this.anime.id,
      anilistId: this.anime.my_extension?.anilistId,
      kitsuId: this.anime.my_extension?.kitsuId,
      simklId: this.anime.my_extension?.simklId,
      annictId: this.anime.my_extension?.annictId,
    });
    this.edit = false;
    await this.ngOnInit();
    this.glob.notbusy();
    this.busy = false;
    return true;
  }

  async findTrakt() {
    if (!this.anime || !this.editExtension) return;
    const modal = this.modalService.open(TraktComponent);
    modal.componentInstance.isMovie = this.anime.media_type === 'movie';
    modal.componentInstance.title = this.anime.my_extension?.series || this.anime.title;
    modal.closed.subscribe(value => {
      if (this.editExtension) this.editExtension.trakt = String(value);
    });
  }

  async findAnisearch() {
    if (!this.anime || !this.editExtension) return;
    const modal = this.modalService.open(AnisearchComponent);
    modal.componentInstance.query = this.anime.title;
    modal.closed.subscribe(value => {
      if (this.editExtension) this.editExtension.anisearchId = Number(value);
    });
  }

  getDay(day?: number): string {
    if (!day && day !== 0) return '';
    return moment().day(day).format('dddd');
  }

  async getRatings() {
    if (!this.getRating('trakt')) {
      this.trakt
        .getRating(
          this.anime?.my_extension?.trakt,
          this.anime?.media_type === 'movie' ? -1 : this.anime?.my_extension?.seasonNumber || 1,
        )
        .then(rating => {
          this.setRating('trakt', rating);
        });
    }
    if (!this.getRating('mal')) {
      this.mal.getRating(this.anime?.my_extension?.malId).then(rating => {
        this.setRating('mal', rating);
      });
    }
    if (!this.getRating('anilist')) {
      this.anilist.getRating(this.anime?.my_extension?.anilistId).then(rating => {
        this.setRating('anilist', rating);
      });
    }
    if (!this.getRating('kitsu')) {
      this.kitsu.getRating(Number(this.anime?.my_extension?.kitsuId?.kitsuId)).then(rating => {
        this.setRating('kitsu', rating);
      });
    }
    if (!this.getRating('simkl')) {
      this.simkl.getRating(this.anime?.my_extension?.simklId).then(rating => {
        this.setRating('simkl', rating);
      });
    }
    if (!this.getRating('annict')) {
      this.annict.getRating(this.anime?.my_extension?.annictId).then(rating => {
        this.setRating('annict', rating);
      });
    }
    if (!this.getRating('anisearch')) {
      this.anisearch.getRating(this.anime?.my_extension?.anisearchId).then(rating => {
        this.setRating('anisearch', rating);
      });
    }
  }

  get meanRating(): number {
    if (this.anime?.my_list_status?.score) return this.anime?.my_list_status?.score * 10;
    let count = 0;
    const weighted = this.ratings.map(rating => {
      count += rating.rating.ratings || 0;
      return rating.rating.norm * (rating.rating.ratings || 0);
    });
    if (count) return weighted.reduce((prev, curr) => prev + curr) / count;
    return 0;
  }

  getRating(provider: string): { provider: string; rating: ExtRating } | undefined {
    return this.ratings.filter(rat => rat.provider === provider).pop();
  }

  setRating(provider: string, rating?: ExtRating) {
    if (rating) {
      let exists = false;
      this.ratings.forEach(rat => {
        if (rat.provider === provider) {
          rat.rating = rating;
          exists = true;
        }
      });
      if (!exists) this.ratings.push({ provider, rating });
    }
  }
}
