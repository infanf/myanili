import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { LiveactionSubject } from '@models/liveaction';
import { AnisearchRelated, AnisearchService } from '@services/anisearch.service';
import { LiveactionService } from '@services/liveaction/liveaction.service';

interface RelatedLiveaction {
  title: string;
  poster?: string;
  mediaType: 'movie' | 'tv';
  year?: string;
  /** Internal route for Bangumi entries, external URL for aniSearch entries */
  route?: string;
  link?: string;
}

@Component({
  selector: 'myanili-liveaction-related',
  templateUrl: './liveaction.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class LiveactionRelatedComponent implements OnChanges {
  @Input() anisearchId?: number;
  @Input() bangumiId?: number;
  @Input() type: 'anime' | 'manga' = 'anime';
  related_liveaction: RelatedLiveaction[] = [];

  constructor(
    private anisearch: AnisearchService,
    private liveaction: LiveactionService,
    private router: Router,
  ) {}

  async ngOnChanges() {
    this.related_liveaction = [];
    const bangumiId = this.bangumiId;
    const anisearchId = this.anisearchId;
    if (bangumiId) {
      const subjects = await this.liveaction.getRelated(bangumiId, this.type);
      if (bangumiId !== this.bangumiId) return;
      this.related_liveaction = await Promise.all(
        subjects.map(subject => this.fromBangumi(subject)),
      );
    }
    // aniSearch only links out, so it is used as a fallback for entries without Bangumi data
    if (!this.related_liveaction.length && anisearchId) {
      const related = await this.anisearch.getRelated(anisearchId, this.type);
      if (anisearchId !== this.anisearchId) return;
      this.related_liveaction = related
        .filter(entry => entry.type === 'movie')
        .map(entry => this.fromAnisearch(entry));
    }
  }

  private async fromBangumi(subject: LiveactionSubject): Promise<RelatedLiveaction> {
    const meta = await this.liveaction.getMeta(subject.id);
    return {
      title: meta?.title || subject.name,
      poster: meta?.poster || subject.images?.common || subject.images?.medium,
      mediaType: meta?.mediaType === 'movie' || subject.platform === '电影' ? 'movie' : 'tv',
      year: subject.date?.substring(0, 4),
      route: `/liveaction/details/${subject.id}`,
    };
  }

  private fromAnisearch(entry: AnisearchRelated): RelatedLiveaction {
    return {
      title: entry.title,
      poster: entry.poster,
      mediaType: entry.media_type?.toLowerCase().includes('movie') ? 'movie' : 'tv',
      year: entry.year ? String(entry.year) : undefined,
      link: entry.link,
    };
  }

  open(entry: RelatedLiveaction) {
    if (entry.route) {
      this.router.navigateByUrl(entry.route);
    } else if (entry.link) {
      window.open(entry.link, '_blank');
    }
  }
}
