import { Injectable } from '@angular/core';
import { MyAnimeUpdate, WatchStatus } from '@models/anime';
import { ExtRating } from '@models/components';
import { DialogueService } from '@services/dialogue.service';
import { Client } from '@urql/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LivechartService {
  private client!: Client;
  private accessToken = '';
  private refreshToken = '';
  private expires = 0;
  private userSubject = new BehaviorSubject<string | undefined>(undefined);
  loggedIn = false;

  constructor(private dialogue: DialogueService) {
    const { createClient, cacheExchange, fetchExchange } =
      require('@urql/core') as typeof import('@urql/core');
    this.client = createClient({
      url: 'https://www.livechart.me/graphql',
      fetchOptions: () => {
        const token = this.accessToken !== 'null' ? this.accessToken : undefined;
        return {
          headers: {
            authorization: token ? `Bearer ${token}` : '',
          },
        };
      },
      exchanges: [cacheExchange, fetchExchange],
    });
    this.accessToken = String(localStorage.getItem('livechartAccessToken'));
    if (this.accessToken === 'null') this.accessToken = '';
    this.refreshToken = String(localStorage.getItem('livechartRefreshToken'));
    if (this.refreshToken === 'null') this.refreshToken = '';
    this.expires = Number(localStorage.getItem('livechartExpires') || 0);
    if (this.accessToken) {
      this.login()
        .then(user => {
          if (user) {
            this.userSubject.next(user);
          } else {
            throw new Error('User not found');
          }
        })
        .catch(e => {
          this.dialogue.alert(
            'Could not connect to Livechart.me, please check your account settings.',
            'Livechart.me Connection Error',
          );
          this.logoff();
        });
    }
  }

  async getId(malId: number, title: string): Promise<number | undefined> {
    if (!malId || !title) return undefined;
    const { gql } = await import('@urql/core');
    const QUERY = gql`
      query AnimeSearch($term: String) {
        anime(term: $term) {
          nodes {
            databaseId
            malUrl
          }
        }
      }
    `;
    const { data, error } = await this.client
      .query<{
        anime: {
          nodes: [
            {
              databaseId: number;
              malUrl: string;
            },
          ];
        };
      }>(QUERY, { term: title })
      .toPromise();
    if (error || !data) {
      console.log(error);
      return;
    }
    const { nodes } = data.anime;
    const node = nodes.find(n => n.malUrl === `https://myanimelist.net/anime/${malId}`);
    return node?.databaseId;
  }

  private async getExternalUrls(id: number): Promise<{ [key: string]: string | undefined }> {
    if (!id) return {};
    const { gql } = await import('@urql/core');
    const QUERY = gql`
      query GetFullSingleAnime($id: ID!) {
        singleAnime(id: $id) {
          anidbUrl
          animePlanetUrl
          anisearchUrl
        }
      }
    `;
    const { data, error } = await this.client
      .query<{
        singleAnime: {
          anidbUrl?: string;
          animePlanetUrl?: string;
          anisearchUrl?: string;
        };
      }>(QUERY, { id })
      .toPromise();
    if (error || !data) {
      console.log(error);
      return {};
    }
    const anidbUrl = data.singleAnime.anidbUrl;
    const animePlanetUrl = data.singleAnime.animePlanetUrl;
    const anisearchUrl = data.singleAnime.anisearchUrl;
    return {
      anidbUrl,
      animePlanetUrl,
      anisearchUrl,
    };
  }

  async getAnidbId(id: number): Promise<number | undefined> {
    if (!id) return undefined;
    const { anidbUrl } = await this.getExternalUrls(id);
    if (!anidbUrl) return;
    const regex = /a(\d+)$/;
    const match = regex.exec(anidbUrl);
    if (!match) return;
    return Number(match[1]);
  }

  async getAnimePlanetId(id?: number): Promise<string | undefined> {
    if (!id) return;
    const { animePlanetUrl } = await this.getExternalUrls(id);
    if (!animePlanetUrl) return;
    const regex = /anime\/(.+)$/;
    const match = regex.exec(animePlanetUrl);
    if (!match) return;
    return match[1];
  }

  async getAnisearchId(id?: number): Promise<number | undefined> {
    if (!id) return;
    const { anisearchUrl } = await this.getExternalUrls(id);
    if (!anisearchUrl) return;
    const regex = /anime\/(\d+)$/;
    const match = regex.exec(anisearchUrl);
    if (!match?.[1]) return;
    return Number(match[1]);
  }

  async getAnimes(term: string) {
    const { gql } = await import('@urql/core');
    const QUERY = gql`
      query AnimeSearch($term: String) {
        anime(term: $term) {
          __typename
          nodes {
            databaseId
            romajiTitle
            englishTitle
            nativeTitle
            alternativeTitles
            poster {
              url
            }
            startDate {
              value
              precision
            }
            synopsis {
              markdown
            }
            tags {
              name
              hidden
            }
          }
        }
      }
    `;
    const { data, error } = await this.client
      .query<{
        anime: {
          nodes: [
            {
              databaseId: number;
              romajiTitle: string;
              englishTitle: string;
              nativeTitle: string;
              alternativeTitles: string[];
              poster: {
                url: string;
              };
              startDate: {
                value: Date;
                precision: 'NONE' | 'YEAR' | 'MONTH_AND_YEAR' | 'DATE' | 'DATE_AND_TIME';
              };
              synopsis: {
                markdown: string;
              };
              tags: Array<{
                name: string;
                hidden: boolean;
              }>;
            },
          ];
        };
      }>(QUERY, { term })
      .toPromise();
    if (error || !data) {
      console.log(error);
      return;
    }
    const { nodes } = data.anime;
    return nodes;
  }

  async getRating(id?: number): Promise<ExtRating | undefined> {
    if (!id) return undefined;
    const { gql } = await import('@urql/core');
    const QUERY = gql`
      query GetFullSingleAnime($id: ID!) {
        singleAnime(id: $id) {
          aggregateRating {
            count
            weightedValue
          }
        }
      }
    `;
    const { data, error } = await this.client
      .query<{
        singleAnime: { aggregateRating?: { count: number; weightedValue: number } };
      }>(QUERY, { id })
      .toPromise();
    if (error || !data) {
      console.log(error);
      return;
    }
    const { aggregateRating } = data.singleAnime;
    if (!aggregateRating) return;
    return {
      norm: aggregateRating.weightedValue * 10,
      ratings: aggregateRating.count,
      nom: aggregateRating.weightedValue,
    };
  }

  async updateAnime(id?: number, updateData?: Partial<MyAnimeUpdate>) {
    if (!id || !updateData || !(await this.checkLogin())) return;
    const attributes = {
      status: this.statusFromMal(updateData.status, updateData.is_rewatching),
      rating: updateData.score,
      episodesWatched: updateData.num_watched_episodes,
      startedAt: updateData.start_date,
      finishedAt: updateData.finish_date,
      rewatches: updateData.num_times_rewatched,
    } as Partial<Attributes>;
    const { gql } = await import('@urql/core');
    const MUTATION = gql`
      mutation UpsertLibraryEntry($animeId: ID!, $attributes: LibraryEntryAttributes!) {
        upsertLibraryEntry(animeId: $animeId, attributes: $attributes, ratingScale: RATING_10) {
          libraryEntry {
            ...viewerLibraryEntryFields
          }
          problems {
            ...problemFields
          }
        }
      }
      fragment viewerLibraryEntryFields on LibraryEntry {
        animeDatabaseId
        episodesWatched
        status
        rating
        ratingScale
        updatedAt
        createdAt
      }
      fragment problemFields on Problem {
        message
        shortMessage
        path
        pathString
      }
    `;
    const { data, error } = await this.client
      .mutation<{
        animeId: string;
        attributes: Partial<Attributes>;
        ratingScale: 'RATING_10';
      }>(MUTATION, { animeId: id, attributes })
      .toPromise();
    if (error || !data) {
      console.log(error);
      return;
    }
  }

  async deleteAnime(id?: number): Promise<boolean> {
    if (!id || !(await this.checkLogin())) return false;
    const attributes = {
      status: 'SKIPPING',
    } as Partial<Attributes>;
    const { gql } = await import('@urql/core');
    const MUTATION = gql`
      mutation UpsertLibraryEntry($animeId: ID!, $attributes: LibraryEntryAttributes!) {
        upsertLibraryEntry(animeId: $animeId, attributes: $attributes, ratingScale: RATING_10) {
          libraryEntry {
            ...viewerLibraryEntryFields
          }
          problems {
            ...problemFields
          }
        }
      }
      fragment viewerLibraryEntryFields on LibraryEntry {
        animeDatabaseId
        status
        updatedAt
        createdAt
      }
      fragment problemFields on Problem {
        message
        shortMessage
        path
        pathString
      }
    `;
    const { data, error } = await this.client
      .mutation<{
        animeId: string;
        attributes: {
          status?: LivechartStatus;
        };
        ratingScale: 'RATING_10';
      }>(MUTATION, { animeId: id, attributes })
      .toPromise();
    if (error || !data) {
      console.log(error);
      return false;
    }
    return true;
  }

  async getStreams(animeId: number): Promise<LegacyStream[]> {
    const { gql } = await import('@urql/core');
    const QUERY = gql`
      query GetLegacyStreams(
        $beforeCursor: String
        $afterCursor: String
        $first: Int
        $last: Int
        $availableInViewerRegion: Boolean
        $animeId: ID!
      ) {
        legacyStreams(
          before: $beforeCursor
          after: $afterCursor
          first: $first
          last: $last
          availableInViewerRegion: $availableInViewerRegion
          animeId: $animeId
        ) {
          nodes {
            __typename
            ...legacyStreamFragment
          }
          pageInfo {
            __typename
            ...pageInfoFragment
          }
        }
      }
      fragment onTheFlyImageFields on OnTheFlyImage {
        url
        cacheNamespace
        styles {
          name
          formats
          width
          height
        }
      }
      fragment legacyStreamFragment on LegacyStream {
        databaseId
        animeDatabaseId
        streamingServiceDatabaseId
        url
        comment
        availableInViewerRegion
        displayName
        updatedAt
        createdAt
        expiresAt
        streamingService {
          databaseId
          name
          logo {
            __typename
            ...onTheFlyImageFields
          }
          updatedAt
          createdAt
        }
      }
      fragment pageInfoFragment on PageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    `;
    const { data, error } = await this.client
      .query<{
        legacyStreams: {
          nodes: LegacyStream[];
          pageInfo: {
            hasPreviousPage: boolean;
            hasNextPage: boolean;
            startCursor: string;
            endCursor: string;
          };
        };
      }>(QUERY, { animeId, availableInViewerRegion: false })
      .toPromise();
    if (error || !data) {
      console.log(error);
      return [];
    }
    return data.legacyStreams.nodes;
  }

  async login(username?: string, password?: string): Promise<string | undefined> {
    if (!username || !password) {
      if (!this.refreshToken) {
        this.logoff();
        return;
      }
      const resultRefresh = await fetch('https://www.livechart.me/api/v1/auth/refresh', {
        method: 'POST',
        body: new URLSearchParams({
          refresh_token: this.refreshToken,
        }),
      });
      if (resultRefresh.ok) {
        const response = (await resultRefresh.json()) as AuthResponse;
        this.accessToken = response.access_token;
        localStorage.setItem('livechartAccessToken', this.accessToken);
        this.refreshToken = response.refresh_token;
        localStorage.setItem('livechartRefreshToken', this.refreshToken);
        this.expires = Math.floor(Date.now() / 1000 + response.expires_in);
        localStorage.setItem('livechartExpires', this.expires.toString());
        return this.checkLogin(false);
      }
      return;
    }

    const body = new URLSearchParams({
      'credentials[email]': username,
      'credentials[password]': password,
    });
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    };
    const result = await fetch('https://www.livechart.me/api/v2/tokens', options);
    if (result.ok) {
      const response = (await result.json()) as AuthResponse;
      this.accessToken = response.access_token;
      localStorage.setItem('livechartAccessToken', this.accessToken);
      this.refreshToken = response.refresh_token;
      localStorage.setItem('livechartRefreshToken', this.refreshToken);
      this.expires = Math.floor(Date.now() / 1000 + response.expires_in);
      localStorage.setItem('livechartExpires', this.expires.toString());
      return this.checkLogin(false);
    }
    return;
  }

  async checkLogin(refresh = true): Promise<string | undefined> {
    if (!this.accessToken || this.accessToken === 'null') {
      this.logoff();
      return;
    }
    const { gql } = await import('@urql/core');
    const QUERY = gql`
      query Viewer {
        viewer {
          username
        }
      }
    `;
    const { data, error } = await this.client
      .query<{ viewer?: { username: string } }>(QUERY, {}, { requestPolicy: 'network-only' })
      .toPromise()
      .catch(() => ({ data: undefined, error: false }));
    if (!refresh && (error || !data)) {
      console.log(error);
      this.logoff();
      return;
    }
    this.loggedIn = true;
    const username = data?.viewer?.username;
    if (!username && refresh) {
      return this.login();
    }
    return username;
  }

  logoff() {
    this.accessToken = '';
    this.refreshToken = '';
    this.expires = 0;
    this.userSubject.next(undefined);
    this.loggedIn = false;
    localStorage.removeItem('livechartAccessToken');
    localStorage.removeItem('livechartRefreshToken');
    localStorage.removeItem('livechartExpires');
  }

  get user() {
    return this.userSubject.asObservable();
  }

  statusFromMal(status?: WatchStatus, rewatching = false): LivechartStatus | undefined {
    switch (status) {
      case 'watching':
        return rewatching ? 'REWATCHING' : 'WATCHING';
      case 'completed':
        return 'COMPLETED';
      case 'on_hold':
        return 'PAUSED';
      case 'plan_to_watch':
        return 'PLANNING';
      case 'dropped':
        return 'DROPPED';
      default:
        return undefined;
    }
  }

  statusToMal(status?: LivechartStatus): WatchStatus | undefined {
    switch (status) {
      case 'WATCHING':
      case 'REWATCHING':
        return 'watching';
      case 'COMPLETED':
        return 'completed';
      case 'CONSIDERING':
      case 'PLANNING':
        return 'plan_to_watch';
      case 'PAUSED':
        return 'on_hold';
      case 'SKIPPING':
      case 'DROPPED':
        return 'dropped';
      default:
        return undefined;
    }
  }
}

interface AuthResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
}

type LivechartStatus =
  | 'PLANNING'
  | 'PAUSED'
  | 'WATCHING'
  | 'REWATCHING'
  | 'CONSIDERING'
  | 'DROPPED'
  | 'COMPLETED'
  | 'SKIPPING';

interface Attributes {
  status: LivechartStatus;
  episodesWatched: number;
  rating: number;
  rewatches: number;
  startedAt: string;
  finishedAt: string;
  notes: string;
}

export interface LegacyStream {
  databaseId: number;
  animeDatabaseId: number;
  streamingServiceDatabaseId: number;
  url: string;
  comment: string;
  availableInViewerRegion: boolean;
  displayName: string;
  updatedAt: string;
  createdAt: string;
  expiresAt?: string;
  streamingService: {
    databaseId: number;
    name: string;
    logo: OnTheFlyImage;
    updatedAt: string;
    createdAt: string;
  };
}

interface OnTheFlyImage {
  url: string;
  cacheNamespace: string;
}
