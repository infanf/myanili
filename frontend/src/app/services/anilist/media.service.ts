import { ExtRating } from '@models/components';
import { Client } from '@urql/core';

export class AnilistMediaService {
  loggedIn = false;

  constructor(private client: Client) {}

  async getId(idMal: number, type: 'ANIME' | 'MANGA'): Promise<number | undefined> {
    const { gql } = await import('@urql/core');
    const QUERY = gql`
      query Media($idMal: Int, $type: MediaType) {
        Media(idMal: $idMal, type: $type) {
          id
        }
      }
    `;
    const result = await this.client
      .query<{ Media?: { id: number } }>(QUERY, { idMal, type })
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    return result?.data?.Media?.id;
  }

  async getMalId(id: number, type: 'ANIME' | 'MANGA'): Promise<number | undefined> {
    const { gql } = await import('@urql/core');
    const QUERY = gql`
      query Media($id: Int, $type: MediaType) {
        Media(id: $id, type: $type) {
          idMal
        }
      }
    `;

    const result = await this.client
      .query<{ Media?: { idMal: number } }>(QUERY, { id, type })
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    return result?.data?.Media?.idMal;
  }

  async getRating(id?: number, type: 'ANIME' | 'MANGA' = 'ANIME'): Promise<ExtRating | undefined> {
    if (!id) return;
    const { gql } = await import('@urql/core');
    const QUERY = gql`
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
    `;
    const result = await this.client
      .query<{
        Media?: { averageScore: number; stats: { scoreDistribution: Array<{ amount: number }> } };
      }>(QUERY, { id, type })
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    if (!result?.data?.Media?.averageScore) return undefined;
    return {
      nom: result.data.Media?.averageScore,
      norm: result.data.Media?.averageScore,
      unit: '%',
      ratings: result.data.Media.stats.scoreDistribution.map(a => a.amount).reduce((a, b) => a + b),
    };
  }

  async getLang(id: number): Promise<string | undefined> {
    const { gql } = await import('@urql/core');
    const QUERY = gql`
      query Media($id: Int) {
        Media(id: $id) {
          countryOfOrigin
        }
      }
    `;
    const result = await this.client
      .query<{ Media?: { countryOfOrigin: string } }>(QUERY, {
        id,
      })
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    const lang = result?.data?.Media?.countryOfOrigin;
    if (!lang) return;

    switch (lang) {
      case 'JP':
        return 'Japanese';
      case 'KR':
        return 'Korean';
      case 'CN':
        return 'Mandarin';
      default:
        break;
    }
    const languageNames = new Intl.DisplayNames(['en'], {
      type: 'language',
    });
    const languageName = languageNames.of(lang);
    if (languageName?.toLocaleLowerCase() !== lang.toLocaleLowerCase()) return languageName;
    return 'Native';
  }

  async getAirDates(id: number | number[]) {
    if (!id) return [];
    if (typeof id === 'number') id = [id];
    const { gql } = await import('@urql/core');
    const QUERY = gql`
      query media($idMal: [Int]) {
        Page {
          media(idMal_in: $idMal) {
            idMal
            airingSchedule {
              nodes {
                airingAt
                episode
              }
            }
          }
        }
      }
    `;
    const result = await this.client
      .query<{
        Page?: {
          media?: Array<{
            idMal: number;
            airingSchedule?: { nodes?: Array<{ airingAt: number; episode: number }> };
          }>;
        };
      }>(QUERY, { idMal: id })
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    if (!result?.data?.Page?.media) return [];
    const airDates = result.data.Page.media
      .filter(a => a.airingSchedule?.nodes?.length)
      .map(
        a =>
          ({
            idMal: a.idMal,
            airDates: a.airingSchedule?.nodes?.map(b => ({
              date: new Date(b.airingAt * 1000),
              episode: b.episode,
            })),
          } as AirDate),
      );
    return airDates;
  }
}

export interface AirDate {
  idMal: number;
  airDates?: Array<{
    date: Date;
    episode: number;
  }>;
}
