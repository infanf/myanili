import { AnilistActivity } from '@models/anilist';
import { Client, gql } from '@urql/core';
import { BehaviorSubject, Observable } from 'rxjs';

export class AnilistFeedService {
  private feedSubject = new BehaviorSubject<AnilistActivity[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private client: Client) {}

  /**
   * Load user activity feed
   * @param userId - The user ID to load feed for (undefined for viewer's own feed)
   * @param perPage - Number of activities per page
   * @param page - Page number
   */
  async loadUserFeed(userId?: number, perPage = 25, page = 1) {
    this.loadingSubject.next(true);
    const QUERY = AnilistFeedService.getUserFeedQuery();

    try {
      const result = await this.client
        .query<UserFeedResult>(QUERY, { userId, perPage, page })
        .toPromise();

      if (!result.data?.Page?.activities) {
        console.warn('No activities in user feed result:', result);
        this.feedSubject.next([]);
        this.loadingSubject.next(false);
        return;
      }

      const activities = result.data.Page.activities.map(AnilistFeedService.mapActivity);
      this.feedSubject.next(activities);
    } catch (error) {
      console.error('Error loading user feed:', error);
      this.feedSubject.next([]);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Load following feed (activities from users the viewer is following)
   * @param perPage - Number of activities per page
   * @param page - Page number
   */
  async loadFollowingFeed(perPage = 25, page = 1) {
    this.loadingSubject.next(true);
    const QUERY = AnilistFeedService.getFollowingFeedQuery();

    try {
      const result = await this.client
        .query<FollowingFeedResult>(QUERY, { perPage, page, isFollowing: true })
        .toPromise();

      if (!result.data?.Page?.activities) {
        console.warn('No activities in following feed result:', result);
        this.feedSubject.next([]);
        this.loadingSubject.next(false);
        return;
      }

      const activities = result.data.Page.activities.map(AnilistFeedService.mapActivity);
      this.feedSubject.next(activities);
    } catch (error) {
      console.error('Error loading following feed:', error);
      this.feedSubject.next([]);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Load a single activity
   * @param activityId - The activity ID to load
   */
  async loadActivity(activityId: number) {
    this.loadingSubject.next(true);
    const QUERY = AnilistFeedService.getActivityQuery();

    try {
      const result = await this.client.query<ActivityResult>(QUERY, { id: activityId }).toPromise();

      if (!result.data?.Activity) {
        console.warn('No activity found:', result);
        this.feedSubject.next([]);
        this.loadingSubject.next(false);
        return;
      }

      const activity = AnilistFeedService.mapActivity(result.data.Activity);
      this.feedSubject.next([activity]);
    } catch (error) {
      console.error('Error loading activity:', error);
      this.feedSubject.next([]);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Toggle like on an activity
   * @param activityId - The activity ID to like/unlike
   */
  async toggleLike(activityId: number): Promise<boolean> {
    const MUTATION = gql`
      mutation ($activityId: Int) {
        ToggleLikeV2(id: $activityId, type: ACTIVITY) {
          ... on ListActivity {
            id
            isLiked
            likeCount
          }
          ... on TextActivity {
            id
            isLiked
            likeCount
          }
          ... on MessageActivity {
            id
            isLiked
            likeCount
          }
        }
      }
    `;

    try {
      const result = await this.client.mutation(MUTATION, { activityId }).toPromise();
      if (result.data) {
        // Update the feed with the new like status
        const currentFeed = this.feedSubject.value;
        const updatedFeed = currentFeed.map(activity => {
          if (activity.id === activityId) {
            const liked = result.data.ToggleLikeV2.isLiked;
            return {
              ...activity,
              isLiked: liked,
              likeCount: result.data.ToggleLikeV2.likeCount,
            };
          }
          return activity;
        });
        this.feedSubject.next(updatedFeed);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error toggling like:', error);
      return false;
    }
  }

  /**
   * Post a reply to an activity
   * @param activityId - The activity ID to reply to
   * @param text - The reply text
   */
  async postReply(activityId: number, text: string): Promise<boolean> {
    const MUTATION = gql`
      mutation ($activityId: Int, $text: String) {
        SaveActivityReply(activityId: $activityId, text: $text) {
          id
          text
          createdAt
          user {
            id
            name
            avatar {
              large
            }
          }
        }
      }
    `;

    try {
      const result = await this.client.mutation(MUTATION, { activityId, text }).toPromise();
      if (result.data?.SaveActivityReply) {
        // Update the feed with the new reply
        const currentFeed = this.feedSubject.value;
        const updatedFeed = currentFeed.map(activity => {
          if (activity.id === activityId) {
            const newReply = {
              id: result.data.SaveActivityReply.id,
              text: result.data.SaveActivityReply.text,
              createdAt: result.data.SaveActivityReply.createdAt,
              user: result.data.SaveActivityReply.user,
            };
            return {
              ...activity,
              replies: [...(activity.replies || []), newReply],
              replyCount: activity.replyCount + 1,
            };
          }
          return activity;
        });
        this.feedSubject.next(updatedFeed);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error posting reply:', error);
      return false;
    }
  }

  get feed(): Observable<AnilistActivity[]> {
    return this.feedSubject.asObservable();
  }

  get loading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  private static mapActivity(activity: Activity): AnilistActivity {
    // For MessageActivity, use messenger as the user
    const user = activity.user ||
      activity.messenger || {
        id: 0,
        name: 'Unknown',
        avatar: { large: '' },
      };

    return {
      id: activity.id,
      type: activity.type,
      createdAt: activity.createdAt,
      user,
      text: activity.text || activity.message,
      status: activity.status,
      progress: activity.progress,
      media: activity.media,
      replies: activity.replies,
      likes: activity.likes,
      replyCount: activity.replyCount,
      likeCount: activity.likeCount,
      isLiked: activity.isLiked || false,
      siteUrl: activity.siteUrl,
    };
  }

  private static getUserFeedQuery() {
    return gql`
      query ($userId: Int, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          activities(userId: $userId, sort: ID_DESC) {
            ... on ListActivity {
              id
              type
              status
              progress
              createdAt
              media {
                id
                idMal
                type
                format
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
                title {
                  userPreferred
                }
                coverImage {
                  large
                }
              }
              user {
                id
                name
                avatar {
                  large
                }
              }
              replies {
                id
                text
                createdAt
                user {
                  id
                  name
                  avatar {
                    large
                  }
                }
              }
              likes {
                id
                name
              }
              replyCount
              likeCount
              isLiked
              siteUrl
            }
            ... on TextActivity {
              id
              type
              text
              createdAt
              user {
                id
                name
                avatar {
                  large
                }
              }
              replies {
                id
                text
                createdAt
                user {
                  id
                  name
                  avatar {
                    large
                  }
                }
              }
              likes {
                id
                name
              }
              replyCount
              likeCount
              isLiked
              siteUrl
            }
            ... on MessageActivity {
              id
              type
              message
              createdAt
              messenger {
                id
                name
                avatar {
                  large
                }
              }
              recipient {
                id
                name
                avatar {
                  large
                }
              }
              replies {
                id
                text
                createdAt
                user {
                  id
                  name
                  avatar {
                    large
                  }
                }
              }
              likes {
                id
                name
              }
              replyCount
              likeCount
              isLiked
              siteUrl
            }
          }
        }
      }
    `;
  }

  private static getFollowingFeedQuery() {
    return gql`
      query ($page: Int, $perPage: Int, $isFollowing: Boolean) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          activities(isFollowing: $isFollowing, sort: ID_DESC) {
            ... on ListActivity {
              id
              type
              status
              progress
              createdAt
              media {
                id
                idMal
                type
                format
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
                title {
                  userPreferred
                }
                coverImage {
                  large
                }
              }
              user {
                id
                name
                avatar {
                  large
                }
              }
              replies {
                id
                text
                createdAt
                user {
                  id
                  name
                  avatar {
                    large
                  }
                }
              }
              likes {
                id
                name
              }
              replyCount
              likeCount
              isLiked
              siteUrl
            }
            ... on TextActivity {
              id
              type
              text
              createdAt
              user {
                id
                name
                avatar {
                  large
                }
              }
              replies {
                id
                text
                createdAt
                user {
                  id
                  name
                  avatar {
                    large
                  }
                }
              }
              likes {
                id
                name
              }
              replyCount
              likeCount
              isLiked
              siteUrl
            }
            ... on MessageActivity {
              id
              type
              message
              createdAt
              messenger {
                id
                name
                avatar {
                  large
                }
              }
              recipient {
                id
                name
                avatar {
                  large
                }
              }
              replies {
                id
                text
                createdAt
                user {
                  id
                  name
                  avatar {
                    large
                  }
                }
              }
              likes {
                id
                name
              }
              replyCount
              likeCount
              isLiked
              siteUrl
            }
          }
        }
      }
    `;
  }

  private static getActivityQuery() {
    return gql`
      query ($id: Int) {
        Activity(id: $id) {
          ... on ListActivity {
            id
            type
            status
            progress
            createdAt
            media {
              id
              idMal
              type
              format
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
              title {
                userPreferred
              }
              coverImage {
                large
              }
            }
            user {
              id
              name
              avatar {
                large
              }
            }
            replies {
              id
              text
              createdAt
              user {
                id
                name
                avatar {
                  large
                }
              }
            }
            likes {
              id
              name
            }
            replyCount
            likeCount
            isLiked
            siteUrl
          }
          ... on TextActivity {
            id
            type
            text
            createdAt
            user {
              id
              name
              avatar {
                large
              }
            }
            replies {
              id
              text
              createdAt
              user {
                id
                name
                avatar {
                  large
                }
              }
            }
            likes {
              id
              name
            }
            replyCount
            likeCount
            isLiked
            siteUrl
          }
          ... on MessageActivity {
            id
            type
            message
            createdAt
            messenger {
              id
              name
              avatar {
                large
              }
            }
            recipient {
              id
              name
              avatar {
                large
              }
            }
            replies {
              id
              text
              createdAt
              user {
                id
                name
                avatar {
                  large
                }
              }
            }
            likes {
              id
              name
            }
            replyCount
            likeCount
            isLiked
            siteUrl
          }
        }
      }
    `;
  }
}

interface ActivityResult {
  Activity: Activity;
}

interface UserFeedResult {
  Page: {
    pageInfo: PageInfo;
    activities: Activity[];
  };
}

interface FollowingFeedResult {
  Page: {
    pageInfo: PageInfo;
    activities: Activity[];
  };
}

interface PageInfo {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
}

interface Activity {
  id: number;
  type: string;
  createdAt: number;
  text?: string;
  status?: string;
  progress?: string;
  message?: string;
  user: {
    id: number;
    name: string;
    avatar: {
      large: string;
    };
  };
  messenger?: {
    id: number;
    name: string;
    avatar: {
      large: string;
    };
  };
  recipient?: {
    id: number;
    name: string;
    avatar: {
      large: string;
    };
  };
  media?: {
    id: number;
    idMal?: number;
    type: 'ANIME' | 'MANGA';
    startDate: {
      year: number;
    };
    format: string;
    title: {
      userPreferred: string;
    };
    coverImage: {
      large: string;
    };
  };
  replies?: Array<{
    id: number;
    text: string;
    createdAt: number;
    user: {
      id: number;
      name: string;
      avatar: {
        large: string;
      };
    };
  }>;
  likes?: Array<{
    id: number;
    name: string;
  }>;
  replyCount: number;
  likeCount: number;
  isLiked?: boolean;
  siteUrl: string;
}
