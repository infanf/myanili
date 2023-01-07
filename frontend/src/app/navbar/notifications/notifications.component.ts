import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnilistService } from '@services/anilist.service';

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
})
export class NotificationsComponent implements OnInit, OnDestroy {
  refresher = 0;
  private interval = 0;
  private notificationsAl: Notification[] = [];
  private notificationsMal: Notification[] = [];
  private notificationsKitsu: Notification[] = [];
  constructor(private anilist: AnilistService, private _router: Router) {
    setInterval(() => {
      this.refresher = Math.random();
    }, 10000);
  }

  ngOnInit() {
    this.initAl();
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
        if (alNotification.media) {
          const type = alNotification.media.type.toLocaleLowerCase();
          const malId = await this.anilist.getMalId(
            alNotification.media.id,
            alNotification.media.type,
          );
          if (malId) {
            notification.callback = () => {
              this._router.navigate([type, 'details', malId]);
            };
          }
        }
        notificationsAl.push(notification);
      });
      this.notificationsAl = notificationsAl;
    });
  }

  async markRead() {
    const result = await this.anilist.markNotificationsAsRead();
    if (result) {
      this.notificationsAl.forEach(n => (n.unread = false));
    }
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
