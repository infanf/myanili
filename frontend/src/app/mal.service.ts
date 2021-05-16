import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Anime,
  AnimeStatus,
  ListAnime,
  MyAnimeStatus,
  MyAnimeUpdate,
  WatchStatus,
} from '@models/mal-anime';
import { ListManga, Manga, MangaStatus, ReadStatus } from '@models/mal-manga';
import { ListMedia, Media, MediaStatus, PersonalStatus } from '@models/media';
import { MalUser, UserResponse } from '@models/user';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MalService {
  private backendUrl = environment.backend;
  private isLoggedIn = new BehaviorSubject<string | false>('***loading***');
  private malUser = new BehaviorSubject<MalUser | undefined>(undefined);

  constructor(private httpClient: HttpClient) {
    const malUser = JSON.parse(localStorage.getItem('malUser') || 'false') as MalUser | false;
    if (malUser) {
      this.isLoggedIn.next(malUser.name);
      this.malUser.next(malUser);
    }
    this.checkLogin();
  }

  async get<T>(path: string): Promise<T> {
    return new Promise((res, rej) => {
      this.httpClient
        .get(`${this.backendUrl}${path}`, { withCredentials: true })
        .subscribe(value => {
          res((value as unknown) as T);
        });
    });
  }

  // tslint:disable-next-line:no-any
  async put<T>(path: string, data: any): Promise<T> {
    return new Promise((res, rej) => {
      this.httpClient
        .put(`${this.backendUrl}${path}`, data, { withCredentials: true })
        .subscribe(value => {
          res((value as unknown) as T);
        });
    });
  }

  // tslint:disable-next-line:no-any
  async post<T>(path: string, data: any): Promise<T> {
    return new Promise((res, rej) => {
      this.httpClient
        .post(`${this.backendUrl}${path}`, data, { withCredentials: true })
        .subscribe(value => {
          res((value as unknown) as T);
        });
    });
  }

  async getJikan(type: 'anime' | 'manga', id: number): Promise<JikanInstance> {
    return new Promise((r, rj) => {
      this.httpClient.get<JikanInstance>(`${environment.jikanUrl}${type}/${id}`).subscribe(r);
    });
  }

  async checkLogin() {
    const response = await this.get<UserResponse>('me');
    if (response && 'name' in response) {
      this.isLoggedIn.next(response.name);
      localStorage.setItem('malUser', JSON.stringify(response));
      this.malUser.next(response);
    } else {
      this.isLoggedIn.next(false);
      localStorage.removeItem('malUser');
      this.malUser.next(undefined);
    }
  }

  async getMedia(id: number, type: 'anime' | 'manga' = 'anime'): Promise<Media | undefined> {
    let malMedia: Anime | Manga;
    if (type === 'anime') {
      malMedia = await this.get<Anime>(`anime/${id}`);
    } else {
      malMedia = await this.get<Manga>(`manga/${id}`);
    }
    if (!malMedia) return;
    return {
      id: malMedia.id,
      id_mal: malMedia.id,
      type,
      title: malMedia.title,
      main_picture: malMedia.main_picture,
      alternative_titles: malMedia.alternative_titles,
      start_date: malMedia.start_date,
      end_date: malMedia.end_date,
      synopsis: malMedia.synopsis,
      mean: malMedia.mean,
      rank: malMedia.rank,
      popularity: malMedia.popularity,
      num_list_users: malMedia.num_list_users,
      num_scoring_users: malMedia.num_scoring_users,
      nsfw: malMedia.nsfw,
      created_at: malMedia.created_at,
      updated_at: malMedia.updated_at,
      media_type: malMedia.media_type,
      status: this.mediaStatusfromMal(malMedia.status),
      genres: malMedia.genres.map(genre => genre.name),
      num_parts: 'num_episodes' in malMedia ? malMedia.num_episodes : malMedia.num_chapters || 0,
      num_volumes: 'num_volumes' in malMedia ? malMedia.num_volumes : undefined,
      companies:
        'studios' in malMedia
          ? malMedia.studios
          : malMedia.serialization.map(magazine => magazine.node),
      authors: 'authors' in malMedia ? malMedia.authors : undefined,
      average_episode_duration:
        'average_episode_duration' in malMedia ? malMedia.average_episode_duration : undefined,
      related: [],
      pictures: [],
      recommendations: [],
      my_list_status: malMedia.my_list_status
        ? {
            comments: malMedia.my_list_status.comments,
            updated_at: malMedia.my_list_status.updated_at,
            score: malMedia.my_list_status.score,
            priority: malMedia.my_list_status.priority,
            repeating:
              'is_rewatching' in malMedia.my_list_status
                ? malMedia.my_list_status.is_rewatching
                : malMedia.my_list_status.is_rereading,
            repeats:
              'num_times_rewatched' in malMedia.my_list_status
                ? malMedia.my_list_status.num_times_rewatched
                : malMedia.my_list_status.num_times_reread,
            progress:
              'num_episodes_watched' in malMedia.my_list_status
                ? malMedia.my_list_status.num_episodes_watched
                : malMedia.my_list_status.num_chapters_read,
            progress_volumes:
              'num_volumes_read' in malMedia.my_list_status
                ? malMedia.my_list_status.num_volumes_read
                : undefined,
            repeat_value:
              'rewatch_value' in malMedia.my_list_status
                ? malMedia.my_list_status.rewatch_value
                : malMedia.my_list_status.reread_value,
            tags: Array.isArray(malMedia.my_list_status.tags)
              ? malMedia.my_list_status.tags
              : [malMedia.my_list_status.tags],
            finish_date: malMedia.my_list_status.finish_date,
            start_date: malMedia.my_list_status.start_date,
            status: this.fromMalStatus(malMedia.my_list_status.status),
          }
        : undefined,
    };
  }

  async myList(status?: PersonalStatus): Promise<ListMedia[]> {
    let animes: ListAnime[] = [];
    if (status) {
      animes = await this.get<ListAnime[]>(`list/${this.toMalStatus(status)}`);
    } else {
      animes = await this.get<ListAnime[]>('list');
    }
    return animes.map(
      anime =>
        ({
          node: {
            id: anime.node.id,
            id_mal: anime.node.id,
            type: 'anime',
            title: anime.node.title,
            alternative_titles: anime.node.alternative_titles,
            media_type: anime.node.media_type,
            end_date: anime.node.end_date,
            main_picture: anime.node.main_picture,
            num_parts: anime.node.num_episodes,
            start_date: anime.node.start_date,
            start_season: anime.node.start_season,
          },
          list_status: {
            repeat_value: anime.list_status.rewatch_value,
            comments: anime.list_status.comments,
            priority: anime.list_status.priority,
            progress: anime.list_status.num_episodes_watched,
            repeats: anime.list_status.num_times_rewatched,
            repeating: anime.list_status.is_rewatching,
            tags: anime.list_status.tags,
            updated_at: anime.list_status.updated_at,
            finish_date: anime.list_status.finish_date,
            start_date: anime.list_status.start_date,
            score: anime.list_status.score,
            status: this.fromMalStatus(anime.list_status.status),
          },
        } as ListMedia),
    );
  }

  updateAnimeEntry(id: number, data: Partial<MyAnimeUpdate>) {
    return this.put<MyAnimeStatus>(`anime/${id}`, data);
  }

  async myMangaList(status?: ReadStatus) {
    if (status) return this.get<ListManga[]>(`mangalist/${status}`);
    return this.get<ListManga[]>('mangalist');
  }

  async refreshTokens() {}

  async login() {
    return new Promise(r => {
      const loginWindow = window.open(this.backendUrl + 'auth');
      window.addEventListener('message', async event => {
        if (event.data) {
          await this.checkLogin();
        }
        loginWindow?.close();
      });
    });
  }

  get loggedIn() {
    return this.isLoggedIn.asObservable();
  }

  get user() {
    return this.malUser.asObservable();
  }

  toMalStatus(
    mediaStatus?: PersonalStatus,
    type: 'anime' | 'manga' = 'anime',
  ): WatchStatus | ReadStatus | undefined {
    switch (mediaStatus) {
      case 'current':
        return type === 'anime' ? 'watching' : 'reading';
      case 'planning':
        return type === 'anime' ? 'plan_to_watch' : 'plan_to_read';
      case 'on_hold':
      case 'completed':
      case 'dropped':
        return type === 'anime' ? (mediaStatus as WatchStatus) : (mediaStatus as ReadStatus);
      default:
        return undefined;
    }
  }

  fromMalStatus(mediaStatus?: WatchStatus | ReadStatus): PersonalStatus | undefined {
    switch (mediaStatus) {
      case 'watching':
      case 'reading':
        return 'on_hold';
      case 'plan_to_watch':
      case 'plan_to_read':
        return 'planning';
      case 'on_hold':
      case 'completed':
      case 'dropped':
        return mediaStatus as PersonalStatus;
      default:
        return undefined;
    }
  }

  mediaStatusfromMal(malStatus?: AnimeStatus | MangaStatus): MediaStatus {
    switch (malStatus) {
      case 'currently_airing':
      case 'currently_publishing':
        return 'current';
      case 'finished_airing':
      case 'finished':
        return 'finished';
      default:
        return 'not_yet_released';
    }
  }
}

interface JikanInstance {
  related: {
    [key: string]: Array<{
      mal_id: number;
      type: 'manga' | 'anime';
      name: string;
      url: string;
    }>;
  };
}
