import { Injectable } from '@angular/core';
import { ToasterService } from '@components/toaster/toaster.service';
import { WatchStatus } from '@models/anime';
import {
  collectionToStatus,
  EXCLUDED_PLATFORMS,
  ListLiveaction,
  Liveaction,
  LiveactionCollection,
  LiveactionIds,
  LiveactionMeta,
  LiveactionSubject,
  LiveactionUpdate,
  RelatedLiveaction,
  statusToCollection,
  TmdbSearchResult,
} from '@models/liveaction';
import { BangumiService } from '@services/anime/bangumi.service';
import { SimklService } from '@services/anime/simkl.service';
import { TraktService } from '@services/anime/trakt.service';
import { AnisearchService } from '@services/anisearch.service';
import { CacheService } from '@services/cache.service';
import { environment } from 'src/environments/environment';

import { MydramalistService } from './mydramalist.service';

/**
 * Live action adaptations. Bangumi (subject_type 6) is the data source and
 * the user's collection on Bangumi is the leading list. English metadata is
 * resolved by the backend from TMDB; Trakt and SIMKL are mirrored.
 */
@Injectable({
  providedIn: 'root',
})
export class LiveactionService {
  private readonly metaTtl = 60 * 60 * 24;

  private readonly mirrorServiceNames = ['Trakt', 'SIMKL', 'MyDramaList'] as const;

  constructor(
    private bangumi: BangumiService,
    private trakt: TraktService,
    private simkl: SimklService,
    private mydramalist: MydramalistService,
    private anisearch: AnisearchService,
    private cache: CacheService,
    private toaster: ToasterService,
  ) {}

  get user() {
    return this.bangumi.user;
  }

  /**
   * Search Bangumi for live action subjects. `more` tells whether Bangumi has
   * further pages, since excluded platforms may shrink a page.
   */
  async search(
    keyword: string,
    limit = 20,
    offset = 0,
  ): Promise<{ results: ListLiveaction[]; more: boolean }> {
    const subjects = await this.bangumi.getLiveactions(keyword, limit, offset);
    const results = await Promise.all(
      subjects
        .filter(subject => !EXCLUDED_PLATFORMS.includes(subject.platform || ''))
        .map(async subject => ({ subject, meta: await this.getMeta(subject.id) })),
    );
    return { results, more: subjects.length >= limit };
  }

  async getLiveaction(id: number): Promise<Liveaction | undefined> {
    const [subject, meta, collection] = await Promise.all([
      this.bangumi.getSubject(id),
      this.getMeta(id),
      this.bangumi.getCollection(id),
    ]);
    if (!subject) return undefined;
    return {
      ...subject,
      meta,
      my_list_status: collection ? this.toListStatus(collection) : undefined,
    };
  }

  async getMeta(id: number): Promise<LiveactionMeta | undefined> {
    try {
      const meta = await this.cache.fetch<LiveactionMeta>(this.metaUrl(id), this.metaTtl);
      // Unresolved entries may be mapped soon (manually or once TMDB is reachable)
      if (meta.source === 'none') this.cache.updateFetch(this.metaUrl(id), meta, 600);
      return meta;
    } catch {
      return undefined;
    }
  }

  async list(status: WatchStatus, limit = 50, offset = 0): Promise<ListLiveaction[]> {
    const collections = await this.bangumi.getCollections(
      6,
      statusToCollection(status),
      limit,
      offset,
    );
    return Promise.all(
      collections.flatMap(collection =>
        collection.subject
          ? [
              (async () => ({
                subject: collection.subject as LiveactionSubject,
                list_status: this.toListStatus(collection),
                meta: await this.getMeta(collection.subject_id),
              }))(),
            ]
          : [],
      ),
    );
  }

  /**
   * Bangumi is the leading list, so its failure is thrown. Failing mirrors
   * only show a toast.
   */
  async update(liveaction: Liveaction, data: LiveactionUpdate): Promise<void> {
    await this.bangumi.updateLiveaction(liveaction.id, data);
    const ids = this.getIds(liveaction.meta);
    const previous = liveaction.my_list_status;
    const results = await Promise.allSettled([
      ids
        ? this.trakt.updateLiveaction(ids, data, {
            status: previous?.status,
            episodes: previous?.num_watched_episodes,
          })
        : Promise.resolve(),
      ids
        ? this.simkl.updateLiveaction(ids, data, previous?.num_watched_episodes)
        : Promise.resolve(),
      this.mydramalist.updateEntry(liveaction.meta?.mdl, data),
    ]);
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        this.toaster.addError(
          `${this.mirrorServiceNames[i]} update failed. Please try again later.`,
          0,
        );
      }
    });
  }

  async delete(liveaction: Liveaction): Promise<void> {
    await this.bangumi.deleteEntry(liveaction.id);
    const ids = this.getIds(liveaction.meta);
    const results = await Promise.allSettled([
      ids ? this.trakt.deleteLiveaction(ids) : Promise.resolve(),
      ids ? this.simkl.deleteLiveaction(ids) : Promise.resolve(),
      this.mydramalist.deleteEntry(liveaction.meta?.mdl),
    ]);
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        this.toaster.addError(
          `${this.mirrorServiceNames[i]} delete failed. Please try again later.`,
          0,
        );
      }
    });
  }

  getIds(meta?: LiveactionMeta): LiveactionIds | undefined {
    if (!meta || (!meta.tmdb && !meta.imdb)) return undefined;
    return {
      tmdb: meta.tmdb,
      imdb: meta.imdb || undefined,
      mediaType: meta.mediaType,
      season: meta.season || 1,
    };
  }

  /** Number of episodes, movies count as a single episode */
  getEpisodes(subject: LiveactionSubject, meta?: LiveactionMeta): number {
    if (meta?.mediaType === 'movie' || subject.platform === '电影') return 1;
    return (
      subject.total_episodes ||
      subject.eps ||
      meta?.seasons?.find(season => season.number === meta.season)?.episodes ||
      0
    );
  }

  /** Store a manual TMDB/aniSearch/MDL mapping; shared with all users of this backend */
  async setMapping(
    id: number,
    mapping: {
      type: 'movie' | 'tv';
      tmdb?: number;
      season?: number;
      anisearch?: number;
      mdl?: string;
    },
  ): Promise<LiveactionMeta | undefined> {
    const auth = this.bangumi.accessTokenHeader;
    if (!auth) throw new Error('Bangumi login required');
    const response = await fetch(`${environment.backend}liveaction/mapping/${id}`, {
      method: 'PUT',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...mapping, season: mapping.season || 1 }),
    });
    if (!response.ok) throw new Error(`Mapping failed: HTTP ${response.status}`);
    const meta = (await response.json()) as LiveactionMeta;
    this.cache.updateFetch(this.metaUrl(id), meta, this.metaTtl);
    return meta;
  }

  async searchTmdb(
    type: 'movie' | 'tv',
    query: string,
    year?: number,
  ): Promise<TmdbSearchResult[]> {
    const url = new URL(`${environment.backend}liveaction/tmdb/search/${type}`);
    url.searchParams.set('query', query);
    if (year) url.searchParams.set('year', String(year));
    try {
      return await this.cache.fetch<TmdbSearchResult[]>(url.toString());
    } catch {
      return [];
    }
  }

  /**
   * Live action adaptations of an anime or manga on Bangumi. Bangumi rarely
   * links live action subjects to anime directly, so for anime the
   * adaptations of the source material (books) are included as well.
   */
  async getRelated(bangumiId: number, type: 'anime' | 'manga'): Promise<LiveactionSubject[]> {
    const related = await this.bangumi.getRelatedSubjects(bangumiId);
    const subjects = related.filter(subject => subject.type === 6);
    if (type === 'anime') {
      const sources = related.filter(subject => subject.type === 1).slice(0, 3);
      const sourceRelations = await Promise.all(
        sources.map(source => this.bangumi.getRelatedSubjects(source.id)),
      );
      subjects.push(...sourceRelations.flat().filter(subject => subject.type === 6));
    }
    const unique = subjects.filter(
      (subject, index) => subjects.findIndex(other => other.id === subject.id) === index,
    );
    const details = await Promise.all(unique.map(subject => this.bangumi.getSubject(subject.id)));
    return details
      .filter((subject): subject is LiveactionSubject => !!subject)
      .filter(subject => !EXCLUDED_PLATFORMS.includes(subject.platform || ''))
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }

  /**
   * Live action adaptations for anime/manga details: Bangumi entries open in
   * MyAniLi; aniSearch (external links only) is the fallback without Bangumi data.
   */
  async getRelatedAdaptations(
    ids: { bangumiId?: number; anisearchId?: number },
    type: 'anime' | 'manga',
  ): Promise<RelatedLiveaction[]> {
    if (ids.bangumiId) {
      const subjects = await this.getRelated(ids.bangumiId, type);
      if (subjects.length) {
        return Promise.all(
          subjects.map(async subject => {
            const meta = await this.getMeta(subject.id);
            return {
              title: meta?.title || subject.name,
              poster: meta?.poster || subject.images?.common || subject.images?.medium,
              mediaType:
                meta?.mediaType === 'movie' || subject.platform === '电影' ? 'movie' : 'tv',
              year: subject.date?.substring(0, 4),
              route: `/liveaction/details/${subject.id}`,
            } as RelatedLiveaction;
          }),
        );
      }
    }
    if (!ids.anisearchId) return [];
    const related = await this.anisearch.getRelated(ids.anisearchId, type);
    return related
      .filter(entry => entry.type === 'movie')
      .map(entry => ({
        title: entry.title,
        poster: entry.poster,
        mediaType: entry.media_type?.toLowerCase().includes('movie') ? 'movie' : 'tv',
        year: entry.year ? String(entry.year) : undefined,
        link: entry.link,
      }));
  }

  private toListStatus(collection: LiveactionCollection) {
    return {
      status: collectionToStatus(collection.type),
      score: collection.rate,
      num_watched_episodes: collection.ep_status,
      comment: collection.comment,
      updated_at: collection.updated_at,
    };
  }

  private metaUrl(id: number) {
    // Bump the version when the meta format changes to invalidate cached entries
    return `${environment.backend}liveaction/meta/${id}?v=6`;
  }
}
