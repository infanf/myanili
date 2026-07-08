import {
  AnilistCharacterDetail,
  AnilistCharacterMediaRole,
  AnilistCharacterVoiceActor,
  localizeAnilistLinks,
} from '@models/anilist';
import { Client, gql } from '@urql/core';

export class AnilistCharacterService {
  constructor(private client: Client) {}

  async getCharacter(id: number): Promise<AnilistCharacterDetail | undefined> {
    const QUERY = gql`
      query ($id: Int) {
        Character(id: $id) {
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
          gender
          age
          siteUrl
        }
      }
    `;
    const result = await this.client
      .query<{
        Character?: {
          id: number;
          name: { full: string; native?: string; alternative?: string[] };
          image?: { large?: string };
          description?: string;
          gender?: string;
          age?: string;
          siteUrl?: string;
        };
      }>(QUERY, { id })
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    const character = result?.data?.Character;
    if (!character) return undefined;
    return {
      id: character.id,
      name: {
        full: character.name.full,
        native: character.name.native,
        alternative: character.name.alternative?.filter(Boolean),
      },
      image: character.image?.large,
      description: character.description && localizeAnilistLinks(character.description),
      gender: character.gender,
      age: character.age,
      siteUrl: character.siteUrl,
    };
  }

  async getMediaRoles(id: number, type: 'ANIME' | 'MANGA'): Promise<AnilistCharacterMediaRole[]> {
    const QUERY = gql`
      query ($id: Int, $type: MediaType) {
        Character(id: $id) {
          media(type: $type, perPage: 50) {
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
            }
          }
        }
      }
    `;
    const result = await this.client
      .query<{
        Character?: {
          media?: {
            edges?: Array<{
              characterRole: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
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
    const edges = result?.data?.Character?.media?.edges || [];
    return edges.map(edge => ({
      role: edge.characterRole,
      media: {
        id: edge.node.id,
        idMal: edge.node.idMal,
        type: edge.node.type,
        title: edge.node.title.userPreferred,
        image: edge.node.coverImage?.large,
      },
    }));
  }

  async getVoiceActors(id: number): Promise<AnilistCharacterVoiceActor[]> {
    const QUERY = gql`
      query ($id: Int) {
        Character(id: $id) {
          media(type: ANIME, perPage: 50) {
            edges {
              voiceActors {
                id
                name {
                  full
                }
                image {
                  large
                }
                languageV2
              }
            }
          }
        }
      }
    `;
    const result = await this.client
      .query<{
        Character?: {
          media?: {
            edges?: Array<{
              voiceActors?: Array<{
                id: number;
                name: { full: string };
                image?: { large?: string };
                languageV2?: string;
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
    const edges = result?.data?.Character?.media?.edges || [];
    const seen = new Map<number, AnilistCharacterVoiceActor>();
    for (const edge of edges) {
      for (const actor of edge.voiceActors || []) {
        if (seen.has(actor.id)) continue;
        seen.set(actor.id, {
          language: actor.languageV2 || 'Unknown',
          actor: { id: actor.id, name: actor.name.full, image: actor.image?.large },
        });
      }
    }
    return [...seen.values()];
  }
}
