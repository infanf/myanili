import { Injectable } from '@angular/core';
import {
  Anime,
  AnimeCharacter,
  AnimeExtension,
  AnimeNode,
  AnimeStaff,
  ListAnime,
  MyAnimeStatus,
  MyAnimeUpdate,
  WatchStatus,
} from '@models/anime';
import { Weekday } from '@models/components';
import { RelatedManga } from '@models/manga';
import { Base64 } from 'js-base64';
import { DateTime } from 'luxon';
import { environment } from 'src/environments/environment';

import { AnilistService } from '../anilist.service';
import { CacheService } from '../cache.service';
import { KitsuService } from '../kitsu.service';
import { MalService } from '../mal.service';
import { SettingsService } from '../settings/settings.service';

import { AnnictService } from './annict.service';
import { SimklService } from './simkl.service';
import { TraktService } from './trakt.service';

@Injectable({
  providedIn: 'root',
})
export class AnimeService {
  private backendUrl = `${environment.backend}`;
  nsfw = true;
  constructor(
    private malService: MalService,
    private anilist: AnilistService,
    private kitsu: KitsuService,
    private simkl: SimklService,
    private annict: AnnictService,
    private trakt: TraktService,
    private cache: CacheService,
    private settings: SettingsService,
  ) {
    this.settings.nsfw.subscribe(nsfw => {
      this.nsfw = nsfw;
    });
  }

  async list(status?: WatchStatus) {
    const animes = await this.malService.myList(status);
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
        const json = Base64.decode(comments);
        const my_extension = JSON.parse(json) as AnimeExtension;
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
        const json = Base64.decode(comments);
        const my_extension = JSON.parse(json) as AnimeExtension;
        return { ...anime, my_extension } as Anime;
      } catch (e) {}
      return anime as Anime;
    });
  }

  async getAnime(id: number) {
    const anime = await this.malService.get<Anime>('anime/' + id);
    const comments = anime.my_list_status?.comments;
    if (!anime.related_manga.length) anime.related_manga_promise = this.getManga(id);
    if (!anime.website) anime.website_promise = this.getWebsite(id);
    this.fixBroadcast(anime);
    const animeToSave = { ...anime } as Partial<Anime>;
    delete animeToSave.my_list_status;
    delete animeToSave.website_promise;
    delete animeToSave.related_manga_promise;
    if (comments) {
      try {
        const json = Base64.decode(comments);
        const my_extension = JSON.parse(json) as AnimeExtension;
        anime.my_extension = my_extension;
        animeToSave.my_extension = my_extension;
      } catch (e) {}
    }
    this.cache.saveValues(anime.id, 'anime', animeToSave, true);
    return anime;
  }

  async updateAnime(
    ids: {
      malId: number;
      anilistId?: number;
      kitsuId?: { kitsuId: number | string; entryId?: string | undefined };
      simklId?: number;
      annictId?: number;
      trakt?: { id?: string; season?: number };
    },
    data: Partial<MyAnimeUpdate>,
  ): Promise<MyAnimeStatus> {
    const [malResponse] = await Promise.all([
      this.malService.put<MyAnimeStatus>('anime/' + ids.malId, data),
      (async () => {
        if (this.anilist.loggedIn) {
          if (!ids.anilistId) {
            ids.anilistId = await this.anilist.getId(ids.malId, 'ANIME');
          }
          if (!ids.anilistId) return;
          return this.anilist.updateEntry(ids.anilistId, {
            progress: data.num_watched_episodes,
            scoreRaw: data.score ? data.score * 10 : undefined,
            status: this.anilist.statusFromMal(data.status, data.is_rewatching),
            notes: data.comments,
            repeat: data.num_times_rewatched,
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
          reconsuming: data.is_rewatching,
          reconsumeCount: data.num_times_rewatched,
        });
      })(),
      this.simkl.updateEntry({ simkl: ids.simklId, mal: ids.malId }, data),
      this.annict.updateEntry(ids.annictId, data),
      this.trakt.updateEntry(ids.trakt, data),
    ]);
    return malResponse;
  }

  async deleteAnime(ids: {
    malId: number;
    anilistId?: number;
    kitsuId?: { kitsuId: number | string; entryId?: string | undefined };
    simklId?: number;
    annictId?: number;
    traktId?: string;
  }) {
    await Promise.all([
      this.malService.delete<MyAnimeStatus>('anime/' + ids.malId),
      this.anilist.deleteEntry(ids.anilistId),
      this.kitsu.deleteEntry(ids.kitsuId, 'anime'),
      this.simkl.deleteEntry(ids.simklId),
      this.annict.updateStatus(ids.annictId, 'no_select'),
      this.trakt.ignore(ids.traktId),
    ]);
    return true;
  }

  async getWebsite(id: number): Promise<string | undefined> {
    const jikanime = await this.malService.getJikan('anime', id);
    const website = jikanime.external_links.find(link => link.name.includes('Official'));
    return website?.url;
  }

  async getManga(id: number): Promise<RelatedManga[]> {
    const jikanime = await this.malService.getJikan('anime', id);
    const mangas = [] as RelatedManga[];
    for (const key in jikanime.related) {
      if (!jikanime.related[key]) continue;
      for (const related of jikanime.related[key]) {
        if (related.type === 'manga') {
          mangas.push({
            node: { id: related.mal_id, title: related.name },
            relation_type: key.replace(' ', '_').toLowerCase(),
            relation_type_formatted: key,
          });
        }
      }
    }
    return mangas;
  }

  async getCharacters(id: number): Promise<AnimeCharacter[]> {
    const characterStaff = await this.malService.getJikanData<{ characters?: AnimeCharacter[] }>(
      `anime/${id}/characters_staff`,
      true,
    );
    return characterStaff.characters || [];
  }

  async getStaff(id: number): Promise<AnimeStaff[]> {
    const characterStaff = await this.malService.getJikanData<{ staff?: AnimeStaff[] }>(
      `anime/${id}/characters_staff`,
      true,
    );
    return characterStaff.staff || [];
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
    return DateTime.now().set({ weekday: day }).toFormat('cccc');
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
      let weekday;
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

  async getLivechartId(malId?: number): Promise<number | undefined> {
    if (!malId) return undefined;
    const response = await fetch(`${this.backendUrl}/livechart/${malId}`);
    if (!response.ok) return undefined;
    return ((await response.json()) as { livechart: number }).livechart || undefined;
  }
}
