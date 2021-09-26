import { Injectable } from '@angular/core';
import {
  AnilistCharacters,
  AnilistMedia,
  AnilistMediaListCollection,
  AnilistMediaListStatus,
  AnilistMediaStatus,
  AnilistSaveMediaListEntry,
  AnilistUser,
} from '@models/anilist';
import { ExtRating } from '@models/components';
import { WatchStatus } from '@models/mal-anime';
import { ListManga, ReadStatus } from '@models/mal-manga';
import { ListMedia, Media, MediaCharacter, MediaStatus, PersonalStatus } from '@models/media';
import { Apollo, gql } from 'apollo-angular';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnilistService {
  private clientId = '';
  private accessToken = '';
  private refreshToken = '';
  private userSubject = new BehaviorSubject<AnilistUser | undefined>(undefined);
  loggedIn = false;
  constructor(public client: Apollo) {
    this.clientId = String(localStorage.getItem('anilistClientId'));
    this.accessToken = String(localStorage.getItem('anilistAccessToken'));
    this.refreshToken = String(localStorage.getItem('anilistRefreshToken'));
    if (this.accessToken) {
      this.checkLogin()
        .then(user => {
          this.userSubject.next(user);
        })
        .catch(e => {
          alert('Could not connect to AniList, please check your account settings.');
          localStorage.removeItem('anilistAccessToken');
        });
    }
  }

  async login() {
    return new Promise(r => {
      const loginWindow = window.open(environment.backend + 'anilistauth');
      window.addEventListener('message', async event => {
        if (event.data && event.data.anilist) {
          const data = event.data as { at: string; rt: string; ex: number; ci: string };
          this.accessToken = data.at;
          localStorage.setItem('anilistAccessToken', this.accessToken);
          this.refreshToken = data.rt;
          localStorage.setItem('anilistRefreshToken', this.refreshToken);
          this.clientId = data.ci;
          localStorage.setItem('anilistClientId', this.clientId);
          this.userSubject.next(await this.checkLogin());
        }
        loginWindow?.close();
        r(undefined);
      });
    });
  }

  get user() {
    return this.userSubject.asObservable();
  }

  async checkLogin(): Promise<AnilistUser | undefined> {
    const requestResult = await new Promise<AnilistUser | undefined>(r => {
      this.client
        .query<{ Viewer: AnilistUser }>({
          errorPolicy: 'ignore',
          query: gql`
            {
              Viewer {
                id
                name
                avatar {
                  large
                  medium
                }
              }
            }
          `,
        })
        .subscribe(
          result => {
            r(result.data.Viewer);
          },
          error => {
            console.log({ error });
            r(undefined);
          },
        );
    });
    this.loggedIn = !!requestResult;
    return requestResult;
  }

  logoff() {
    this.clientId = '';
    this.accessToken = '';
    this.refreshToken = '';
    this.userSubject.next(undefined);
    this.loggedIn = false;
    localStorage.removeItem('anilistAccessToken');
    localStorage.removeItem('anilistRefreshToken');
    localStorage.removeItem('anilistClientId');
  }

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

  async updateEntry(
    id: number,
    data: Partial<AnilistSaveMediaListEntry>,
  ): Promise<AnilistSaveMediaListEntry | undefined> {
    return new Promise(r => {
      data.mediaId = id;
      const variables = JSON.parse(JSON.stringify(data));
      this.client
        .mutate<{ SaveMediaListEntry: AnilistSaveMediaListEntry }>({
          errorPolicy: 'ignore',
          mutation: gql`
            mutation (
              $id: Int
              $mediaId: Int
              $status: MediaListStatus
              $scoreRaw: Int
              $progress: Int
              $progressVolumes: Int
              $repeat: Int
              $private: Boolean
              $notes: String
              $customLists: [String]
              $hiddenFromStatusLists: Boolean
              $advancedScores: [Float]
              $startedAt: FuzzyDateInput
              $completedAt: FuzzyDateInput
            ) {
              SaveMediaListEntry(
                id: $id
                mediaId: $mediaId
                status: $status
                scoreRaw: $scoreRaw
                progress: $progress
                progressVolumes: $progressVolumes
                repeat: $repeat
                private: $private
                notes: $notes
                customLists: $customLists
                hiddenFromStatusLists: $hiddenFromStatusLists
                advancedScores: $advancedScores
                startedAt: $startedAt
                completedAt: $completedAt
              ) {
                id
                mediaId
                status
                score
                advancedScores
                progress
                progressVolumes
                repeat
                priority
                private
                hiddenFromStatusLists
                customLists
                notes
                updatedAt
                startedAt {
                  year
                  month
                  day
                }
                completedAt {
                  year
                  month
                  day
                }
                user {
                  id
                  name
                }
                media {
                  id
                  title {
                    userPreferred
                  }
                  coverImage {
                    large
                  }
                  type
                  format
                  status
                  episodes
                  volumes
                  chapters
                  averageScore
                  popularity
                  isAdult
                  startDate {
                    year
                  }
                }
              }
            }
          `,
          variables,
        })
        .subscribe(
          result => {
            r(result?.data?.SaveMediaListEntry);
          },
          error => {
            console.log({ error });
            r(undefined);
          },
        );
    });
  }

  async get(id: number, type: 'ANIME' | 'MANGA'): Promise<Media | undefined> {
    const requestResult = await new Promise<Media | undefined>(r => {
      this.client
        .query<{ Media?: AnilistMedia }>({
          errorPolicy: 'ignore',
          query: gql`
            query media($id: Int, $type: MediaType, $isAdult: Boolean) {
              Media(id: $id, type: $type, isAdult: $isAdult) {
                id
                idMal
                title {
                  userPreferred
                  romaji
                  english
                  native
                }
                coverImage {
                  extraLarge
                  large
                }
                startDate {
                  year
                  month
                  day
                }
                endDate {
                  year
                  month
                  day
                }
                description
                season
                seasonYear
                type
                format
                status(version: 2)
                episodes
                duration
                chapters
                volumes
                genres
                synonyms
                source(version: 2)
                meanScore
                popularity
                favourites
                countryOfOrigin
                studios {
                  edges {
                    isMain
                    node {
                      id
                      name
                    }
                  }
                }
                rankings {
                  id
                  rank
                  type
                  format
                  year
                  season
                  allTime
                  context
                }
                tags {
                  id
                  name
                  description
                  rank
                  isMediaSpoiler
                  isGeneralSpoiler
                }
                mediaListEntry {
                  id
                  status
                  score
                  repeat
                  progress
                  progressVolumes
                  priority
                  notes
                  updatedAt
                  createdAt
                }
                relations {
                  edges {
                    relationType
                    node {
                      id
                      type
                      title {
                        romaji
                        english
                        native
                        userPreferred
                      }
                      episodes
                      chapters
                    }
                    id
                  }
                }
                stats {
                  statusDistribution {
                    status
                    amount
                  }
                  scoreDistribution {
                    score
                    amount
                  }
                }
              }
            }
          `,
          variables: { id, type },
        })
        .subscribe(
          result => {
            const alMedia = result.data.Media;
            if (!alMedia) return r(undefined);
            const malMedia: Media = {
              id: alMedia.id,
              id_mal: alMedia.idMal,
              type: alMedia.type === 'ANIME' ? 'anime' : 'manga',
              title: alMedia.title.romaji,
              alternative_titles: {
                en: alMedia.title.english,
                ja: alMedia.title.native,
                synonyms: alMedia.synonyms,
              },
              average_episode_duration: (alMedia.duration || 0) * 60,
              genres: alMedia.genres,
              mean: alMedia.meanScore / 10,
              source: alMedia.source,
              main_picture: {
                medium: alMedia.coverImage.large,
                large: alMedia.coverImage.extraLarge,
              },
              synopsis: alMedia.description,
              pictures: [],
              related:
                alMedia.relations?.edges.map(related => ({
                  relation_type: related.relationType.toLowerCase(),
                  relation_type_formatted: related.relationType
                    .replace('_', ' ')
                    .toLowerCase()
                    .replace(/\w\S*/g, w => w.replace(/^\w/, c => c.toUpperCase())),
                  type: related.node.type === 'ANIME' ? 'anime' : 'manga',
                  node: {
                    id: related.node.id,
                    num_parts: related.node.episodes || related.node.chapters || 0,
                    num_volumes: related.node.volumes,
                    title: related.node.title.romaji,
                  },
                })) || [],
              recommendations: [],
              companies:
                alMedia.studios?.edges
                  .filter(company => company.isMain)
                  .map(company => company.node) || [],
              opening_themes: [],
              ending_themes: [],
              num_parts: alMedia.episodes || alMedia.chapters || 0,
              num_volumes: alMedia.volumes,
              num_list_users: alMedia.popularity,
              num_scoring_users: 0,
              created_at: alMedia.mediaListEntry?.updatedAt
                ? new Date(alMedia.mediaListEntry?.updatedAt * 1000)
                : new Date(),
              updated_at: alMedia.mediaListEntry?.updatedAt
                ? new Date(alMedia.mediaListEntry?.updatedAt * 1000)
                : new Date(),
              media_type: 'tv',
              status: this.mediaStatusfromAl(alMedia.status),
              my_list_status: alMedia.mediaListEntry
                ? {
                    status: this.fromAlStatus(alMedia.mediaListEntry.status),
                    comments: alMedia.mediaListEntry.notes,
                    repeating: alMedia.mediaListEntry.status === 'REPEATING',
                    score: alMedia.mediaListEntry.score,
                    progress: alMedia.mediaListEntry.progress,
                    progress_volumes: alMedia.mediaListEntry.progressVolumes,
                    repeats: alMedia.mediaListEntry.repeat,
                    priority: 0,
                    repeat_value: 0,
                    tags: [],
                    updated_at: alMedia.mediaListEntry?.updatedAt
                      ? new Date(alMedia.mediaListEntry?.updatedAt * 1000)
                      : new Date(),
                  }
                : undefined,
            };
            r(malMedia);
          },
          error => {
            console.log({ error });
            r(undefined);
          },
        );
    });
    return requestResult;
  }

  async myList(
    mediaStatus?: PersonalStatus,
    type: 'ANIME' | 'MANGA' = 'ANIME',
  ): Promise<ListMedia[]> {
    const status = this.toAlStatus(mediaStatus);
    return new Promise(async r => {
      this.user.subscribe(user => {
        if (!user) return;
        this.client
          .query<{
            MediaListCollection: AnilistMediaListCollection;
          }>({
            errorPolicy: 'ignore',
            query: gql`
              query MediaListCollection(
                $status: [MediaListStatus]
                $userId: Int
                $type: MediaType
              ) {
                MediaListCollection(status_in: $status, userId: $userId, type: $type) {
                  lists {
                    entries {
                      status
                      progress
                      score(format: POINT_10)
                      notes
                      updatedAt
                      completedAt {
                        year
                        month
                        day
                      }
                      media {
                        id
                        idMal
                        title {
                          romaji
                          english
                          native
                          userPreferred
                        }
                        episodes
                        coverImage {
                          extraLarge
                          large
                          medium
                          color
                        }
                        startDate {
                          year
                          month
                          day
                        }
                        endDate {
                          year
                          month
                          day
                        }
                        season
                        seasonYear
                      }
                    }
                  }
                }
              }
            `,
            variables: {
              userId: user?.id,
              status: status === 'CURRENT' ? [status, 'REPEATING'] : [status],
              type,
            },
          })
          .subscribe(result => {
            if (result.data) {
              const malList: ListMedia[] = [];
              for (const list of result.data.MediaListCollection.lists) {
                for (const entry of list.entries) {
                  const media = entry.media;
                  malList.push({
                    node: {
                      id: media.id,
                      id_mal: media.idMal,
                      title: media.title.romaji,
                      alternative_titles: {
                        en: media.title.english,
                        ja: media.title.native,
                      },
                      num_parts: media.episodes || media.chapters || 0,
                      num_volumes: media.volumes,
                      main_picture: media.coverImage
                        ? {
                            medium: media.coverImage.large,
                            large: media.coverImage.extraLarge,
                          }
                        : undefined,
                      start_date: undefined,
                      end_date: undefined,
                      start_season: {
                        season: (media.season || '').toLowerCase() as
                          | 'winter'
                          | 'spring'
                          | 'summer'
                          | 'fall',
                        year: media.seasonYear,
                      },
                    },
                    list_status: {
                      comments: entry.notes,
                      repeating: false,
                      progress: entry.progress,
                      progress_volumes: entry.progressVolumes,
                      repeats: 0,
                      priority: 0,
                      repeat_value: 0,
                      score: entry.score / 10,
                      tags: [],
                      updated_at: new Date(entry.updatedAt * 1000),
                      finish_date: entry.comletedAt
                        ? new Date(
                            `${entry.comletedAt.year}-${entry.comletedAt.month}-${entry.comletedAt.day}`,
                          )
                        : undefined,
                      start_date: undefined,
                      status: this.fromAlStatus(entry.status),
                    },
                  });
                }
              }
              r(malList);
            }
          });
      });
    });
  }

  async myMangaList(malStatus?: ReadStatus): Promise<ListManga[]> {
    const status = this.statusFromMal(malStatus);
    return new Promise(async r => {
      this.user.subscribe(user => {
        if (!user) return;
        this.client
          .query<{
            MediaListCollection: AnilistMediaListCollection;
          }>({
            errorPolicy: 'ignore',
            query: gql`
              query MediaListCollection(
                $status: [MediaListStatus]
                $userId: Int
                $type: MediaType
              ) {
                MediaListCollection(status_in: $status, userId: $userId, type: $type) {
                  lists {
                    name
                    isCustomList
                    isSplitCompletedList
                    status
                    entries {
                      progress
                      progressVolumes
                      status
                      score(format: POINT_10)
                      notes
                      updatedAt
                      completedAt {
                        year
                        month
                        day
                      }
                      media {
                        id
                        idMal
                        title {
                          romaji
                          english
                          native
                          userPreferred
                        }
                        staff {
                          edges {
                            id
                            node {
                              id
                              name {
                                first
                                last
                                full
                                native
                              }
                            }
                            role
                          }
                        }
                        volumes
                        chapters
                        coverImage {
                          extraLarge
                          large
                          medium
                          color
                        }
                        startDate {
                          year
                          month
                          day
                        }
                        endDate {
                          year
                          month
                          day
                        }
                      }
                    }
                  }
                }
              }
            `,
            variables: {
              userId: user?.id,
              status: status === 'CURRENT' ? [status, 'REPEATING'] : [status],
              type: 'MANGA',
            },
          })
          .subscribe(result => {
            if (result.data) {
              const malList: ListManga[] = [];
              for (const list of result.data.MediaListCollection.lists) {
                for (const entry of list.entries) {
                  const media = entry.media;
                  malList.push({
                    node: {
                      id: media.idMal || 0,
                      title: media.title.romaji,
                      alternative_titles: {
                        en: media.title.english,
                        ja: media.title.native,
                      },
                      authors: media.staff.edges.map(edge => ({
                        role: edge.role,
                        node: {
                          id: edge.node.id,
                          first_name: edge.node.name.first,
                          last_name: edge.node.name.last,
                        },
                      })),
                      num_chapters: media.episodes,
                      num_volumes: media.volumes,
                      main_picture: media.coverImage
                        ? {
                            medium: media.coverImage.large,
                            large: media.coverImage.extraLarge,
                          }
                        : undefined,
                      start_date: undefined,
                      end_date: undefined,
                    },
                    list_status: {
                      comments: entry.notes,
                      is_rereading: entry.status === 'REPEATING',
                      num_chapters_read: entry.progress,
                      num_volumes_read: entry.progressVolumes || 0,
                      num_times_reread: 0,
                      priority: 0,
                      reread_value: 0,
                      score: 0,
                      tags: '',
                      updated_at: new Date(entry.updatedAt),
                      finish_date: entry.comletedAt
                        ? new Date(
                            `${entry.comletedAt.year}-${entry.comletedAt.month}-${entry.comletedAt.day}`,
                          )
                        : undefined,
                      start_date: undefined,
                      status: this.statusToMal(entry.status, 'MANGA') as ReadStatus,
                    },
                  });
                }
              }
              r(malList);
            }
          });
      });
    });
  }

  async getMediaListId(id: number): Promise<number | undefined> {
    return new Promise(async r => {
      const user = await new Promise<AnilistUser | undefined>(res => this.user.subscribe(res));
      if (!user) {
        return r(undefined);
      }
      this.client
        .query<{ MediaList?: { id: number } }>({
          errorPolicy: 'ignore',
          query: gql`
            query MediaList($id: Int, $userId: Int) {
              MediaList(mediaId: $id, userId: $userId) {
                id
              }
            }
          `,
          variables: { id, userId: user.id },
        })
        .subscribe(
          result => {
            r(result.data.MediaList?.id);
          },
          error => {
            console.log({ error });
            r(undefined);
          },
        );
    });
  }

  async deleteEntry(mediaId?: number): Promise<{ deleted: boolean; msg?: string }> {
    if (!mediaId) {
      return { deleted: false, msg: 'No mediaId provided' };
    }
    return new Promise(async r => {
      const id = await this.getMediaListId(mediaId);
      if (!id) {
        r({ deleted: false });
        return;
      }
      const variables = { id };
      this.client
        .mutate<{ DeleteMediaListEntry: { deleted: boolean } }>({
          errorPolicy: 'ignore',
          mutation: gql`
            mutation ($id: Int) {
              DeleteMediaListEntry(id: $id) {
                deleted
              }
            }
          `,
          variables,
        })
        .subscribe(
          result => {
            r({ deleted: result.data?.DeleteMediaListEntry.deleted || false });
          },
          error => {
            console.log({ error });
            r({ deleted: false, msg: error.message });
          },
        );
    });
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

  async getCharacters(id?: number): Promise<MediaCharacter[]> {
    if (!id) return [];
    return new Promise(r => {
      this.client
        .query<{
          Media?: { characters: AnilistCharacters };
        }>({
          errorPolicy: 'ignore',
          query: gql`
            query media($id: Int) {
              Media(id: $id) {
                characters {
                  edges {
                    role
                    node {
                      id
                      name {
                        full
                        native
                      }
                      image {
                        large
                        medium
                      }
                    }
                    voiceActors(language: JAPANESE) {
                      id
                      name {
                        full
                        native
                      }
                      image {
                        large
                        medium
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { id },
        })
        .subscribe(
          result => {
            const characters = result.data.Media?.characters?.edges?.map(
              edge =>
                ({
                  id: edge.node.id,
                  name: edge.node.name.full,
                  image_url: edge.node.image.large || edge.node.image.medium,
                  url: `https://anilist.co/character/${edge.node.id}`,
                  role: edge.role,
                  voice_actors: edge.voiceActors.map(va => ({
                    language: 'Japanese',
                    image_url: va.image.large || va.image.medium,
                    mal_id: va.id,
                    name: va.name.full,
                    url: `https://anilist.co/staff/${va.id}`,
                  })),
                } as MediaCharacter),
            );
            r(characters || []);
          },
          e => {
            console.log({ e });
            r([]);
          },
        );
    });
  }

  toAlStatus(mediaStatus?: PersonalStatus, repeating = false): AnilistMediaListStatus | undefined {
    switch (mediaStatus) {
      case 'on_hold':
        return 'PAUSED';
      case 'completed':
        return repeating ? 'REPEATING' : 'COMPLETED';
      case 'current':
      case 'dropped':
      case 'planning':
        return mediaStatus.toUpperCase() as AnilistMediaListStatus;
      default:
        return undefined;
    }
  }

  fromAlStatus(mediaStatus?: AnilistMediaListStatus): PersonalStatus | undefined {
    switch (mediaStatus) {
      case 'PAUSED':
        return 'on_hold';
      case 'REPEATING':
        return 'completed';
      case 'COMPLETED':
      case 'CURRENT':
      case 'DROPPED':
      case 'PLANNING':
        return mediaStatus.toLowerCase() as PersonalStatus;
      default:
        return undefined;
    }
  }

  statusFromMal(
    malStatus?: WatchStatus | ReadStatus,
    repeating = false,
  ): AnilistMediaListStatus | undefined {
    switch (malStatus) {
      case 'plan_to_read':
      case 'plan_to_watch':
        return 'PLANNING';
      case 'completed':
        return repeating ? 'REPEATING' : 'COMPLETED';
      case 'dropped':
        return 'DROPPED';
      case 'on_hold':
        return 'PAUSED';
      case 'reading':
      case 'watching':
        return 'CURRENT';
      default:
        return undefined;
    }
  }

  statusToMal(
    alStatus?: AnilistMediaListStatus,
    type: 'ANIME' | 'MANGA' = 'ANIME',
  ): WatchStatus | ReadStatus | undefined {
    switch (alStatus) {
      case 'PLANNING':
        return type === 'MANGA' ? 'plan_to_read' : 'plan_to_watch';
      case 'CURRENT':
        return type === 'MANGA' ? 'reading' : 'watching';
      case 'REPEATING':
      case 'COMPLETED':
        return 'completed';
      case 'PAUSED':
        return 'on_hold';
      case 'DROPPED':
        return 'dropped';
      default:
        return undefined;
    }
  }

  mediaStatusfromAl(alStatus?: AnilistMediaStatus): MediaStatus {
    switch (alStatus) {
      case 'FINISHED':
        return 'finished';
      case 'CANCELLED':
        return 'cancelled';
      case 'HIATUS':
        return 'hiatus';
      case 'RELEASING':
        return 'current';
      default:
        return 'not_yet_released';
    }
  }
}
