import { Injectable } from '@angular/core';
import { WatchStatus } from '@models/anime';
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
  private readonly key = 'livechart';
  loggedIn = false;

  constructor(private dialogue: DialogueService) {
    const { createClient } = require('@urql/core') as typeof import('@urql/core');
    this.client = createClient({
      url: 'https://www.livechart.me/graphql',
      fetchOptions: () => {
        const token = this.accessToken;
        return {
          headers: { authorization: token ? `Bearer ${token}` : '' },
        };
      },
    });
    this.accessToken = String(localStorage.getItem('livechartAccessToken'));
    this.refreshToken = String(localStorage.getItem('livechartRefreshToken'));
    this.expires = Number(localStorage.getItem('livechartExpires') || 0);
    if (this.accessToken && this.accessToken !== 'null') {
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
            'Could not connect to Kitsu, please check your account settings.',
            'Kitsu Connection Error',
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
        singleAnime: { aggregateRating: { count: number; weightedValue: number } };
      }>(QUERY, { id })
      .toPromise();
    if (error || !data) {
      console.log(error);
      return;
    }
    const { aggregateRating } = data.singleAnime;
    return {
      norm: aggregateRating.weightedValue * 10,
      ratings: aggregateRating.count,
      nom: aggregateRating.weightedValue,
    };
  }

  async updateAnime(
    id?: number,
    attributes?: { status?: LivechartStatus; episodesWatched?: number; rating?: number },
  ) {
    if (!id || !attributes) return;
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
        animeId: '11016';
        attributes: {
          episodesWatched?: 3;
          rating?: null;
          status?: LivechartStatus;
        };
        ratingScale: 'RATING_10';
      }>(MUTATION, { animeId: id, attributes })
      .toPromise();
    if (error || !data) {
      console.log(error);
      return;
    }
  }

  async deleteAnime(id?: number): Promise<boolean> {
    if (!id) return false;
    const { gql } = await import('@urql/core');
    const MUTATION = gql`
      mutation DeleteLibraryEntry($animeId: ID!) {
        deleteLibraryEntry(animeId: $animeId) {
          libraryEntry {
            animeDatabaseId
          }
        }
      }
    `;
    const { data, error } = await this.client.mutation(MUTATION, { animeId: id }).toPromise();
    if (error || !data) {
      console.log(error);
      return false;
    }
    return true;
  }

  async login(
    username?: string,
    password?: string,
    saveLogin = false,
  ): Promise<string | undefined> {
    const CryptoJS = await import('crypto-js');
    if (saveLogin && username && password) {
      const usernameEncrypted = CryptoJS.AES.encrypt(username, this.key).toString();
      const passwordEncrypted = CryptoJS.AES.encrypt(password, this.key).toString();
      localStorage.setItem('livechartUsername', usernameEncrypted);
      localStorage.setItem('livechartPassword', passwordEncrypted);
    }
    if (!username && !password) {
      const usernameEncrypted = localStorage.getItem('livechartUsername') || undefined;
      const passwordEncrypted = localStorage.getItem('livechartPassword') || undefined;
      if (usernameEncrypted && passwordEncrypted) {
        username = CryptoJS.AES.decrypt(usernameEncrypted, this.key).toString(CryptoJS.enc.Utf8);
        password = CryptoJS.AES.decrypt(passwordEncrypted, this.key).toString(CryptoJS.enc.Utf8);
      }
    }

    if (!username || !password) {
      if (!this.refreshToken) {
        this.logoff();
        return;
      }
      const resultRefresh = await fetch('https://www.livechart.me/api/v2/tokens/@current', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: this.refreshToken,
        }),
      });
      if (resultRefresh.ok) {
        const response = (await resultRefresh.json()) as OauthResponse;
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
      const response = (await result.json()) as OauthResponse;
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
    if (!this.accessToken) {
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
      .query<{ viewer: { username: string } }>(QUERY, {})
      .toPromise();
    if (error || !data) {
      console.log(error);
      this.logoff();
      return;
    }
    this.loggedIn = true;
    if (refresh) {
      await this.login();
      return this.checkLogin(false);
    }
    return data.viewer.username;
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

  statusFromMal(status?: WatchStatus): LivechartStatus | undefined {
    switch (status) {
      case 'watching':
        return 'WATCHING';
      case 'completed':
        return 'COMPLETED';
      case 'on_hold':
      case 'plan_to_watch':
        return 'CONSIDERING';
      case 'dropped':
        return 'SKIPPING';
      default:
        return undefined;
    }
  }

  statusToMal(status?: LivechartStatus): WatchStatus | undefined {
    switch (status) {
      case 'WATCHING':
        return 'watching';
      case 'COMPLETED':
        return 'completed';
      case 'CONSIDERING':
        return 'plan_to_watch';
      case 'SKIPPING':
        return 'dropped';
      default:
        return undefined;
    }
  }
}

interface OauthResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
}

type LivechartStatus = 'WATCHING' | 'CONSIDERING' | 'COMPLETED' | 'SKIPPING';
