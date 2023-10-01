import { AnilistNotification, AnilistNotificationType } from '@models/anilist';
import { Client } from '@urql/core';
import { BehaviorSubject, Observable } from 'rxjs';

export class AnilistNotificationsService {
  private notificationsSubject = new BehaviorSubject<AnilistNotification[]>([]);

  constructor(private client: Client) {
    this.loadNotifications(100);
  }

  private async loadNotifications(perPage = 10, page = 1, types?: AnilistNotificationType[]) {
    const { pipe, subscribe } = await import('wonka');
    const QUERY = AnilistNotificationsService.getNotificationQuery();

    pipe(
      this.client.query<NotificationsResult>(QUERY, { perPage, page, types }),
      subscribe(result => {
        if (!result.data?.Page?.notifications) return;
        const notifications = result.data.Page.notifications.map(
          AnilistNotificationsService.mapNotification,
        );
        const offset = (page - 1) * perPage;
        for (let i = 0; i < result.data.Viewer.unreadNotificationCount - offset; i++) {
          notifications[i].unread = true;
        }
        this.notificationsSubject.next(notifications);
      }),
    );
  }

  get notifications(): Observable<AnilistNotification[]> {
    return this.notificationsSubject.asObservable();
  }

  async markAsRead(): Promise<boolean> {
    const { gql } = await import('@urql/core');
    const QUERY = gql`
      {
        Page(page: 1, perPage: 1) {
          notifications(resetNotificationCount: true) {
            ... on AiringNotification {
              id
            }
          }
        }
      }
    `;
    return this.client
      .query(QUERY, {})
      .toPromise()
      .then(result => !!result)
      .catch(error => {
        console.log({ error });
        return false;
      });
  }

  private static mapNotification(notification: Notification): AnilistNotification {
    const alNotification = {
      unread: false,
      text: notification.context,
      url: notification.activityId
        ? `https://anilist.co/activity/${notification.activityId}`
        : 'https://anilist.co/notifications',
      createdAt: new Date(notification.createdAt * 1000),
    } as AnilistNotification;
    if (notification.user) {
      alNotification.text = `<span class="text-secondary">${notification.user.name}</span>${notification.context}`;
    } else if (notification.media) {
      alNotification.text = `<span class="text-primary">${notification.media.title.userPreferred}</span>${notification.context}`;
      alNotification.media = {
        id: notification.media.id,
        idMal: notification.media.idMal,
        type: notification.media.type,
      };
      alNotification.url = `https://anilist.co/${notification.media.type.toLowerCase()}/${
        notification.media.id
      }`;
    }
    return alNotification;
  }

  private static getNotificationQuery() {
    const { gql } = require('@urql/core') as typeof import('@urql/core');
    return gql`
      query ($page: Int, $perPage: Int, $types: [NotificationType]) {
        Viewer {
          unreadNotificationCount
        }
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          notifications(type_in: $types, resetNotificationCount: false) {
            ... on AiringNotification {
              id
              type
              episode
              contexts
              media {
                id
                idMal
                type
                bannerImage
                title {
                  userPreferred
                }
              }
              createdAt
            }
            ... on RelatedMediaAdditionNotification {
              id
              type
              context
              media {
                id
                idMal
                type
                bannerImage
                title {
                  userPreferred
                }
                coverImage {
                  large
                }
              }
              createdAt
            }
            ... on FollowingNotification {
              id
              type
              context
              user {
                id
                name
                avatar {
                  large
                }
              }
              createdAt
            }
            ... on ActivityMessageNotification {
              id
              type
              context
              activityId
              user {
                id
                name
                avatar {
                  large
                }
              }
              createdAt
            }
            ... on ActivityMentionNotification {
              id
              type
              context
              activityId
              user {
                id
                name
                avatar {
                  large
                }
              }
              createdAt
            }
            ... on ActivityReplyNotification {
              id
              type
              context
              activityId
              user {
                id
                name
                avatar {
                  large
                }
              }
              createdAt
            }
            ... on ActivityReplySubscribedNotification {
              id
              type
              context
              activityId
              user {
                id
                name
                avatar {
                  large
                }
              }
              createdAt
            }
            ... on ActivityLikeNotification {
              id
              type
              context
              activityId
              user {
                id
                name
                avatar {
                  large
                }
              }
              createdAt
            }
            ... on ActivityReplyLikeNotification {
              id
              type
              context
              activityId
              user {
                id
                name
                avatar {
                  large
                }
              }
              createdAt
            }
            ... on ThreadCommentMentionNotification {
              id
              type
              context
              commentId
              thread {
                id
                title
              }
              user {
                id
                name
                avatar {
                  large
                }
              }
              createdAt
            }
            ... on ThreadCommentReplyNotification {
              id
              type
              context
              commentId
              thread {
                id
                title
              }
              user {
                id
                name
                avatar {
                  large
                }
              }
              createdAt
            }
            ... on ThreadCommentSubscribedNotification {
              id
              type
              context
              commentId
              thread {
                id
                title
              }
              user {
                id
                name
                avatar {
                  large
                }
              }
              createdAt
            }
            ... on ThreadCommentLikeNotification {
              id
              type
              context
              commentId
              thread {
                id
                title
              }
              user {
                id
                name
                avatar {
                  large
                }
              }
              createdAt
            }
            ... on ThreadLikeNotification {
              id
              type
              context
              thread {
                id
                title
              }
              user {
                id
                name
                avatar {
                  large
                }
              }
              createdAt
            }
            ... on MediaDataChangeNotification {
              id
              type
              context
              media {
                id
                idMal
                type
                bannerImage
                title {
                  userPreferred
                }
                coverImage {
                  large
                }
              }
              reason
              createdAt
            }
            ... on MediaMergeNotification {
              id
              type
              context
              media {
                id
                idMal
                type
                bannerImage
                title {
                  userPreferred
                }
                coverImage {
                  large
                }
              }
              deletedMediaTitles
              reason
              createdAt
            }
            ... on MediaDeletionNotification {
              id
              type
              context
              deletedMediaTitle
              reason
              createdAt
            }
          }
        }
      }
    `;
  }
}

interface NotificationsResult {
  Viewer: {
    unreadNotificationCount: number;
  };
  Page: {
    pageInfo: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
    };
    notifications: Notification[];
  };
}

interface Notification {
  id: number;
  type: AnilistNotificationType;
  context: string;
  createdAt: number;
  activityId?: number;
  user?: {
    name: string;
  };
  media?: {
    id: number;
    idMal?: number;
    type: 'ANIME' | 'MANGA';
    title: {
      userPreferred: string;
    };
  };
}
