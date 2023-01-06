import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnilistService } from '@app/anilist.service';

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
  private notifications: Notification[] = [];
  private interval = 0;
  constructor(private anilist: AnilistService, private _router: Router) {}

  ngOnInit() {
    this.update();
    setInterval(() => {
      this.update();
    }, 60000);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  update() {
    this.notifications = [];
    this.anilist.getNotifications(100).then(notifications => {
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
        this.notifications.push(notification);
      });
    });
  }

  async markRead() {
    const result = await this.anilist.markNotificationsAsRead();
    if (result) this.update();
  }

  get notificationsList() {
    return this.notifications
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .filter(n => {
        const isUnread = n.unread;
        const isNew = new Date().getTime() - n.createdAt.getTime() < 1000 * 60 * 60 * 24 * 7;
        return isUnread || isNew;
      });
  }

  get unreadNotificationsCount() {
    return this.notifications.filter(n => n.unread).length;
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
