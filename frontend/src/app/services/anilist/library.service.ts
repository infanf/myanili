import { Injectable } from '@angular/core';
import { AnilistSaveMedialistEntry, AnilistUser, User } from '@models/anilist';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnilistLibraryService {
  constructor(private client: Apollo, private user: Observable<User | undefined>) {}

  async updateEntry(id: number, data: Partial<AnilistSaveMedialistEntry>) {
    return new Promise(r => {
      data.mediaId = id;
      const variables = JSON.parse(JSON.stringify(data));
      this.client
        .mutate({
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
        .subscribe(r, error => {
          console.log({ error });
          r(undefined);
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
}
