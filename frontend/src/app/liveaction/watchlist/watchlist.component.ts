import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DateTimeFrom } from '@components/luxon-helper';
import { ListLiveaction, Liveaction, liveactionPoster, LiveactionUpdate } from '@models/liveaction';
import { BangumiEpisode, BangumiService } from '@services/anime/bangumi.service';
import { DialogueService } from '@services/dialogue.service';
import { GlobalService } from '@services/global.service';
import { LiveactionService } from '@services/liveaction/liveaction.service';
import { SettingsService } from '@services/settings.service';
import { DateTime } from 'luxon';

interface WatchlistEntry extends ListLiveaction {
  episodes: BangumiEpisode[];
  busy?: boolean;
}

/**
 * Live action counterpart of the anime watchlist. Bangumi has no simulcast
 * times for live action, so the air dates of the episodes are used instead.
 */
@Component({
  selector: 'myanili-liveaction-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['../../anime/watchlist/watchlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class LiveactionWatchlistComponent implements OnInit {
  private _rawEntries: WatchlistEntry[] = [];
  private _entries: WatchlistEntry[] = [];
  autoFilter = false;
  startingSoon = true;
  showDate = false;
  initialLoading = true;
  loggedIn?: boolean;
  readonly skeletons = Array.from({ length: 8 }, (_, i) => i);

  constructor(
    private liveactionService: LiveactionService,
    public bangumi: BangumiService,
    public settings: SettingsService,
    private glob: GlobalService,
    private dialogue: DialogueService,
  ) {
    this.glob.setTitle('Live Action Watchlist – Today');
    this.settings.autoFilter$.asObservable().subscribe(autoFilter => {
      this.autoFilter = autoFilter;
    });
    this.settings.startingSoon$.asObservable().subscribe(startingSoon => {
      const changed = this.startingSoon !== startingSoon;
      this.startingSoon = startingSoon;
      if (changed && this.loggedIn) this.ngOnInit();
    });
  }

  ngOnInit() {
    this.bangumi.user.subscribe(user => {
      const loggedIn = !!user;
      if (loggedIn === this.loggedIn) return;
      this.loggedIn = loggedIn;
      if (loggedIn) {
        this.load();
      } else {
        // keep the skeleton while a stored session is still being verified
        this.initialLoading = !!localStorage.getItem('bangumiAccessToken');
      }
    });
  }

  private async load() {
    const lists = await Promise.all([
      this.liveactionService.list('watching', 100),
      this.startingSoon ? this.liveactionService.list('plan_to_watch', 100) : [],
    ]);
    const entries = await Promise.all(
      lists.flat().map(async entry => ({
        ...entry,
        episodes: this.isMovie(entry) ? [] : await this.bangumi.getEpisodes(entry.subject.id),
      })),
    );
    this._rawEntries = entries.filter(entry => this.filterEntry(entry));
    this.applySort();
    this.initialLoading = false;
  }

  private applySort() {
    this._entries = [...this._rawEntries].sort((a, b) => this.toSortIndex(a) - this.toSortIndex(b));
  }

  get entries() {
    if (!this.autoFilter) return this._entries;
    // hide shows whose next episode has not aired yet, unless watched today
    return this._entries.filter(entry => this.isSeen(entry) || !this.airsInFuture(entry));
  }

  filterEntry(entry: WatchlistEntry): boolean {
    if (entry.list_status?.status !== 'plan_to_watch') return true;
    // planned shows only appear when they started within the last days
    const premiere = entry.episodes[0]?.airdate || entry.subject.date;
    if (!premiere) return false;
    const start = DateTimeFrom(premiere);
    return start <= DateTimeFrom() && start >= DateTimeFrom().minus({ days: 4 });
  }

  /** Days since the next episode aired; future and unknown episodes go last */
  toSortIndex(entry: WatchlistEntry): number {
    const airdate = this.nextAirdate(entry);
    if (!airdate) return 1000;
    const days = Math.floor(this.getLast8am().startOf('day').diff(airdate, 'days').days);
    return days >= 0 ? days : 100 - days;
  }

  getTitle(entry: ListLiveaction): string {
    if (this.settings.language$.value === 'jp') return entry.subject.name;
    return entry.meta?.title || entry.subject.name_cn || entry.subject.name;
  }

  getPoster(entry: ListLiveaction): string {
    return liveactionPoster(entry.subject, entry.meta) || 'assets/blank-poster.svg';
  }

  isMovie(entry: ListLiveaction): boolean {
    return entry.meta?.mediaType === 'movie' || entry.subject.platform === '电影';
  }

  watched(entry: ListLiveaction): number {
    return entry.list_status?.num_watched_episodes || 0;
  }

  totalEpisodes(entry: ListLiveaction): number {
    return this.liveactionService.getEpisodes(entry.subject, entry.meta);
  }

  progress(entry: ListLiveaction): number {
    const total = this.totalEpisodes(entry);
    return total ? (this.watched(entry) / total) * 100 : 0;
  }

  /** "SxE" label of the episode to watch next, empty for movies */
  episodeText(entry: WatchlistEntry): string {
    if (this.isMovie(entry)) return '';
    const season = entry.meta?.season || 1;
    return `${season}x${this.watched(entry) + (this.isSeen(entry) ? 0 : 1)}`;
  }

  /** Air date of the next unwatched episode */
  nextAirdate(entry: WatchlistEntry): DateTime | undefined {
    const index = this.watched(entry) - (this.isSeen(entry) ? 1 : 0);
    const airdate = entry.episodes[index]?.airdate;
    return airdate ? DateTimeFrom(airdate) : undefined;
  }

  airsInFuture(entry: WatchlistEntry): boolean {
    const airdate = this.nextAirdate(entry);
    return !!airdate && airdate > this.getLast8am().endOf('day');
  }

  /** true if this row is the first one not aired yet, i.e. the divider goes above it */
  isFirstUpcoming(index: number): boolean {
    const entries = this.entries;
    if (!entries[index] || !this.airsInFuture(entries[index])) return false;
    return index === 0 || !this.airsInFuture(entries[index - 1]);
  }

  isSeen(entry: WatchlistEntry): boolean {
    if (entry.busy || !this.watched(entry) || !entry.list_status?.updated_at) return false;
    return this.getLast8am() < DateTimeFrom(entry.list_status.updated_at);
  }

  checkIcon(entry: WatchlistEntry): string {
    if (entry.busy) return 'loading-circle';
    if (entry.list_status?.status === 'completed') return 'check-circle';
    if (this.nextAirdate(entry)) return this.isSeen(entry) ? 'check-circle' : 'circle';
    return 'plus-circle';
  }

  get seenCount(): number {
    return this.entries.filter(entry => this.isSeen(entry)).length;
  }

  getLast8am() {
    return require('@services/global.service').getLastXoClock() as DateTime;
  }

  async markSeen(entry: WatchlistEntry) {
    if (entry.busy || entry.list_status?.status === 'completed') return;
    if (this.isSeen(entry) && this.nextAirdate(entry)) return;
    entry.busy = true;
    try {
      await this.doMarkSeen(entry);
    } catch (error: unknown) {
      const message = (error as { message?: string })?.message || 'Unknown error';
      await this.dialogue.confirm(`Failed to update: ${message}`, 'Update Failed');
    } finally {
      entry.busy = false;
      this.glob.notbusy();
    }
  }

  private async doMarkSeen(entry: WatchlistEntry) {
    // The list only carries cached metadata; episode count and mirror IDs need it
    entry.meta ??= await this.liveactionService.getMeta(entry.subject.id);
    const status = entry.list_status;
    const watched = this.isMovie(entry) ? 1 : this.watched(entry) + 1;
    const total = this.totalEpisodes(entry);
    const data: LiveactionUpdate = {
      status: !status || status.status === 'plan_to_watch' ? 'watching' : status.status,
      num_watched_episodes: watched,
    };
    if (total && watched >= total) {
      data.status = 'completed';
      if (!status?.score) {
        const score = await this.dialogue.rating(this.getTitle(entry));
        if (score > 0 && score <= 10) data.score = score;
      }
    }
    const liveaction: Liveaction = { ...entry.subject, meta: entry.meta, my_list_status: status };
    await this.liveactionService.update(liveaction, data);
    entry.list_status = {
      ...status,
      status: data.status,
      score: data.score || status?.score || 0,
      num_watched_episodes: watched,
      updated_at: new Date().toISOString(),
    };
  }
}
