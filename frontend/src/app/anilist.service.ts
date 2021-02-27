import { Injectable } from '@angular/core';
import { AnilistMediaListStatus, AnilistSaveMedialistEntry, AnilistUser } from '@models/anilist';
import { WatchStatus } from '@models/anime';
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
          alert('Could not connect to anilist, please check your account settings.');
          localStorage.removeItem('anilistAccessToken');
        });
    }
  }

  async login() {
    return new Promise(r => {
      const loginWindow = window.open(environment.backend + 'anilistauth');
      window.addEventListener('message', async event => {
        if (event.data) {
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
    const requestResult = await new Promise<AnilistUser>(r => {
      this.client
        .query<{ Viewer: AnilistUser }>({
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
        .subscribe(result => {
          r(result.data.Viewer);
        });
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
          query: gql`
            query Media($idMal: Int, $type: MediaType) {
              Media(idMal: $idMal, type: $type) {
                id
              }
            }
          `,
          variables: { idMal, type },
        })
        .subscribe(result => {
          r(result.data.Media?.id);
        });
    });
    return requestResult;
  }

  async updateEntry(id: number, data: Partial<AnilistSaveMedialistEntry>) {
    data.mediaId = id;
    const variables = JSON.parse(JSON.stringify(data));
    this.client
      .mutate({
        mutation: gql`
          mutation(
            $id: Int
            $mediaId: Int
            $status: MediaListStatus
            $score: Float
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
              score: $score
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
      .subscribe();
  }

  statusFromMal(
    malStatus: WatchStatus | ReadStatus | undefined,
  ): AnilistMediaListStatus | undefined {
    switch (malStatus) {
      case 'plan_to_read':
      case 'plan_to_watch':
        return 'PLANNING';
      case 'completed':
        return 'COMPLETED';
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
}
