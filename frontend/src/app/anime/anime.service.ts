import { Injectable } from '@angular/core';
import { MainService } from '@models/components';
import { AnimeCharacter, AnimeStaff, MyAnimeStatus, WatchStatus } from '@models/mal-anime';
import {
  ListMedia,
  Media,
  MediaExtension,
  MediaNode,
  MyMediaUpdate,
  PersonalStatus,
  RelatedMedia,
} from '@models/media';
import { Base64 } from 'js-base64';

import { AnilistService } from '../anilist.service';
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
  private mainService: 'mal' | 'anilist' | 'kitsu' = 'mal';

  constructor(
    private mal: MalService,
    private anilist: AnilistService,
    private kitsu: KitsuService,
    private simkl: SimklService,
    private annict: AnnictService,
    private trakt: TraktService,
    private settings: SettingsService,
  ) {
    this.settings.mainService.subscribe(service => {
      this.mainService = service;
    });
  }

  async list(status?: PersonalStatus) {
    let animes = [] as ListMedia[];
    switch (this.mainService) {
      case 'anilist':
        animes = await this.anilist.myList(status);
        break;
      // case 'kitsu':
      //   animes = await this.kitsu.myList(status);
      //   break;
      default:
        animes = await this.mal.myList(status);
        break;
    }
    return animes.map(anime => {
      const comments = anime.list_status.comments;
      if (!comments) return anime;
      try {
        const json = Base64.decode(comments);
        const my_extension = JSON.parse(json) as MediaExtension;
        return { ...anime, my_extension } as ListMedia;
      } catch (e) {}
      return anime;
    });
  }
  async season(year: number, season: number): Promise<Array<Partial<Media>>> {
    const animes = (
      await this.mal.get<Array<{ node: MediaNode }>>(`/animes/season/${year}/${season}`)
    ).map(anime => anime.node);
    return animes.map(anime => {
      const comments = anime.my_list_status?.comments;
      if (!comments) return anime;
      try {
        const json = Base64.decode(comments);
        const my_extension = JSON.parse(json) as MediaExtension;
        return { ...anime, my_extension } as Media;
      } catch (e) {}
      return anime as Media;
    });
  }

  async getAnime(id: number, service?: MainService) {
    let anime: Media | undefined;
    if (!service) service = this.mainService;
    switch (service) {
      case 'anilist':
        anime = await this.anilist.get(id, 'ANIME');
        break;
      // case 'kitsu':
      //   animes = await this.kitsu.myList(status);
      //   break;
      default:
        anime = await this.mal.getMedia(id);
        // if (!anime.related.length) anime.related_manga = await this.getManga(id);
        break;
    }
    if (!anime) return undefined;
    const comments = anime.my_list_status?.comments;
    if (!anime.related.filter(rel => rel.type === 'manga').length) {
      anime.related_manga_promise = this.getManga(id);
    }
    if (!comments) return anime;
    try {
      const json = Base64.decode(comments);
      const my_extension = JSON.parse(json) as MediaExtension;
      return { ...anime, my_extension };
    } catch (e) {}
    return anime;
  }

  async updateAnime(
    ids: {
      malId?: number;
      anilistId?: number;
      kitsuId?: { kitsuId: number | string; entryId?: string | undefined };
      simklId?: number;
      annictId?: number;
      trakt?: { id?: string; season?: number };
    },
    data: Partial<MyMediaUpdate>,
  ): Promise<MyMediaUpdate | false> {
    const [malResponse, alResponse] = await Promise.all([
      (async () => {
        if (this.mal.loggedIn) {
          if (!ids.malId) {
            return;
          }
          return this.mal.updateAnimeEntry(ids.malId, {
            num_watched_episodes: data.progress,
            score: data.score,
            status: this.mal.toMalStatus(data.status, 'anime') as WatchStatus,
            comments: data.comments,
            num_times_rewatched: data.repeats,
            is_rewatching: data.repeating,
          });
        }
        return;
      })(),
      (async () => {
        if (this.anilist.loggedIn) {
          if (!ids.anilistId && ids.malId) {
            ids.anilistId = await this.anilist.getId(ids.malId, 'ANIME');
          }
          if (!ids.anilistId) return;
          return this.anilist.updateEntry(ids.anilistId, {
            progress: data.progress,
            scoreRaw: data.score ? data.score * 10 : undefined,
            status: this.anilist.toAlStatus(data.status, data.repeating),
            notes: data.comments,
            repeat: data.repeats,
          });
        }
        return;
      })(),
      (async () => {
        if (!ids.kitsuId && ids.malId) {
          ids.kitsuId = await this.kitsu.getId(ids.malId, 'anime');
        }
        if (!ids.kitsuId) return;
        return this.kitsu.updateEntry(ids.kitsuId, 'anime', {
          progress: data.progress,
          ratingTwenty: (data.score || 0) * 2 || undefined,
          status: this.kitsu.toKitsuStatus(data.status),
          notes: data.comments,
          reconsuming: data.repeating,
          reconsumeCount: data.repeats,
        });
      })(),
      this.simkl.updateEntry({ simkl: ids.simklId, mal: ids.malId }, data),
      this.annict.updateEntry(ids.annictId, data),
      this.trakt.updateEntry(ids.trakt, data),
    ]);
    if (ids.malId && malResponse) {
      return {
        comments: malResponse.comments,
        priority: malResponse.priority,
        progress: malResponse.num_episodes_watched,
        repeat_value: malResponse.rewatch_value,
        repeating: malResponse.is_rewatching,
        repeats: malResponse.num_times_rewatched,
        score: malResponse.score,
        tags: malResponse.tags?.join(','),
        status: this.mal.fromMalStatus(malResponse.status) || data.status || 'planning',
      };
    } else if (ids.anilistId && alResponse) {
      return {
        comments: alResponse.notes,
        priority: alResponse.priority,
        progress: alResponse.progress,
        repeat_value: 0,
        repeating: alResponse.status === 'REPEATING',
        repeats: alResponse.repeat,
        score: alResponse.score / 10,
        tags: '',
        status: this.anilist.fromAlStatus(alResponse.status) || data.status || 'planning',
      };
    }
    return false;
  }

  async deleteAnime(ids: {
    malId: number;
    anilistId?: number;
    kitsuId?: { kitsuId: number | string; entryId?: string | undefined };
    simklId?: number;
    annictId?: number;
  }) {
    await Promise.all([
      this.mal.delete<MyAnimeStatus>('anime/' + ids.malId),
      this.anilist.deleteEntry(ids.anilistId),
      this.kitsu.deleteEntry(ids.kitsuId, 'anime'),
      this.simkl.deleteEntry(ids.simklId),
      this.annict.updateStatus(ids.annictId, 'no_select'),
    ]);
    return true;
  }

  async getManga(id: number): Promise<RelatedMedia[]> {
    const jikanime = await this.mal.getJikan('anime', id);
    const mangas = [] as RelatedMedia[];
    for (const key in jikanime.related) {
      if (!jikanime.related[key]) continue;
      for (const related of jikanime.related[key]) {
        if (related.type === 'manga') {
          mangas.push({
            node: { id: related.mal_id, title: related.name, num_parts: 0 },
            relation_type: key.replace(' ', '_').toLowerCase(),
            relation_type_formatted: key,
            type: 'manga',
          });
        }
      }
    }
    return mangas;
  }

  async getCharacters(id: number): Promise<AnimeCharacter[]> {
    const characterStaff = await this.mal.getJikanData<{ characters?: AnimeCharacter[] }>(
      `anime/${id}/characters_staff`,
    );
    return characterStaff.characters || [];
  }

  async getStaff(id: number): Promise<AnimeStaff[]> {
    const characterStaff = await this.mal.getJikanData<{ staff?: AnimeStaff[] }>(
      `anime/${id}/characters_staff`,
    );
    return characterStaff.staff || [];
  }
}
