import { AnilistMediaRef, AnilistStudioDetail } from '@models/anilist';
import { Client, gql } from '@urql/core';

export class AnilistStudioService {
  constructor(private client: Client) {}

  async findByName(name: string): Promise<AnilistStudioDetail | undefined> {
    const QUERY = gql`
      query ($search: String) {
        Page(perPage: 5) {
          studios(search: $search) {
            id
            name
            siteUrl
          }
        }
      }
    `;
    const result = await this.client
      .query<{ Page?: { studios?: Array<{ id: number; name: string; siteUrl?: string }> } }>(
        QUERY,
        { search: name },
      )
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    const studios = result?.data?.Page?.studios || [];
    if (!studios.length) return undefined;
    const exact = studios.find(studio => studio.name.toLowerCase() === name.toLowerCase());
    return exact || studios[0];
  }

  async getMedia(id: number): Promise<AnilistMediaRef[]> {
    const media: AnilistMediaRef[] = [];
    let page = 1;
    let hasNextPage = true;
    while (hasNextPage) {
      const QUERY = gql`
        query ($id: Int, $page: Int) {
          Studio(id: $id) {
            media(sort: START_DATE_DESC, page: $page, perPage: 50) {
              pageInfo {
                hasNextPage
              }
              nodes {
                id
                idMal
                type
                format
                source
                title {
                  userPreferred
                }
                coverImage {
                  large
                }
              }
            }
          }
        }
      `;
      const result = await this.client
        .query<{
          Studio?: {
            media?: {
              pageInfo?: { hasNextPage?: boolean };
              nodes?: Array<{
                id: number;
                idMal?: number;
                type: 'ANIME' | 'MANGA';
                format?: string;
                source?: string;
                title: { userPreferred: string };
                coverImage?: { large?: string };
              }>;
            };
          };
        }>(QUERY, { id, page })
        .toPromise()
        .catch(error => {
          console.log({ error });
          return undefined;
        });
      const nodes = result?.data?.Studio?.media?.nodes || [];
      media.push(
        ...nodes.map(node => ({
          id: node.id,
          idMal: node.idMal,
          type: node.type,
          title: node.title.userPreferred,
          image: node.coverImage?.large,
          format: node.format,
          source: node.source,
        })),
      );
      hasNextPage = !!result?.data?.Studio?.media?.pageInfo?.hasNextPage;
      page++;
      if (!nodes.length) break;
    }
    return media;
  }
}
