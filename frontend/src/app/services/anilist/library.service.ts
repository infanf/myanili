import { AnilistSaveMedialistEntry, AnilistUser, User } from '@models/anilist';
import { Client } from '@urql/core';
import { Observable } from 'rxjs';

export class AnilistLibraryService {
  constructor(private client: Client, private user: Observable<User | undefined>) {}

  async updateEntry(id: number, data: Partial<AnilistSaveMedialistEntry>) {
    const { gql } = await import('@urql/core');
    const QUERY = gql`
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
    `;
    data.mediaId = id;
    const variables = JSON.parse(JSON.stringify(data));
    return this.client
      .mutation(QUERY, variables)
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
  }

  async getMediaListId(id: number): Promise<number | undefined> {
    const user = await new Promise<AnilistUser | undefined>(res => this.user.subscribe(res));
    if (!user) {
      return undefined;
    }
    const { gql } = await import('@urql/core');
    const QUERY = gql`
      query MediaList($id: Int, $userId: Int) {
        MediaList(mediaId: $id, userId: $userId) {
          id
        }
      }
    `;
    return this.client
      .query<{ MediaList?: { id: number } }>(QUERY, { id, userId: user.id })
      .toPromise()
      .then(result => result.data?.MediaList?.id)
      .catch(error => {
        console.log({ error });
        return undefined;
      });
  }

  async deleteEntry(mediaId?: number): Promise<{ deleted: boolean; msg?: string }> {
    if (!mediaId) {
      return { deleted: false, msg: 'No mediaId provided' };
    }
    const id = await this.getMediaListId(mediaId);
    if (!id) {
      return { deleted: false };
    }
    const { gql } = await import('@urql/core');
    const QUERY = gql`
      mutation ($id: Int) {
        DeleteMediaListEntry(id: $id) {
          deleted
        }
      }
    `;
    return this.client
      .mutation<{ DeleteMediaListEntry: { deleted: boolean } }>(QUERY, { id })
      .toPromise()
      .then(result => ({ deleted: result.data?.DeleteMediaListEntry.deleted || false }))
      .catch(error => {
        console.log({ error });
        return { deleted: false, msg: error.message };
      });
  }
}
