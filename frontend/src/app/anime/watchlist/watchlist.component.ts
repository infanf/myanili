import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Button } from '@components/dialogue/dialogue.component';
import { DateTimeFrom } from '@components/luxon-helper';
import {
  Anime,
  AnimeEpisodeRule,
  daysToLocal,
  ListAnime,
  MyAnimeUpdateExtended,
  WatchStatus,
} from '@models/anime';
import { AnilistService } from '@services/anilist.service';
import { AirDate } from '@services/anilist/media.service';
import { AnimeService } from '@services/anime/anime.service';
import { SimklService } from '@services/anime/simkl.service';
import { TraktService } from '@services/anime/trakt.service';
import { DialogueService } from '@services/dialogue.service';
import { GlobalService } from '@services/global.service';
import { SettingsService } from '@services/settings.service';
import { Base64 } from 'js-base64';
import { DateTime } from 'luxon';

@Component({
  selector: 'myanili-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class WatchlistComponent implements OnInit {
  private _rawAnimes: ListAnime[] = [];
  private _animes: ListAnime[] = [];
  autoFilter = false;
  startingSoon = true;
  showDate = false;
  initialLoading = true;
  readonly skeletons = Array.from({ length: 8 }, (_, i) => i);
  private _airDates: AirDate[] = [];

  constructor(
    private animeService: AnimeService,
    private anilist: AnilistService,
    public settings: SettingsService,
    private glob: GlobalService,
    private trakt: TraktService,
    private simkl: SimklService,
    private dialogue: DialogueService,
  ) {
    this.glob.setTitle('Watchlist – Today');
    this.settings.autoFilter$.asObservable().subscribe(autoFilter => {
      this.autoFilter = autoFilter;
    });
    this.settings.startingSoon$.asObservable().subscribe(startingSoon => {
      const changed = this.startingSoon !== startingSoon;
      this.startingSoon = startingSoon;
      if (changed && this._rawAnimes.length) this.applyFilter();
    });
  }

  async ngOnInit() {
    this._rawAnimes = await this.getAnimes();
    this.applyFilter();
    this.initialLoading = false;
    this._airDates = await this.anilist.getAirDates(this._animes.map(a => a.node.id));
  }

  private applyFilter() {
    this._animes = this._rawAnimes
      .filter(anime => this.filterAnime(anime))
      .sort((a, b) => this.toSortIndex(a) - this.toSortIndex(b));
  }

  get animes() {
    if (!this.autoFilter) return this._animes;
    const filtered = this._animes.filter(a => {
      if (a.node.status === 'finished_airing') return true;
      const nextEpisode = a.list_status.num_episodes_watched + 1;
      const airDates = this._airDates.find(d => d.idMal === a.node.id);
      if (!airDates) return true;
      const nextAirDate = airDates.airDates?.find(e => e.episode === nextEpisode)?.date;
      if (!nextAirDate) return true;
      const eightAmTomorrow = this.getLast8am().plus({ day: 1 }).toJSDate();
      const lastWatched = DateTimeFrom(a.my_extension?.lastWatchedAt || 'yesterday');
      return nextAirDate < eightAmTomorrow || lastWatched > this.getLast8am();
    });
    return filtered;
  }

  async getAnimes() {
    return this.animeService.list(['watching', 'completed', 'dropped', 'plan_to_watch'], {
      limit: 100,
      sort: 'list_updated_at',
    });
  }

  toSortIndex(anime: ListAnime): number {
    if (!anime.my_extension) return 0;
    if (!anime.my_extension?.simulcast.day?.length) return 0;
    const days = daysToLocal(anime.my_extension.simulcast);
    if (this.animeService.getLastDay(days) === this.getLast8am().weekday % 7) {
      const zone = anime.my_extension.simulcast.tz || 'UTC';
      const time = anime.my_extension.simulcast.time || '00:00';
      const [hour, minute] = time.split(':').map(Number);
      const localTime = DateTime.fromObject({ hour, minute }, { zone }).setZone('local');
      return localTime.hour * 100 + localTime.minute;
    }
    return (
      (this.animeService.getLastDay(days) +
        14 -
        this.getLast8am().weekday +
        Number(anime.my_extension.simulcast.time?.replace(/\D/g, '') || 0) / 10000) %
      7
    );
  }

  getTitle(anime: ListAnime): string {
    const lang = this.settings.language$.value;
    return (
      anime.my_extension?.displayName ||
      (lang === 'en'
        ? anime.node.alternative_titles?.en
        : lang === 'jp'
          ? anime.node.alternative_titles?.ja
          : anime.node.title) ||
      anime.node.title
    );
  }

  getPoster(anime: ListAnime): string {
    return (
      anime.node.main_picture?.medium || anime.node.main_picture?.large || 'assets/blank-poster.svg'
    );
  }

  /** "SxE" label of the episode to watch next, empty for movies */
  episodeText(anime: ListAnime): string {
    if (anime.node.media_type === 'movie') return '';
    const season =
      anime.my_extension?.seasonNumber === 0 ? 0 : anime.my_extension?.seasonNumber || 1;
    const episode =
      anime.list_status.num_episodes_watched +
      (anime.my_extension?.episodeCorOffset || 0) +
      (this.isSeen(anime) ? 0 : 1);
    return `${season}x${episode}`;
  }

  checkIcon(anime: ListAnime): string {
    if (anime.busy) return 'loading-circle';
    if (anime.my_extension?.simulcast?.day && this.isInSeason(anime)) {
      if (anime.list_status.status === 'dropped') return 'trash';
      return this.isSeen(anime) ? 'check-circle' : 'circle';
    }
    return anime.list_status.status === 'completed' && !anime.list_status.is_rewatching
      ? 'check-circle'
      : 'plus-circle';
  }

  /** true if the anime airs today but its episode has not been released yet */
  airsLaterToday(anime: ListAnime): boolean {
    const simulcast = anime.my_extension?.simulcast;
    if (!simulcast?.day?.length || !this.isInSeason(anime)) return false;
    const days = daysToLocal(simulcast);
    if (this.animeService.getLastDay(days) !== this.getLast8am().weekday % 7) return false;
    const zone = simulcast.tz || 'UTC';
    const time = simulcast.time || '00:00';
    const [hour, minute] = time.split(':').map(Number);
    // anchor the air time to the current watchlist day; fromObject alone would
    // use today's date in the source zone, which may already be tomorrow
    const localAirTime = DateTime.fromObject({ hour, minute }, { zone }).setZone('local');
    const airTime = this.getLast8am().set({
      hour: localAirTime.hour,
      minute: localAirTime.minute,
      second: 0,
      millisecond: 0,
    });
    return airTime > DateTime.local();
  }

  /** true if this row is the first upcoming release, i.e. the divider goes above it */
  isFirstUpcoming(index: number): boolean {
    const animes = this.animes;
    if (!animes[index] || !this.airsLaterToday(animes[index])) return false;
    return index === 0 || !this.airsLaterToday(animes[index - 1]);
  }

  isSeen(anime: ListAnime): boolean {
    if (anime.busy) return false;
    if (anime.list_status.num_episodes_watched === 0) return false;
    const updateDate = DateTimeFrom(
      anime.my_extension?.lastWatchedAt || anime.list_status.updated_at,
    );
    return this.getLast8am() < updateDate;
  }

  getLast8am() {
    return require('@services/global.service').getLastXoClock() as DateTime;
  }

  async markSeen(anime: ListAnime) {
    if (
      (this.isSeen(anime) && this.isInSeason(anime) && anime.my_extension?.simulcast.day) ||
      anime.busy
    ) {
      return;
    }
    anime.busy = true;
    try {
      await this.doMarkSeen(anime);
    } finally {
      anime.busy = false;
      this.glob.notbusy();
    }
  }

  private async doMarkSeen(anime: ListAnime) {
    const currentEpisode = anime.list_status.num_episodes_watched;
    const startingNow = anime.list_status.status === 'plan_to_watch';
    const data = {
      num_watched_episodes: currentEpisode + 1,
      status: startingNow ? 'watching' : anime.list_status.status,
      is_rewatching: anime.list_status.is_rewatching,
    } as MyAnimeUpdateExtended;
    if (startingNow) {
      data.start_date = DateTime.local().toISODate() || undefined;
    }
    if (anime.my_extension) anime.my_extension.lastWatchedAt = new Date();
    let completed = false;
    if (currentEpisode + 1 === anime.node.num_episodes) {
      data.status = 'completed';
      data.finish_date = anime.list_status.finish_date || DateTime.local().toISODate() || undefined;
      data.is_rewatching = false;
      if (anime.list_status.is_rewatching) {
        data.num_times_rewatched = anime.list_status.num_times_rewatched + 1 || 1;
      }
      completed = true;
      if (!anime.list_status?.score) {
        const myScore = await this.dialogue.rating(anime.node.title);
        if (myScore > 0 && myScore <= 10) data.score = myScore;
      }
    } else if (!data.is_rewatching && currentEpisode + 1 === anime.my_extension?.episodeRule) {
      const continueWatching = await this.dialogue.open(
        `You set yourself a ${anime.my_extension?.episodeRule} episode rule for "${anime.node.title}". Do you want to continue watching?`,
        'Continue Watching?',
        [
          { label: 'Ask again next ep.', value: AnimeEpisodeRule.ASK_AGAIN },
          { label: 'Drop', value: AnimeEpisodeRule.DROP },
          { label: 'Continue', value: AnimeEpisodeRule.CONTINUE },
        ],
        AnimeEpisodeRule.CONTINUE,
      );
      if (continueWatching === AnimeEpisodeRule.DROP) {
        data.status = 'dropped';
      }
      if (continueWatching === AnimeEpisodeRule.ASK_AGAIN) {
        anime.my_extension.episodeRule++;
      }
    }
    data.extension = Base64.encode(JSON.stringify(anime.my_extension));
    const fullAnime = await this.animeService.getAnime(anime.node.id);
    const [animeStatus] = await Promise.all([
      this.animeService.updateAnime(anime, data),
      this.scrobbleTrakt(fullAnime, currentEpisode + 1),
      this.simkl.scrobble(
        { simkl: anime.my_extension?.simklId, mal: anime.node.id },
        currentEpisode + 1,
      ),
    ]);
    if (completed) {
      animeStatus.is_rewatching = false;
      this.glob.busy();
      const sequels = fullAnime.related_anime.filter(related => related.relation_type === 'sequel');
      if (sequels.length) {
        const sequel = await this.animeService.getAnime(sequels[0].node.id);
        if (sequel.my_list_status?.status === 'completed') {
          const startSequel = await this.dialogue.confirm(
            `Rewatch sequel "${sequel.title}"?`,
            'Rewatch sequel',
          );
          if (startSequel) {
            await this.animeService.updateAnime(sequel, {
              status: 'completed',
              is_rewatching: true,
              num_watched_episodes: 0,
            });
          }
        } else {
          const futureShow =
            sequel.status !== 'finished_airing' && sequel.status !== 'currently_airing';
          const buttons = [
            { label: "Don't watch", value: false },
            { label: 'Add to my List', value: 'plan_to_watch' },
            { label: 'Start Watching now', value: 'watching' },
          ] as Array<Button<WatchStatus | false>>;
          if (futureShow) buttons.pop();
          const status = await this.dialogue.open<WatchStatus | false>(
            `Watch sequel "${sequel.title}"?`,
            'Watch sequel',
            buttons,
            false,
          );
          if (status) {
            const sequelData = {
              status,
              is_rewatching: false,
            } as MyAnimeUpdateExtended;
            if (status === 'watching') {
              sequelData.start_date = DateTime.local().toISODate() || undefined;
            }
            await this.animeService.updateAnime(sequel, sequelData);
          }
        }
        this.ngOnInit();
      }
    }
    anime.list_status.is_rewatching = animeStatus.is_rewatching;
    anime.list_status.num_episodes_watched = animeStatus.num_episodes_watched;
    anime.list_status.updated_at = animeStatus.updated_at;
    anime.list_status.status = animeStatus.status || anime.list_status.status;
  }

  async scrobbleTrakt(anime: Anime, episode: number): Promise<boolean> {
    return new Promise(r => {
      this.trakt.user.subscribe(async traktUser => {
        if (!traktUser || !anime.my_extension?.trakt) return r(false);
        r(
          anime.media_type === 'movie'
            ? await this.trakt.scrobbleMovie(anime.my_extension.trakt)
            : await this.trakt.scrobble(
                anime.my_extension.trakt,
                anime.my_extension.seasonNumber || 1,
                episode + (anime.my_extension.episodeCorOffset || 0),
              ),
        );
      });
    });
  }

  isInSeason(anime: ListAnime): boolean {
    if (anime.node.start_date) {
      if (DateTimeFrom(anime.node.start_date).minus({ days: 6 }) < DateTimeFrom()) {
        if (
          anime.node.end_date &&
          DateTimeFrom(anime.node.end_date).plus({ days: 6 }) < DateTimeFrom()
        ) {
          return false;
        }
        return true;
      }
    }
    return false;
  }

  toArray<T>(value?: T | T[]): T[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  getLastDay(day?: number | number[]): number | undefined {
    if (!day && day !== 0) return undefined;
    return this.animeService.getLastDay(day);
  }

  get seenCount(): number {
    return this.animes.filter(a => {
      return this.isSeen(a);
    }).length;
  }

  filterAnime(anime: ListAnime): boolean {
    const lastWatched = DateTimeFrom(anime.my_extension?.lastWatchedAt || 'yesterday');
    if (['completed', 'dropped'].includes(anime.list_status.status || '')) {
      if (!anime.list_status.is_rewatching) {
        return lastWatched > this.getLast8am();
      }
    }
    if (anime.my_extension?.hideWatchlist) return false;
    if (anime.list_status.status === 'plan_to_watch') {
      if (!this.startingSoon) return false;
      if (!anime.node.start_date) return false;
      const startDate = DateTimeFrom(anime.node.start_date).plus({
        days: anime.node.broadcast?.dateShift || 0,
      });
      return startDate <= DateTimeFrom() && startDate >= DateTimeFrom().minus({ days: 4 });
    }
    if (!anime.my_extension) return true;
    if (!anime.my_extension.simulcast.day?.length) return true;
    const simulDay = daysToLocal(anime.my_extension.simulcast);
    const lastAiredWeekday = this.animeService.getLastDay(simulDay);
    const last8amWeekday = this.getLast8am().weekday % 7;
    if (lastAiredWeekday === last8amWeekday) {
      return true;
    }
    if (lastWatched > this.getLast8am()) return true;
    const lastAiredDaysAgo = (last8amWeekday - lastAiredWeekday + 14) % 7;
    if (lastAiredDaysAgo === 0) return true;
    if (lastAiredDaysAgo <= 4) {
      const inFuture = DateTimeFrom(anime.node.start_date) > DateTimeFrom();
      const newShow = anime.list_status.num_episodes_watched === 0;
      const lastWatchedOrUpdated = DateTimeFrom(anime.my_extension.lastWatchedAt || new Date(0));
      return (
        lastWatchedOrUpdated < DateTimeFrom().minus({ day: lastAiredDaysAgo + 1 }) ||
        (!inFuture && newShow)
      );
    }
    return false;
  }
}
