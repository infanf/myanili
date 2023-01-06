import { Injectable } from '@angular/core';
import { ExtRating } from '@models/components';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class AnilistMediaService {
  loggedIn = false;

  constructor(private client: Apollo) {}

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
}
