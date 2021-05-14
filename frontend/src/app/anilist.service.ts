import { Injectable } from '@angular/core';
import {
  AnilistMedia,
  AnilistMediaListCollection,
  AnilistMediaListStatus,
  AnilistMediaStatus,
  AnilistSaveMedialistEntry,
  AnilistUser,
} from '@models/anilist';
import { Anime, AnimeStatus, ListAnime, WatchStatus } from '@models/anime';
import { ExtRating } from '@models/components';
import { ListManga, MangaStatus, ReadStatus } from '@models/manga';
import { Apollo, gql } from 'apollo-angular';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnilistService {
  private clientId = '';
  private accessToken = '';
  private refreshToken = '';
  private userSubject = new BehaviorSubject<AnilistUser | undefined>(undefined);
  loggedIn = false;
  constructor(public client: Apollo) {
    this.clientId = String(localStorage.getItem('anilistClientId'));
    this.accessToken = String(localStorage.getItem('anilistAccessToken'));
    this.refreshToken = String(localStorage.getItem('anilistRefreshToken'));
    if (this.accessToken) {
      this.checkLogin()
        .then(user => {
          this.userSubject.next(user);
        })
        .catch(e => {
          alert('Could not connect to AniList, please check your account settings.');
          localStorage.removeItem('anilistAccessToken');
        });
    }
  }

  async login() {
    return new Promise(r => {
      const loginWindow = window.open(environment.backend + 'anilistauth');
      window.addEventListener('message', async event => {
        if (event.data && event.data.anilist) {
          const data = event.data as { at: string; rt: string; ex: number; ci: string };
          this.accessToken = data.at;
          localStorage.setItem('anilistAccessToken', this.accessToken);
          this.refreshToken = data.rt;
          localStorage.setItem('anilistRefreshToken', this.refreshToken);
          this.clientId = data.ci;
          localStorage.setItem('anilistClientId', this.clientId);
          this.userSubject.next(await this.checkLogin());
        }
        loginWindow?.close();
        r(undefined);
      });
    });
  }

  get user() {
    return this.userSubject.asObservable();
  }

  async checkLogin(): Promise<AnilistUser | undefined> {
    const requestResult = await new Promise<AnilistUser | undefined>(r => {
      this.client
        .query<{ Viewer: AnilistUser }>({
          errorPolicy: 'ignore',
          query: gql`
            {
              Viewer {
                id
                name
                avatar {
                  large
                  medium
                }
              }
            }
          `,
        })
        .subscribe(
          result => {
            r(result.data.Viewer);
          },
          error => {
            console.log({ error });
            r(undefined);
          },
        );
    });
    this.loggedIn = !!requestResult;
    return requestResult;
  }

  logoff() {
    this.clientId = '';
    this.accessToken = '';
    this.refreshToken = '';
    this.userSubject.next(undefined);
    this.loggedIn = false;
    localStorage.removeItem('anilistAccessToken');
    localStorage.removeItem('anilistRefreshToken');
    localStorage.removeItem('anilistClientId');
  }

  async getId(idMal: number, type: 'ANIME' | 'MANGA'): Promise<number | undefined> {
    const requestResult = await new Promise<number | undefined>(r => {
      this.client
        .query<{ Media?: { id: number } }>({
          errorPolicy: 'ignore',
          query: gql`
            query Media($idMal: Int, $type: MediaType) {
              Media(idMal: $idMal, type: $type) {
                id
              }
            }
          `,
          variables: { idMal, type },
        })
        .subscribe(
          result => {
            r(result.data.Media?.id);
          },
          error => {
            console.log({ error });
            r(undefined);
          },
        );
    });
    return requestResult;
  }

  async getMalId(id: number, type: 'ANIME' | 'MANGA'): Promise<number | undefined> {
    const requestResult = await new Promise<number | undefined>(r => {
      this.client
        .query<{ Media?: { idMal: number } }>({
          errorPolicy: 'ignore',
          query: gql`
            query Media($id: Int, $type: MediaType) {
              Media(id: $id, type: $type) {
                idMal
              }
            }
          `,
          variables: { id, type },
        })
        .subscribe(
          result => {
            r(result.data.Media?.idMal);
          },
          error => {
            console.log({ error });
            r(undefined);
          },
        );
    });
    return requestResult;
  }

  async updateEntry(id: number, data: Partial<AnilistSaveMedialistEntry>) {
    return new Promise(r => {
      data.mediaId = id;
      const variables = JSON.parse(JSON.stringify(data));
      this.client
        .mutate({
          errorPolicy: 'ignore',
          mutation: gql`
            mutation(
              $id: Int
              $mediaId: Int
              $status: MediaListStatus
              $scoreRaw: Int
              $progress: Int
              $progressVolumes: Int
              $repeat: Int
              $private: Boolean
              $notes: String
              $customLists: [String]
              $hiddenFromStatusLists: Boolean
              $advancedScores: [Float]
              $startedAt: FuzzyDateInput
              $completedAt: FuzzyDateInput
            ) {
              SaveMediaListEntry(
                id: $id
                mediaId: $mediaId
                status: $status
                scoreRaw: $scoreRaw
                progress: $progress
                progressVolumes: $progressVolumes
                repeat: $repeat
                private: $private
                notes: $notes
                customLists: $customLists
                hiddenFromStatusLists: $hiddenFromStatusLists
                advancedScores: $advancedScores
                startedAt: $startedAt
                completedAt: $completedAt
              ) {
                id
                mediaId
                status
                score
                advancedScores
                progress
                progressVolumes
                repeat
                priority
                private
                hiddenFromStatusLists
                customLists
                notes
                updatedAt
                startedAt {
                  year
                  month
                  day
                }
                completedAt {
                  year
                  month
                  day
                }
                user {
                  id
                  name
                }
                media {
                  id
                  title {
                    userPreferred
                  }
                  coverImage {
                    large
                  }
                  type
                  format
                  status
                  episodes
                  volumes
                  chapters
                  averageScore
                  popularity
                  isAdult
                  startDate {
                    year
                  }
                }
              }
            }
          `,
          variables,
        })
        .subscribe(r, error => {
          console.log({ error });
          r(undefined);
        });
    });
  }

  async getAnime(id: number) {
    return this.get<Anime>(id, 'ANIME');
  }

  async get<T>(id: number, type: 'ANIME' | 'MANGA'): Promise<T | undefined> {
    const requestResult = await new Promise<T | undefined>(r => {
      this.client
        .query<{ Media?: AnilistMedia }>({
          errorPolicy: 'ignore',
          query: gql`
            query media($id: Int, $type: MediaType, $isAdult: Boolean) {
              Media(id: $id, type: $type, isAdult: $isAdult) {
                id
                title {
                  userPreferred
                  romaji
                  english
                  native
                }
                coverImage {
                  extraLarge
                  large
                }
                startDate {
                  year
                  month
                  day
                }
                endDate {
                  year
                  month
                  day
                }
                description
                season
                seasonYear
                type
                format
                status(version: 2)
                episodes
                duration
                chapters
                volumes
                genres
                synonyms
                source(version: 2)
                meanScore
                popularity
                favourites
                countryOfOrigin
                studios {
                  edges {
                    isMain
                    node {
                      id
                      name
                    }
                  }
                }
                rankings {
                  id
                  rank
                  type
                  format
                  year
                  season
                  allTime
                  context
                }
                tags {
                  id
                  name
                  description
                  rank
                  isMediaSpoiler
                  isGeneralSpoiler
                }
                mediaListEntry {
                  id
                  status
                  score
                  repeat
                  progress
                  progressVolumes
                  priority
                  notes
                  updatedAt
                  createdAt
                }
                stats {
                  statusDistribution {
                    status
                    amount
                  }
                  scoreDistribution {
                    score
                    amount
                  }
                }
              }
            }
          `,
          variables: { id, type },
        })
        .subscribe(
          result => {
            const alAnime = result.data.Media;
            if (!alAnime) return r(undefined);
            const malAnime: Anime = {
              id: alAnime.id,
              id_mal: alAnime.idMal,
              title: alAnime.title.romaji,
              alternative_titles: {
                en: alAnime.title.english,
                ja: alAnime.title.native,
                synonyms: alAnime.synonyms,
              },
              average_episode_duration: alAnime.duration,
              genres: alAnime.genres.map(genre => ({ id: 0, name: genre })),
              mean: alAnime.meanScore / 10,
              source: alAnime.source,
              main_picture: {
                medium: alAnime.coverImage.large,
                large: alAnime.coverImage.extraLarge,
              },
              synopsis: alAnime.description,
              pictures: [],
              related_anime: [],
              related_manga: [],
              recommendations: [],
              studios: [],
              opening_themes: [],
              ending_themes: [],
              num_episodes: alAnime.episodes || 0,
              num_list_users: alAnime.popularity,
              num_scoring_users: 0,
              created_at: alAnime.mediaListEntry?.updatedAt
                ? new Date(alAnime.mediaListEntry?.updatedAt * 1000)
                : new Date(),
              updated_at: alAnime.mediaListEntry?.updatedAt
                ? new Date(alAnime.mediaListEntry?.updatedAt * 1000)
                : new Date(),
              media_type: 'tv',
              status: this.mediaStatusToMal(alAnime.status) as AnimeStatus,
              my_list_status: alAnime.mediaListEntry
                ? // ? type === 'ANIME'
                  {
                    status: this.statusToMal(alAnime.mediaListEntry.status) as WatchStatus,
                    comments: alAnime.mediaListEntry.notes,
                    is_rewatching: alAnime.mediaListEntry.status === 'REPEATING',
                    score: alAnime.mediaListEntry.score,
                    num_episodes_watched: alAnime.mediaListEntry.progress,
                    num_times_rewatched: alAnime.mediaListEntry.repeat,
                    priority: 0,
                    rewatch_value: 0,
                    tags: [],
                    updated_at: alAnime.mediaListEntry?.updatedAt
                      ? new Date(alAnime.mediaListEntry?.updatedAt * 1000)
                      : new Date(),
                  }
                : // : {
                  //     comments: alAnime.mediaListEntry.notes,
                  //     is_rereading: alAnime.mediaListEntry.status === 'REPEATING',
                  //     score: alAnime.mediaListEntry.score,
                  //     num_chapters_read: alAnime.mediaListEntry.progress,
                  //     num_volumes_read: alAnime.mediaListEntry.progressVolumes||0,
                  //     num_times_reread: alAnime.mediaListEntry.repeat,
                  //     priority: 0,
                  //     reread_value: 0,
                  //     tags: '',
                  //     updated_at: alAnime.mediaListEntry?.updatedAt
                  //       ? new Date(alAnime.mediaListEntry?.updatedAt * 1000)
                  //       : new Date(),
                  //   }
                  undefined,
            };
            r((malAnime as unknown) as T);
          },
          error => {
            console.log({ error });
            r(undefined);
          },
        );
    });
    return requestResult;
  }

  async myList(malStatus?: WatchStatus): Promise<ListAnime[]> {
    const status = this.statusFromMal(malStatus);
    return new Promise(async r => {
      this.user.subscribe(user => {
        if (!user) return;
        this.client
          .query<{
            MediaListCollection: AnilistMediaListCollection;
          }>({
            errorPolicy: 'ignore',
            query: gql`
              query MediaListCollection(
                $status: [MediaListStatus]
                $userId: Int
                $type: MediaType
              ) {
                MediaListCollection(status_in: $status, userId: $userId, type: $type) {
                  lists {
                    entries {
                      status
                      progress
                      score(format: POINT_10)
                      notes
                      updatedAt
                      completedAt {
                        year
                        month
                        day
                      }
                      media {
                        id
                        idMal
                        title {
                          romaji
                          english
                          native
                          userPreferred
                        }
                        episodes
                        coverImage {
                          extraLarge
                          large
                          medium
                          color
                        }
                        startDate {
                          year
                          month
                          day
                        }
                        endDate {
                          year
                          month
                          day
                        }
                        season
                        seasonYear
                      }
                    }
                  }
                }
              }
            `,
            variables: {
              userId: user?.id,
              status: status === 'CURRENT' ? [status, 'REPEATING'] : [status],
              type: 'ANIME',
            },
          })
          .subscribe(result => {
            if (result.data) {
              const malList: ListAnime[] = [];
              for (const list of result.data.MediaListCollection.lists) {
                for (const entry of list.entries) {
                  const media = entry.media;
                  malList.push({
                    node: {
                      id: media.id,
                      id_mal: media.idMal,
                      title: media.title.romaji,
                      alternative_titles: {
                        en: media.title.english,
                        ja: media.title.native,
                      },
                      num_episodes: media.episodes,
                      main_picture: media.coverImage
                        ? {
                            medium: media.coverImage.large,
                            large: media.coverImage.extraLarge,
                          }
                        : undefined,
                      start_date: undefined,
                      end_date: undefined,
                      start_season: {
                        season: (media.season || '').toLowerCase() as
                          | 'winter'
                          | 'spring'
                          | 'summer'
                          | 'fall',
                        year: media.seasonYear,
                      },
                    },
                    list_status: {
                      comments: entry.notes,
                      is_rewatching: false,
                      num_episodes_watched: entry.progress,
                      num_times_rewatched: 0,
                      priority: 0,
                      rewatch_value: 0,
                      score: 0,
                      tags: [],
                      updated_at: new Date(entry.updatedAt),
                      finish_date: entry.comletedAt
                        ? new Date(
                            `${entry.comletedAt.year}-${entry.comletedAt.month}-${entry.comletedAt.day}`,
                          )
                        : undefined,
                      start_date: undefined,
                      status: this.statusToMal(entry.status, 'ANIME') as WatchStatus,
                    },
                  });
                }
              }
              r(malList);
            }
          });
      });
    });
  }

  async myMangaList(malStatus?: ReadStatus): Promise<ListManga[]> {
    const status = this.statusFromMal(malStatus);
    return new Promise(async r => {
      this.user.subscribe(user => {
        if (!user) return;
        this.client
          .query<{
            MediaListCollection: AnilistMediaListCollection;
          }>({
            errorPolicy: 'ignore',
            query: gql`
              query MediaListCollection(
                $status: [MediaListStatus]
                $userId: Int
                $type: MediaType
              ) {
                MediaListCollection(status_in: $status, userId: $userId, type: $type) {
                  lists {
                    name
                    isCustomList
                    isSplitCompletedList
                    status
                    entries {
                      progress
                      progressVolumes
                      status
                      score(format: POINT_10)
                      notes
                      updatedAt
                      completedAt {
                        year
                        month
                        day
                      }
                      media {
                        id
                        idMal
                        title {
                          romaji
                          english
                          native
                          userPreferred
                        }
                        staff {
                          edges {
                            id
                            node {
                              id
                              name {
                                first
                                last
                                full
                                native
                              }
                            }
                            role
                          }
                        }
                        volumes
                        chapters
                        coverImage {
                          extraLarge
                          large
                          medium
                          color
                        }
                        startDate {
                          year
                          month
                          day
                        }
                        endDate {
                          year
                          month
                          day
                        }
                      }
                    }
                  }
                }
              }
            `,
            variables: {
              userId: user?.id,
              status: status === 'CURRENT' ? [status, 'REPEATING'] : [status],
              type: 'MANGA',
            },
          })
          .subscribe(result => {
            if (result.data) {
              const malList: ListManga[] = [];
              for (const list of result.data.MediaListCollection.lists) {
                for (const entry of list.entries) {
                  const media = entry.media;
                  malList.push({
                    node: {
                      id: media.idMal || 0,
                      title: media.title.romaji,
                      alternative_titles: {
                        en: media.title.english,
                        ja: media.title.native,
                      },
                      authors: media.staff.edges.map(edge => ({
                        role: edge.role,
                        node: {
                          id: edge.node.id,
                          first_name: edge.node.name.first,
                          last_name: edge.node.name.last,
                        },
                      })),
                      num_chapters: media.episodes,
                      num_volumes: media.volumes,
                      main_picture: media.coverImage
                        ? {
                            medium: media.coverImage.large,
                            large: media.coverImage.extraLarge,
                          }
                        : undefined,
                      start_date: undefined,
                      end_date: undefined,
                    },
                    list_status: {
                      comments: entry.notes,
                      is_rereading: entry.status === 'REPEATING',
                      num_chapters_read: entry.progress,
                      num_volumes_read: entry.progressVolumes || 0,
                      num_times_reread: 0,
                      priority: 0,
                      reread_value: 0,
                      score: 0,
                      tags: '',
                      updated_at: new Date(entry.updatedAt),
                      finish_date: entry.comletedAt
                        ? new Date(
                            `${entry.comletedAt.year}-${entry.comletedAt.month}-${entry.comletedAt.day}`,
                          )
                        : undefined,
                      start_date: undefined,
                      status: this.statusToMal(entry.status, 'MANGA') as ReadStatus,
                    },
                  });
                }
              }
              r(malList);
            }
          });
      });
    });
  }

  async getRating(id?: number, type: 'ANIME' | 'MANGA' = 'ANIME'): Promise<ExtRating | undefined> {
    if (!id) return;
    return new Promise(r => {
      this.client
        .query<{
          Media?: { averageScore: number; stats: { scoreDistribution: Array<{ amount: number }> } };
        }>({
          errorPolicy: 'ignore',
          query: gql`
            query Media($id: Int, $type: MediaType) {
              Media(id: $id, type: $type) {
                averageScore
                stats {
                  scoreDistribution {
                    amount
                    score
                  }
                }
              }
            }
          `,
          variables: { id, type },
        })
        .subscribe(
          result => {
            if (result.data.Media?.averageScore) {
              r({
                nom: result.data.Media?.averageScore,
                norm: result.data.Media?.averageScore,
                unit: '%',
                ratings: result.data.Media.stats.scoreDistribution
                  .map(a => a.amount)
                  .reduce((a, b) => a + b),
              });
            } else {
              r(undefined);
            }
          },
          e => {
            console.log({ e });
            r(undefined);
          },
        );
    });
  }

  statusFromMal(
    malStatus?: WatchStatus | ReadStatus,
    repeating = false,
  ): AnilistMediaListStatus | undefined {
    switch (malStatus) {
      case 'plan_to_read':
      case 'plan_to_watch':
        return 'PLANNING';
      case 'completed':
        return repeating ? 'REPEATING' : 'COMPLETED';
      case 'dropped':
        return 'DROPPED';
      case 'on_hold':
        return 'PAUSED';
      case 'reading':
      case 'watching':
        return 'CURRENT';
      default:
        return undefined;
    }
  }

  statusToMal(
    alStatus?: AnilistMediaListStatus,
    type: 'ANIME' | 'MANGA' = 'ANIME',
  ): WatchStatus | ReadStatus | undefined {
    switch (alStatus) {
      case 'PLANNING':
        return type === 'MANGA' ? 'plan_to_read' : 'plan_to_watch';
      case 'CURRENT':
        return type === 'MANGA' ? 'reading' : 'watching';
      case 'REPEATING':
      case 'COMPLETED':
        return 'completed';
      case 'PAUSED':
        return 'on_hold';
      case 'DROPPED':
        return 'dropped';
      default:
        return undefined;
    }
  }

  mediaStatusToMal(
    alStatus?: AnilistMediaStatus,
    type: 'ANIME' | 'MANGA' = 'ANIME',
  ): AnimeStatus | MangaStatus {
    switch (alStatus) {
      case 'FINISHED':
      case 'CANCELLED':
        return type === 'ANIME' ? 'finished_airing' : 'finished';
      case 'HIATUS':
      case 'RELEASING':
        return type === 'ANIME' ? 'currently_airing' : 'currently_publishing';
      default:
        return type === 'ANIME' ? 'not_yet_aired' : 'not_yet_published';
    }
  }
}
