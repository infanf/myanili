import { Injectable } from '@angular/core';
import { KitsuNotification } from '@models/kitsu';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KitsuNotificationsService {
  private readonly baseUrl = 'https://kitsu.io/api/edge/';
  private notificationsSubject = new BehaviorSubject<KitsuNotification[]>([]);

  private accessToken = '';
  private userId?: string;
  constructor() {
    setInterval(() => {
      this.updateNotifications();
    }, 30 * 1000);
  }

  private updateNotifications() {
    this.getNotifications().then(notifications => {
      this.notificationsSubject.next(notifications);
    });
  }

  set updateAccess(token: string) {
    this.accessToken = token;
    this.updateNotifications();
  }

  set updateUserId(id: string) {
    this.userId = id;
    this.updateNotifications();
  }

  get notifications() {
    return this.notificationsSubject.asObservable();
  }

  private async getNotifications(limit = 15): Promise<KitsuNotification[]> {
    if (!this.userId || !this.accessToken) {
      return [];
    }
    const url = new URL(`${this.baseUrl}feeds/notifications/${this.userId}`);
    url.searchParams.append(
      'include',
      'actor,subject,target.user,target.post,target.anime,target.manga',
    );
    url.searchParams.append('page[limit]', limit.toString());
    const result = await fetch(url, {
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
      }),
    });
    if (result.ok) {
      const json = (await result.json()) as Notifications;
      return KitsuNotificationsService.mapNotification(json);
    }
    return [];
  }

  private static mapNotification(notifications: Notifications): KitsuNotification[] {
    if (!notifications?.data) return [];
    return notifications.data
      .map(n => {
        if (n.relationships.activities.data.length === 0) return false;
        const notification = {
          id: n.id,
          unread: !n.attributes.isRead,
          createdAt: new Date(n.attributes.createdAt),
          text: '',
          url: '',
        } as KitsuNotification;
        const activity = notifications.included?.find(included => {
          return included.id === n.relationships.activities.data[0].id;
        });
        if (!activity) return false;
        const actorId = activity.relationships.actor.data.id;
        const actor = notifications.included?.find(included => included.id === actorId);
        if (!actor) return false;
        if (activity.attributes.verb === 'follow') {
          notification.text = `<span class="text-secondary">${actor.attributes.name}</span> followed you`;
          notification.url = `https://kitsu.io${actor.links.self}`;
        }
        if (activity.attributes.verb === 'post') {
          const postId = activity.relationships.subject.data.id;
          const post = notifications.included?.find(included => included.id === postId);
          if (!post) return false;
          notification.text = `<span class="text-secondary">${actor.attributes.name}</span> mentioned you in a post`;
          notification.url = `https://kitsu.io${post.links.self}`;
        }
        return notification;
      })
      .filter(n => n) as KitsuNotification[];
  }

  async markAsRead(): Promise<boolean> {
    if (!this.userId || !this.accessToken) {
      return false;
    }
    const body = JSON.stringify(
      this.notificationsSubject.value?.map(notification => notification.id) || [],
    );
    const url = new URL(`${this.baseUrl}feeds/notifications/${this.userId}/_read`);
    const result = await fetch(url, {
      method: 'POST',
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
      }),
      body,
    });
    return result.ok;
  }
}

interface Notifications {
  data?: Notification[];
  included?: Included[];
}

interface Notification {
  id: string;
  type: string;
  attributes: {
    createdAt: string;
    isRead: boolean;
  };
  relationships: {
    activities: {
      data: Array<{
        id: string;
        type: string;
      }>;
    };
  };
}

interface Included {
  id: string;
  type: string;
  attributes: {
    name: string;
    verb: string;
  };
  relationships: {
    actor: {
      data: {
        id: string;
      };
    };
    subject: {
      data: {
        id: string;
      };
    };
  };
  links: {
    self: string;
  };
}
