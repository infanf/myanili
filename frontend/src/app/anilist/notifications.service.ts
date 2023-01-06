import { Injectable } from '@angular/core';
import { AnilistNotification, AnilistNotificationType } from '@models/anilist';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class AnilistNotificationsService {
  constructor(private client: Apollo) {}

  async getNotifications(
    perPage = 10,
    page = 1,
    types?: AnilistNotificationType[],
  ): Promise<AnilistNotification[]> {
    return new Promise<AnilistNotification[]>(r => {
      this.client
        .query<NotificationsResult>({
          errorPolicy: 'ignore',
          query: gql`
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
          `,
          variables: { perPage, page, types },
        })
        .subscribe(
          result => {
            console.log({ result });

            const notifications = result.data.Page.notifications.map(
              AnilistNotificationsService.mapNotification,
            );
            const offset = (page - 1) * perPage;
            for (let i = 0; i < result.data.Viewer.unreadNotificationCount - offset; i++) {
              notifications[i].unread = true;
            }
            r(notifications);
          },
          error => {
            console.log({ error });
            r([]);
          },
        );
    });
  }

  async markAsRead(): Promise<boolean> {
    return new Promise<boolean>(r => {
      this.client
        .query({
          errorPolicy: 'ignore',
          query: gql`
            {
              Page(page: 1, perPage: 1) {
                notifications(resetNotificationCount: true) {
                  id
                }
              }
            }
          `,
        })
        .subscribe(
          result => {
            r(true);
          },
          error => {
            console.log({ error });
            r(false);
          },
        );
    });
  }

  private static mapNotification(notification: Notification): AnilistNotification {
    const alNotification = {
      unread: false,
      text: notification.context,
      url: 'https://anilist.co/notifications',
    } as AnilistNotification;
    if (notification.user) {
      alNotification.text = `${notification.user.name}${notification.context}`;
    } else if (notification.media) {
      alNotification.text = `${notification.media.title.userPreferred}${notification.context}`;
      alNotification.url = `https://anilist.co/${notification.media.type.toLowerCase()}/${
        notification.media.id
      }`;
    }
    return alNotification;
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
  user?: {
    name: string;
  };
  media?: {
    id: number;
    type: 'ANIME' | 'MANGA';
    title: {
      userPreferred: string;
    };
  };
}
