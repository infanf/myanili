import { Injectable } from '@angular/core';
import { ExtRating } from '@models/components';
import { Client } from '@urql/core';

@Injectable({
  providedIn: 'root',
})
export class LivechartService {
  private client!: Client;

  constructor() {
    const { createClient } = require('@urql/core') as typeof import('@urql/core');
    this.client = createClient({
      url: 'https://www.livechart.me/graphql',
    });
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
}
