import { Injectable } from '@angular/core';
import { statusFromMal } from '@models/anilist';
import {
  Anime,
  AnimeNode,
  ListAnime,
  MyAnimeStatus,
  MyAnimeUpdateExtended,
  parseExtension,
  WatchStatus,
} from '@models/anime';
import { Weekday } from '@models/components';
import { Jikan4AnimeCharacter, Jikan4Staff, Jikan4WorkRelation } from '@models/jikan';
import { RelatedManga } from '@models/manga';
import { AnilistService } from '@services/anilist.service';
import { AnnictService } from '@services/anime/annict.service';
import { SimklService } from '@services/anime/simkl.service';
import { TraktService } from '@services/anime/trakt.service';
import { AnisearchService } from '@services/anisearch.service';
import { CacheService } from '@services/cache.service';
import { DialogueService } from '@services/dialogue.service';
import { GlobalService } from '@services/global.service';
import { KitsuService } from '@services/kitsu.service';
import { MalService } from '@services/mal.service';
import { SettingsService } from '@services/settings.service';
import { ShikimoriService } from '@services/shikimori.service';
import { Base64 } from 'js-base64';
import { DateTime, WeekdayNumbers } from 'luxon';

import { LivechartService } from './livechart.service';

@Injectable({
  providedIn: 'root',
})
export class AnimeService {
  nsfw = true;
  constructor(
    private malService: MalService,
    private anilist: AnilistService,
    private kitsu: KitsuService,
    private anisearch: AnisearchService,
    private shikimori: ShikimoriService,
    private simkl: SimklService,
    private annict: AnnictService,
    private trakt: TraktService,
    private livechart: LivechartService,
    private cache: CacheService,
    private settings: SettingsService,
    private dialogue: DialogueService,
    private glob: GlobalService,
  ) {
    this.settings.nsfw$.asObservable().subscribe(nsfw => {
      this.nsfw = nsfw;
    });
  }

  async list(
    status?: WatchStatus | WatchStatus[],
    options?: { limit?: number; sort?: string; offset?: number },
  ): Promise<ListAnime[]> {
    options = { limit: 50, offset: 0, ...options };
    if (Array.isArray(status)) {
      const animeArray = await Promise.all(status.map(s => this.list(s, options)));
      return animeArray.flat();
    }
    const animes = await this.malService.myList(status, options);
    return animes.map(anime => {
      if (anime.node.title) {
        this.fixBroadcast(anime.node);
        const animeToSave = {
          id: anime.node.id,
          title: anime.node.title,
          created_at: new Date(),
          updated_at: anime.list_status.updated_at,
          mean: 0,
          num_episodes: anime.node.num_episodes || 0,
          media_type: anime.node.media_type || 'unknown',
          num_list_users: 0,
          num_scoring_users: 0,
          recommendations: [],
          related_manga: [],
          related_anime: [],
          studios: [],
          genres: [],
          opening_themes: [],
          ending_themes: [],
          pictures: [],
        };
        this.cache.saveValues(anime.node.id, 'anime', animeToSave);
      }
      const comments = anime.list_status.comments;
      if (!comments) return anime;
      try {
        const my_extension = parseExtension(comments);
        return { ...anime, my_extension } as ListAnime;
      } catch (e) {}
      return anime;
    });
  }
  async season(year: number, season: number): Promise<Array<Partial<Anime>>> {
    const animes = (
      await this.malService.get<Array<{ node: AnimeNode }>>(`animes/season/${year}/${season}`)
    )
      .filter(anime => (this.nsfw ? true : anime.node.rating !== 'rx'))
      .map(anime => anime.node);
    return animes.map(anime => {
      this.fixBroadcast(anime);
      const comments = anime.my_list_status?.comments;
      if (!comments) return anime;
      try {
        const my_extension = parseExtension(comments);
        return { ...anime, my_extension } as Anime;
      } catch (e) {}
      return anime as Anime;
    });
  }

  async getAnime(id: number) {
    const anime = await this.malService.get<Anime>('anime/' + id);
    const extension = `${anime.my_list_status?.comments}`;
    if (!anime.related_manga.length) anime.related_manga_promise = this.getManga(id);
    if (!anime.website) anime.website_promise = this.getWebsite(id);
    this.fixBroadcast(anime);
    const animeToSave = { ...anime } as Partial<Anime>;
    delete animeToSave.my_list_status;
    delete animeToSave.website_promise;
    delete animeToSave.related_manga_promise;
    if (extension) {
      animeToSave.my_extension = parseExtension(extension);
      anime.my_extension = animeToSave.my_extension;
    }
    this.cache.saveValues(anime.id, 'anime', animeToSave, true);
    return anime;
  }

  async addAnime(
    anime: Partial<Anime>,
    data: MyAnimeUpdateExtended = { status: 'plan_to_watch', is_rewatching: false },
  ): Promise<MyAnimeStatus | undefined> {
    if (!anime.id) return;
    if (
      anime.media_type !== 'movie' &&
      anime.media_type !== 'special' &&
      (!anime.num_episodes || anime.num_episodes > 3)
    ) {
      const episodeRule = await this.dialogue.open(
        `Do you want to set yourself an episode rule for "${anime.title}"?
          You will be asked if you want to continue watching after set episodes.`,
        'Add anime',
        [
          { label: '1 Episode', value: 1 },
          { label: '3 Episodes', value: 3 },
          { label: 'Just add', value: 0 },
        ],
        0,
      );
      if (episodeRule) {
        data.extension = Base64.encode(JSON.stringify({ episodeRule }));
      }
    }
    return await this.updateAnime(
      {
        malId: anime.id,
        anilistId: anime.my_extension?.anilistId,
        kitsuId: anime.my_extension?.kitsuId,
        anisearchId: anime.my_extension?.anisearchId,
        simklId: anime.my_extension?.simklId,
        annictId: anime.my_extension?.annictId,
        livechartId: anime.my_extension?.livechartId,
      },
      data,
    );
  }

  async updateAnime(
    ids: {
      malId: number;
      anilistId?: number;
      kitsuId?: { kitsuId: number | string; entryId?: string | undefined };
      anisearchId?: number;
      simklId?: number;
      annictId?: number;
      trakt?: { id?: string; season?: number };
      livechartId?: number;
    },
    data: MyAnimeUpdateExtended,
  ): Promise<MyAnimeStatus> {
    const [malResponse] = await Promise.all([
      this.malService.put<MyAnimeStatus>('anime/' + ids.malId, data),
      (async () => {
        if (this.anilist.loggedIn) {
          if (!ids.anilistId) {
            ids.anilistId = await this.anilist.getId(ids.malId, 'ANIME');
          }
          if (!ids.anilistId) return;
          const startDate = data.start_date ? DateTime.fromISO(data.start_date) : undefined;
          const finishDate = data.finish_date ? DateTime.fromISO(data.finish_date) : undefined;
          return this.anilist.updateEntry(ids.anilistId, {
            progress: data.num_watched_episodes,
            scoreRaw: data.score ? data.score * 10 : undefined,
            status: statusFromMal(data.status, data.is_rewatching),
            notes: data.comments,
            repeat: data.num_times_rewatched,
            startedAt: startDate
              ? {
                  year: startDate.year,
                  month: startDate.month,
                  day: startDate.day,
                }
              : undefined,
            completedAt: finishDate
              ? {
                  year: finishDate.year,
                  month: finishDate.month,
                  day: finishDate.day,
                }
              : undefined,
          });
        }
        return;
      })(),
      (async () => {
        if (!ids.kitsuId) {
          ids.kitsuId = await this.kitsu.getId({ id: ids.malId }, 'anime');
        }
        if (!ids.kitsuId) return;
        return this.kitsu.updateEntry(ids.kitsuId, 'anime', {
          progress: data.num_watched_episodes,
          ratingTwenty: (data.score || 0) * 2 || undefined,
          status: this.kitsu.statusFromMal(data.status),
          notes: data.comments,
          startedAt: data.start_date,
          finishedAt: data.finish_date,
          reconsuming: data.is_rewatching,
          reconsumeCount: data.num_times_rewatched,
        });
      })(),
      (async () => {
        if (!ids.anisearchId) {
          ids.anisearchId = await this.anisearch.getId(ids.malId, 'anime');
        }
        if (!ids.anisearchId) return;
        return this.anisearch.updateEntry(ids.anisearchId, data, 'anime');
      })(),
      this.shikimori.updateMedia({
        target_id: ids.malId,
        target_type: 'Anime',
        score: data.score,
        status: data.is_rewatching ? 'rewatching' : this.shikimori.statusFromMal(data.status),
        episodes: data.num_watched_episodes,
        rewatches: data.num_times_rewatched,
        text: data.comments,
      }),
      this.simkl.updateEntry({ simkl: ids.simklId, mal: ids.malId }, data),
      this.annict.updateEntry(ids.annictId, data),
      this.trakt.updateEntry(ids.trakt, data),
      this.livechart.updateAnime(ids.livechartId, data),
    ]);
    return malResponse;
  }

  async deleteAnime(ids: {
    malId: number;
    anilistId?: number;
    kitsuId?: { kitsuId: number | string; entryId?: string | undefined };
    anisearchId?: number;
    simklId?: number;
    annictId?: number;
    traktId?: string;
    livechartId?: number;
  }) {
    await Promise.all([
      this.malService.delete<MyAnimeStatus>('anime/' + ids.malId),
      this.anilist.deleteEntry(ids.anilistId),
      this.kitsu.deleteEntry(ids.kitsuId, 'anime'),
      this.anisearch.deleteEntry(ids.anisearchId),
      this.shikimori.deleteMedia(ids.malId, 'Anime'),
      this.simkl.deleteEntry(ids.simklId),
      this.annict.updateStatus(ids.annictId, 'no_select'),
      this.trakt.drop(ids.traktId),
      this.livechart.deleteAnime(ids.livechartId),
    ]);
    return true;
  }

  async getWebsite(id: number): Promise<string | undefined> {
    const links = await this.malService.getJikanData<Array<{ name: string; url: string }>>(
      `anime/${id}/external`,
    );
    const website = links?.find(link => link.name.includes('Official'));
    return website?.url;
  }

  async getManga(id: number): Promise<RelatedManga[]> {
    const relationTypes = await this.malService.getJikanData<Jikan4WorkRelation[]>(
      `anime/${id}/relations`,
    );
    const mangas = [] as RelatedManga[];
    for (const relationType of relationTypes) {
      for (const related of relationType.entry) {
        if (related.type === 'manga') {
          mangas.push({
            node: { id: related.mal_id, title: related.name },
            relation_type: relationType.relation.replace(' ', '_').toLowerCase(),
            relation_type_formatted: relationType.relation,
          });
        }
      }
    }
    return mangas;
  }

  async getCharacters(id: number): Promise<Jikan4AnimeCharacter[]> {
    const characters = await this.malService.getJikanData<Jikan4AnimeCharacter[]>(
      `anime/${id}/characters`,
    );
    return characters || [];
  }

  async getStaff(id: number): Promise<Jikan4Staff[]> {
    const staff = await this.malService.getJikanData<Jikan4Staff[]>(`anime/${id}/staff`);
    return staff || [];
  }

  /**
   * takes an array of weekday numbers and returns the last day of them before the given/current weekday
   * @param days array of weekday numbers
   * @param today current weekday number
   * @returns the last day of the given weekdays before the current weekday (0-6)
   */
  getLastDay(days: number | number[], today?: number): Weekday {
    if (typeof days === 'number') {
      return (Math.floor(days) % 7) as Weekday;
    }
    days = days.map(d => Math.floor(d) % 7);
    const mapper = (d: number) => {
      const todayFinal = today || DateTime.now().weekday % 7;
      const delta = (6 + d - todayFinal) % 7;
      return delta;
    };
    return days.sort((a, b) => mapper(b) - mapper(a))[0] as Weekday;
  }

  getDay(day?: number | number[]): string {
    if (!day && day !== 0) return '';
    if (typeof day === 'object') {
      day = this.getLastDay(day);
    }
    return DateTime.now()
      .set({ weekday: this.glob.toWeekday(day as number) })
      .toFormat('cccc');
  }

  async getPoster(id: number): Promise<string | undefined> {
    let anime;
    try {
      anime = await this.cache.getValues<Anime>(id, 'anime');
    } catch (e) {}
    if (!anime?.main_picture) anime = await this.getAnime(id);
    return anime?.main_picture?.large || anime?.main_picture?.medium;
  }

  /**
   * Converts brodcast day and time from JST to local timezone
   */
  fixBroadcast(anime: Anime | AnimeNode) {
    if (anime.broadcast?.day_of_the_week && anime.broadcast?.start_time) {
      let date = DateTime.now().setZone('Asia/Tokyo');
      let weekday: WeekdayNumbers | undefined;
      switch (anime.broadcast.day_of_the_week) {
        case 'monday':
          weekday = 1;
          break;
        case 'tuesday':
          weekday = 2;
          break;
        case 'wednesday':
          weekday = 3;
          break;
        case 'thursday':
          weekday = 4;
          break;
        case 'friday':
          weekday = 5;
          break;
        case 'saturday':
          weekday = 6;
          break;
        case 'sunday':
          weekday = 7;
          break;
        default:
          weekday = undefined;
          break;
      }
      date = date.set({
        weekday,
        hour: Number(anime.broadcast.start_time.split(':')[0]),
        minute: Number(anime.broadcast.start_time.split(':')[1]),
        second: 0,
        millisecond: 0,
      });
      anime.broadcast.weekday = date.setZone('system').weekday % 7;
      anime.broadcast.day_of_the_week = date.setZone('system').toFormat('cccc');
      anime.broadcast.start_time = date.setZone('system').toFormat('HH:mm');
    }
  }

  async getTraktData(
    malId?: number,
    simklId?: number,
    season?: number,
  ): Promise<
    | {
        id: number;
        type: 'show' | 'movie';
        title: string;
        season?: number;
      }
    | undefined
  > {
    if (!malId && !simklId) return undefined;
    if (!simklId && malId) {
      simklId = await this.simkl.getId(malId);
    }
    if (!simklId) return undefined;
    const simklData = await this.simkl.getEntry(simklId);
    const imdbId = simklData?.ids.imdb;
    if (!imdbId) {
      if (simklData?.relations?.length && !season) {
        season = simklData?.season;
        for (const relation of simklData.relations) {
          const result = await this.getTraktData(undefined, relation.ids.simkl, season);
          if (result) return result;
        }
      }
      return undefined;
    }
    const traktData = await this.trakt.searchByImdb(imdbId);
    console.log(traktData);
    const data = traktData.map(entry => {
      if (entry.type === 'movie') {
        return {
          id: entry.movie.ids.trakt,
          type: 'movie' as const,
          title: entry.movie.title,
        };
      }
      return {
        id: entry.show.ids.trakt,
        type: 'show' as const,
        title: entry.show.title,
        season,
      };
    });
    return data[0];
  }
}
