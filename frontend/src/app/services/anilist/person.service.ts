import {
  AnilistStaffDetail,
  AnilistStaffMediaRole,
  AnilistStaffVoiceRole,
  localizeAnilistLinks,
} from '@models/anilist';
import { Client, gql } from '@urql/core';

export class AnilistPersonService {
  constructor(private client: Client) {}

  async getPerson(id: number): Promise<AnilistStaffDetail | undefined> {
    const QUERY = gql`
      query ($id: Int) {
        Staff(id: $id) {
          id
          name {
            full
            native
            alternative
          }
          image {
            large
          }
          description(asHtml: true)
          primaryOccupations
          dateOfBirth {
            year
            month
            day
          }
          siteUrl
        }
      }
    `;
    const result = await this.client
      .query<{
        Staff?: {
          id: number;
          name: { full: string; native?: string; alternative?: string[] };
          image?: { large?: string };
          description?: string;
          primaryOccupations?: string[];
          dateOfBirth?: { year?: number; month?: number; day?: number };
          siteUrl?: string;
        };
      }>(QUERY, { id })
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    const staff = result?.data?.Staff;
    if (!staff) return undefined;
    return {
      id: staff.id,
      name: {
        full: staff.name.full,
        native: staff.name.native,
        alternative: staff.name.alternative?.filter(Boolean),
      },
      image: staff.image?.large,
      description: staff.description && localizeAnilistLinks(staff.description),
      primaryOccupations: staff.primaryOccupations?.filter(Boolean),
      dateOfBirth: staff.dateOfBirth,
      siteUrl: staff.siteUrl,
    };
  }

  async getVoiceRoles(id: number): Promise<AnilistStaffVoiceRole[]> {
    const QUERY = gql`
      query ($id: Int) {
        Staff(id: $id) {
          characterMedia(perPage: 50) {
            edges {
              characterRole
              node {
                id
                idMal
                type
                title {
                  userPreferred
                }
                coverImage {
                  large
                }
              }
              characters {
                id
                name {
                  full
                }
                image {
                  large
                }
              }
            }
          }
        }
      }
    `;
    const result = await this.client
      .query<{
        Staff?: {
          characterMedia?: {
            edges?: Array<{
              characterRole: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
              node: {
                id: number;
                idMal?: number;
                type: 'ANIME' | 'MANGA';
                title: { userPreferred: string };
                coverImage?: { large?: string };
              };
              characters?: Array<{
                id: number;
                name: { full: string };
                image?: { large?: string };
              }>;
            }>;
          };
        };
      }>(QUERY, { id })
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    const edges = result?.data?.Staff?.characterMedia?.edges || [];
    const roles: AnilistStaffVoiceRole[] = [];
    for (const edge of edges) {
      if (edge.node.type !== 'ANIME') continue;
      for (const character of edge.characters || []) {
        roles.push({
          role: edge.characterRole,
          character: {
            id: character.id,
            name: character.name.full,
            image: character.image?.large,
          },
          media: {
            id: edge.node.id,
            idMal: edge.node.idMal,
            type: edge.node.type,
            title: edge.node.title.userPreferred,
            image: edge.node.coverImage?.large,
          },
        });
      }
    }
    return roles;
  }

  async getMediaRoles(id: number, type: 'ANIME' | 'MANGA'): Promise<AnilistStaffMediaRole[]> {
    const QUERY = gql`
      query ($id: Int, $type: MediaType) {
        Staff(id: $id) {
          staffMedia(type: $type, perPage: 50) {
            edges {
              staffRole
              node {
                id
                idMal
                type
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
      }
    `;
    const result = await this.client
      .query<{
        Staff?: {
          staffMedia?: {
            edges?: Array<{
              staffRole?: string;
              node: {
                id: number;
                idMal?: number;
                type: 'ANIME' | 'MANGA';
                title: { userPreferred: string };
                coverImage?: { large?: string };
              };
            }>;
          };
        };
      }>(QUERY, { id, type })
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    const edges = result?.data?.Staff?.staffMedia?.edges || [];
    return edges.map(edge => ({
      role: edge.staffRole,
      media: {
        id: edge.node.id,
        idMal: edge.node.idMal,
        type: edge.node.type,
        title: edge.node.title.userPreferred,
        image: edge.node.coverImage?.large,
      },
    }));
  }
}
