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
}
