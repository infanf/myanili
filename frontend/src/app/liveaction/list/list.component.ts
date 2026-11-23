import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WatchStatus } from '@models/anime';
import { ListLiveaction } from '@models/liveaction';
import { BangumiService } from '@services/anime/bangumi.service';
import { GlobalService } from '@services/global.service';
import { LiveactionService } from '@services/liveaction/liveaction.service';
import { SettingsService } from '@services/settings.service';

@Component({
  selector: 'myanili-liveaction-list',
  templateUrl: './list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class LiveactionListComponent implements OnInit {
  status?: WatchStatus;
  entries: ListLiveaction[] = [];
  loadedAll = false;
  loading = false;
  initialLoading = true;
  loggedIn?: boolean;
  readonly skeletons = Array.from({ length: 12 }, (_, i) => i);
  readonly pageSize = 30;
  title = 'Live Action';

  constructor(
    private liveactionService: LiveactionService,
    private bangumi: BangumiService,
    private route: ActivatedRoute,
    private glob: GlobalService,
    public settings: SettingsService,
  ) {}

  ngOnInit() {
    this.bangumi.user.subscribe(user => {
      const loggedIn = !!user;
      if (loggedIn === this.loggedIn) return;
      this.loggedIn = loggedIn;
      if (loggedIn && this.status) this.load();
    });
    this.route.paramMap.subscribe(params => {
      const status = (params.get('status') || 'watching') as WatchStatus;
      if (status === this.status) return;
      this.status = status;
      const label = status.replace(/_/g, ' ');
      this.title = label.charAt(0).toUpperCase() + label.slice(1);
      this.glob.setTitle(`Live Action – ${label}`);
      this.load();
    });
  }

  private async load() {
    if (!this.status || !this.loggedIn) {
      this.initialLoading = !!localStorage.getItem('bangumiAccessToken') && !this.loggedIn;
      return;
    }
    const status = this.status;
    this.entries = [];
    this.initialLoading = true;
    this.loadedAll = false;
    const entries = await this.liveactionService.list(status, this.pageSize);
    if (status !== this.status) return;
    this.entries = entries;
    this.loadedAll = entries.length < this.pageSize;
    this.initialLoading = false;
  }

  async handleScroll(event: { visible: boolean }) {
    if (!event.visible || this.loading || this.loadedAll || !this.status) return;
    this.loading = true;
    const status = this.status;
    const entries = await this.liveactionService.list(status, this.pageSize, this.entries.length);
    if (status === this.status) {
      this.entries.push(...entries);
      this.loadedAll = entries.length < this.pageSize;
    }
    this.loading = false;
  }

  getTitle(entry: ListLiveaction, language: string | null): string {
    if (language === 'jp') return entry.subject.name;
    return entry.meta?.title || entry.subject.name_cn || entry.subject.name;
  }

  getPoster(entry: ListLiveaction): string | undefined {
    return entry.meta?.poster || entry.subject.images?.common || entry.subject.images?.medium;
  }

  getMediaType(entry: ListLiveaction): string {
    return entry.meta?.mediaType === 'movie' || entry.subject.platform === '电影' ? 'movie' : 'tv';
  }

  getEpisodes(entry: ListLiveaction): number {
    return this.liveactionService.getEpisodes(entry.subject, entry.meta);
  }

  login() {
    this.bangumi.login();
  }
}
