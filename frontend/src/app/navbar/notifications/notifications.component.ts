import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnilistService } from '@services/anilist.service';
import { KitsuService } from '@services/kitsu.service';

@Component({
  selector: 'myanili-notifications',
  templateUrl: './notifications.component.html',
  styles: [
    `
      .dropdown-toggle::after {
        display: none;
      }

      .dropdown-menu {
        max-height: 60vh;
        overflow-y: auto;
      }
    `,
  ],
  standalone: false,
})
export class NotificationsComponent implements OnInit, OnDestroy {
  refresher = 0;
  private interval = 0;
  private notificationsAl: Notification[] = [];
  private notificationsMal: Notification[] = [];
  private notificationsKitsu: Notification[] = [];
  constructor(
    private anilist: AnilistService,
    private kitsu: KitsuService,
    private _router: Router,
  ) {
    setInterval(() => {
      this.refresher = Math.random();
    }, 10000);
  }

  ngOnInit() {
    this.initAl();
    this.initKitsu();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  initAl() {
    this.anilist.notifications.subscribe(notifications => {
      const notificationsAl = [] as Notification[];
      notifications.forEach(async alNotification => {
        const notification = {
          platform: 'al',
          text: alNotification.text,
          unread: alNotification.unread,
          createdAt: alNotification.createdAt,
          callback() {
            window.open(alNotification.url, '_blank');
          },
        } as Notification;
        if (alNotification.media?.idMal) {
          const type = alNotification.media.type.toLocaleLowerCase();
          const malId = alNotification.media.idMal;
          notification.callback = () => {
            this._router.navigate([type, 'details', malId]);
          };
        }
        notificationsAl.push(notification);
      });
      this.notificationsAl = notificationsAl;
    });
  }

  initKitsu() {
    this.kitsu.notifications.subscribe(notifications => {
      if (!notifications) {
        this.notificationsKitsu = [];
        return;
      }
      const notificationsKitsu = [] as Notification[];
      notifications.forEach(kNotification => {
        const notification = {
          platform: 'kitsu',
          text: kNotification.text,
          unread: kNotification.unread,
          createdAt: new Date(kNotification.createdAt),
          callback() {
            window.open(kNotification.url, '_blank');
          },
        } as Notification;
        notificationsKitsu.push(notification);
      });
      this.notificationsKitsu = notificationsKitsu;
    });
  }

  async markRead() {
    this.anilist.markNotificationsAsRead().then(result => {
      if (result) {
        this.notificationsAl.forEach(n => (n.unread = false));
      }
    });
    this.kitsu.markNotificationsAsRead().then(result => {
      if (result) {
        this.notificationsKitsu.forEach(n => (n.unread = false));
      }
    });
  }

  get notificationsList() {
    const notifications = [
      ...this.notificationsAl,
      ...this.notificationsMal,
      ...this.notificationsKitsu,
    ];
    return notifications
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .filter(n => {
        const isUnread = n.unread;
        const isNew = new Date().getTime() - n.createdAt.getTime() < 1000 * 60 * 60 * 24 * 7;
        return isUnread || isNew;
      });
  }

  get unreadNotificationsCount() {
    return this.notificationsList.filter(n => n.unread).length;
  }

  callback(notification: Notification) {
    if (notification.callback) notification.callback();
  }
}

interface Notification {
  platform: 'mal' | 'al' | 'kitsu';
  text: string;
  unread: boolean;
  createdAt: Date;
  callback?: () => void;
}
