import { Injectable } from '@angular/core';
import {
  AnilistMediaListCollection,
  AnilistMediaListStatus,
  AnilistSaveMedialistEntry,
  AnilistUser,
} from '@models/anilist';
import { ListAnime, WatchStatus } from '@models/anime';
import { ExtRating } from '@models/components';
import { ReadStatus } from '@models/manga';
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

  async myList(malStatus?: WatchStatus, type: 'ANIME' | 'MANGA' = 'ANIME'): Promise<ListAnime[]> {
    const status = this.statusFromMal(malStatus);
    return new Promise(async r => {
      this.user.subscribe(user => {
        this.client
          .query<{
            MediaListCollection: AnilistMediaListCollection;
          }>({
            errorPolicy: 'ignore',
            query: gql`
              query MediaListCollection($status: MediaListStatus, $userId: Int, $type: MediaType) {
                MediaListCollection(status: $status, userId: $userId, type: $type) {
                  lists {
                    entries {
                      status
                      progress
                      score(format: POINT_10)
                      notes
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
              status,
              type,
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
                      id: media.idMal || 0,
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
                      updated_at: new Date(),
                      finish_date: new Date(),
                      start_date: undefined,
                      status: this.statusToMal(entry.status, type) as WatchStatus,
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
}
