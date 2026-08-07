import {
  AnilistMediaSearchResult,
  AnilistWorkCharacter,
  AnilistWorkRelation,
  AnilistWorkStaff,
} from '@models/anilist';
import { ExtRating } from '@models/components';
import { Client, gql } from '@urql/core';

export class AnilistMediaService {
  loggedIn = false;

  constructor(private client: Client) {}

  async getId(idMal: number, type: 'ANIME' | 'MANGA'): Promise<number | undefined> {
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

  async search(
    search: string,
    type: 'ANIME' | 'MANGA',
    perPage = 25,
  ): Promise<AnilistMediaSearchResult[]> {
    if (!search) return [];
    const QUERY = gql`
      query ($search: String, $type: MediaType, $perPage: Int) {
        Page(perPage: $perPage) {
          media(search: $search, type: $type, sort: SEARCH_MATCH) {
            id
            idMal
            format
            genres
            description(asHtml: true)
            title {
              romaji
              english
              native
            }
            startDate {
              year
            }
            coverImage {
              medium
            }
          }
        }
      }
    `;
    const result = await this.client
      .query<{
        Page?: {
          media?: Array<{
            id: number;
            idMal?: number;
            format?: string;
            genres?: string[];
            description?: string;
            title: { romaji?: string; english?: string; native?: string };
            startDate?: { year?: number };
            coverImage?: { medium?: string };
          }>;
        };
      }>(QUERY, { search, type, perPage })
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    return (result?.data?.Page?.media || []).map(media => ({
      id: media.id,
      idMal: media.idMal,
      title: media.title.romaji || media.title.english || media.title.native || String(media.id),
      year: media.startDate?.year,
      image: media.coverImage?.medium,
      description: media.description,
      genres: media.genres,
      format: media.format,
    }));
  }

  async getRating(id?: number, type: 'ANIME' | 'MANGA' = 'ANIME'): Promise<ExtRating | undefined> {
    if (!id) return;
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
          }) as AirDate,
      );
    return airDates;
  }

  async getExternalWebsite(id: number): Promise<string | undefined> {
    const QUERY = gql`
      query ($id: Int) {
        Media(id: $id) {
          externalLinks {
            site
            url
            type
          }
        }
      }
    `;
    const result = await this.client
      .query<{
        Media?: { externalLinks?: Array<{ site: string; url?: string; type?: string }> };
      }>(QUERY, { id })
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    const links = result?.data?.Media?.externalLinks || [];
    return links.find(link => link.type === 'INFO' && link.site.includes('Official'))?.url;
  }

  async getRelations(id: number): Promise<AnilistWorkRelation[]> {
    const QUERY = gql`
      query ($id: Int) {
        Media(id: $id) {
          relations {
            edges {
              relationType
              node {
                id
                idMal
                type
                title {
                  userPreferred
                }
              }
            }
          }
        }
      }
    `;
    const result = await this.client
      .query<{
        Media?: {
          relations?: {
            edges?: Array<{
              relationType: string;
              node: {
                id: number;
                idMal?: number;
                type: 'ANIME' | 'MANGA';
                title: { userPreferred: string };
              };
            }>;
          };
        };
      }>(QUERY, { id })
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    const edges = result?.data?.Media?.relations?.edges || [];
    return edges.map(edge => ({
      relationType: edge.relationType,
      node: {
        id: edge.node.id,
        idMal: edge.node.idMal,
        type: edge.node.type,
        title: edge.node.title.userPreferred,
      },
    }));
  }

  async getCharacters(id: number): Promise<AnilistWorkCharacter[]> {
    const QUERY = gql`
      query ($id: Int) {
        Media(id: $id) {
          characters(sort: ROLE, perPage: 50) {
            edges {
              role
              node {
                id
                name {
                  full
                }
                image {
                  large
                }
              }
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
        Media?: {
          characters?: {
            edges?: Array<{
              role: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
              node: { id: number; name: { full: string }; image?: { large?: string } };
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
    const edges = result?.data?.Media?.characters?.edges || [];
    return edges.map(edge => ({
      character: { id: edge.node.id, name: edge.node.name.full, image: edge.node.image?.large },
      role: edge.role,
      voiceActors: (edge.voiceActors || []).map(actor => ({
        id: actor.id,
        name: actor.name.full,
        image: actor.image?.large,
        language: actor.languageV2,
      })),
    }));
  }

  async getStaff(id: number): Promise<AnilistWorkStaff[]> {
    const QUERY = gql`
      query ($id: Int) {
        Media(id: $id) {
          staff(perPage: 50) {
            edges {
              role
              node {
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
        Media?: {
          staff?: {
            edges?: Array<{
              role: string;
              node: { id: number; name: { full: string }; image?: { large?: string } };
            }>;
          };
        };
      }>(QUERY, { id })
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    const edges = result?.data?.Media?.staff?.edges || [];
    const grouped = new Map<number, AnilistWorkStaff>();
    for (const edge of edges) {
      const existing = grouped.get(edge.node.id);
      if (existing) {
        existing.positions.push(edge.role);
      } else {
        grouped.set(edge.node.id, {
          person: { id: edge.node.id, name: edge.node.name.full, image: edge.node.image?.large },
          positions: [edge.role],
        });
      }
    }
    return [...grouped.values()];
  }
}

export interface AirDate {
  idMal: number;
  airDates?: Array<{
    date: Date;
    episode: number;
  }>;
}
