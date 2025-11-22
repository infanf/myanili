import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnilistActivity } from '@models/anilist';
import { AnilistService } from '@services/anilist.service';
import { GlobalService } from '@services/global.service';
import { marked } from 'marked';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  standalone: false,
})
export class FeedComponent implements OnInit, OnDestroy {
  activities: AnilistActivity[] = [];
  loading = false;
  feedType: 'user' | 'following' = 'following';
  userId?: number;
  activityId?: number;
  currentUserId?: number;
  currentPage = 1;
  replyText: { [activityId: number]: string } = {};
  showReplies: { [activityId: number]: boolean } = {};
  showLikers: { [key: string]: boolean } = {}; // Key format: "activity-{id}" or "reply-{id}"

  private subscriptions: Subscription[] = [];

  constructor(
    private anilistService: AnilistService,
    private route: ActivatedRoute,
    private router: Router,
    private glob: GlobalService,
  ) {
    this.glob.notbusy();
  }

  ngOnInit() {
    this.subscriptions.push(
      this.anilistService.user.subscribe(user => {
        if (user) {
          this.currentUserId = user.id;
          // Only load feed after we have the user ID
          if (!this.userId && !this.activityId) {
            this.loadFeed();
          }
        }
      }),
      this.route.params.subscribe(params => {
        if (params['userId']) {
          this.userId = Number(params['userId']);
          this.feedType = 'user';
          this.loadFeed();
        } else if (params['activityId']) {
          this.activityId = Number(params['activityId']);
          this.loadFeed();
        }
      }),
      this.route.queryParams.subscribe(params => {
        if (params['following'] === 'true') {
          this.feedType = 'following';
          this.loadFeed();
        }
      }),
      this.anilistService.feed.subscribe(activities => {
        this.activities = activities;
      }),
      this.anilistService.feedLoading.subscribe(loading => {
        this.loading = loading;
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadFeed(page = 1, forceRefresh = false) {
    this.currentPage = page;
    if (this.activityId) {
      this.anilistService.loadActivity(this.activityId, forceRefresh);
    } else if (this.feedType === 'following') {
      this.anilistService.loadFollowingFeed(25, page, forceRefresh);
    } else {
      // Use the specific userId if provided, otherwise use current user's ID
      const targetUserId = this.userId || this.currentUserId;
      this.anilistService.loadUserFeed(targetUserId, 25, page, forceRefresh);
    }
  }

  reloadFeed() {
    this.loadFeed(this.currentPage, true); // Force refresh to bypass cache
  }

  async toggleLike(activityId: number) {
    await this.anilistService.toggleActivityLike(activityId);
  }

  async toggleReplyLike(activityId: number, replyId: number) {
    await this.anilistService.toggleReplyLike(replyId);
  }

  toggleLikers(type: 'activity' | 'reply', id: number) {
    const key = `${type}-${id}`;
    this.showLikers[key] = !this.showLikers[key];
  }

  isLikersExpanded(type: 'activity' | 'reply', id: number): boolean {
    const key = `${type}-${id}`;
    return this.showLikers[key] || false;
  }

  async postReply(activityId: number) {
    const text = this.replyText[activityId];
    if (!text || text.trim().length === 0) {
      return;
    }

    const success = await this.anilistService.postActivityReply(activityId, text);
    if (success) {
      this.replyText[activityId] = '';
    }
  }

  toggleReplies(activityId: number) {
    this.showReplies[activityId] = !this.showReplies[activityId];
  }

  navigateToMedia(media: AnilistActivity['media']) {
    if (!media) return;

    const type = media.type.toLowerCase();
    const malId = media.idMal;

    if (malId) {
      this.router.navigate([type, 'details', malId]);
    }
  }

  getActivityText(activity: AnilistActivity): string {
    let text = '';
    if (activity.text) {
      text = activity.text;
    } else if (activity.status && activity.media) {
      text = `${activity.status} ${activity.progress || ''} of ${activity.media.title.userPreferred}`;
    }

    return this.parseMarkdown(text);
  }

  parseMarkdown(text: string): string {
    // Parse markdown to HTML
    if (text) {
      try {
        const html = marked.parse(text, { async: false, breaks: true }) as string;
        return html;
      } catch (error) {
        console.error('Error parsing markdown:', error);
        return text;
      }
    }
    return '';
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString();
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  nextPage() {
    this.loadFeed(this.currentPage + 1);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.loadFeed(this.currentPage - 1);
    }
  }
}
