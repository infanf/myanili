import { HttpClient } from '@angular/common/http';
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
import { RelatedManga } from '@models/manga';
import { Base64 } from 'js-base64';
import { environment } from 'src/environments/environment';

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
    private httpClient: HttpClient,
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

  async list(status?: WatchStatus) {
    let animes = [] as ListAnime[];
    switch (this.mainService) {
      case 'anilist':
        animes = await this.anilist.myList(status);
        break;
      case 'kitsu':
        // animes=await this.kitsu.myList(status)
        break;
      default:
        animes = await this.mal.myList(status);
        break;
    }
    return animes.map(anime => {
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
      await this.mal.get<Array<{ node: AnimeNode }>>(`/animes/season/${year}/${season}`)
    ).map(anime => anime.node);
    return animes.map(anime => {
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
    const anime = await this.mal.get<Anime>('anime/' + id);
    const comments = anime.my_list_status?.comments;
    if (!anime.related_manga.length) anime.related_manga = await this.getManga(id);
    if (!comments) return anime;
    try {
      const json = Base64.decode(comments);
      const my_extension = JSON.parse(json) as AnimeExtension;
      return { ...anime, my_extension };
    } catch (e) {}
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
      this.mal.put<MyAnimeStatus>('anime/' + ids.malId, data),
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
          ids.kitsuId = await this.kitsu.getId(ids.malId, 'anime');
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

  async getManga(id: number): Promise<RelatedManga[]> {
    const jikanime = await this.mal.getJikan('anime', id);
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
    return new Promise((r, rj) => {
      this.httpClient
        .get<{ characters: AnimeCharacter[] }>(
          `${environment.jikanUrl}anime/${id}/characters_staff`,
        )
        .subscribe(result => {
          r(result.characters || []);
        });
    });
  }
  async getStaff(id: number): Promise<AnimeStaff[]> {
    return new Promise((r, rj) => {
      this.httpClient
        .get<{ staff: AnimeStaff[] }>(`${environment.jikanUrl}anime/${id}/characters_staff`)
        .subscribe(result => {
          r(result.staff || []);
        });
    });
  }
}
