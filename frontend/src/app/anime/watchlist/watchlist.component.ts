import { Component, OnInit } from '@angular/core';
import { Button } from '@components/dialogue/dialogue.component';
import {
  Anime,
  AnimeEpisodeRule,
  daysToLocal,
  ListAnime,
  MyAnimeUpdate,
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

@Component({
  selector: 'myanili-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
})
export class WatchlistComponent implements OnInit {
  private _animes: ListAnime[] = [];
  autoFilter = false;
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
    this.glob.busy();
    this.settings.autoFilter$.asObservable().subscribe(autoFilter => {
      this.autoFilter = autoFilter;
    });
  }

  async ngOnInit() {
    const animes = await this.getAnimes();
    const { DateTimeFrom } = await import('@components/luxon-helper');
    this._animes = animes
      .filter(anime => {
        const lastWatched = DateTimeFrom(anime.my_extension?.lastWatchedAt || 'yesterday');
        if (['completed', 'dropped'].includes(anime.list_status.status || '')) {
          return lastWatched > this.getLast8am();
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
          const lastWatchedOrUpdated = DateTimeFrom(
            anime.my_extension.lastWatchedAt || new Date(0),
          );
          return (
            lastWatchedOrUpdated < DateTimeFrom().minus({ day: lastAiredDaysAgo + 1 }) ||
            (!inFuture && newShow)
          );
        }
        return false;
      })
      .sort((a, b) => this.toSortIndex(a) - this.toSortIndex(b));
    this._airDates = await this.anilist.getAirDates(this._animes.map(a => a.node.id));
    this.glob.notbusy();
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
      const { DateTimeFrom } =
        require('@components/luxon-helper') as typeof import('@components/luxon-helper');
      const lastWatched = DateTimeFrom(a.my_extension?.lastWatchedAt || 'yesterday');
      return nextAirDate < eightAmTomorrow || lastWatched > this.getLast8am();
    });
    return filtered;
  }

  async getAnimes() {
    return this.animeService.list(['watching', 'completed', 'dropped'], {
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
      const { DateTime } = require('luxon') as typeof import('luxon');
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

  isSeen(anime: ListAnime): boolean {
    if (anime.busy) return false;
    const { DateTimeFrom } =
      require('@components/luxon-helper') as typeof import('@components/luxon-helper');
    if (anime.list_status.num_episodes_watched === 0) return false;
    const updateDate = DateTimeFrom(
      anime.my_extension?.lastWatchedAt || anime.list_status.updated_at,
    );
    return this.getLast8am() < updateDate;
  }

  getLast8am() {
    const { DateTimeFrom } =
      require('@components/luxon-helper') as typeof import('@components/luxon-helper');
    const now = DateTimeFrom();
    const eightAm = DateTimeFrom().set({
      hour: 8,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    return now.diff(eightAm).milliseconds > 0 ? eightAm : eightAm.minus({ days: 1 });
  }

  async markSeen(anime: ListAnime) {
    if (
      (this.isSeen(anime) && this.isInSeason(anime) && anime.my_extension?.simulcast.day) ||
      anime.busy
    ) {
      return;
    }
    anime.busy = true;
    const currentEpisode = anime.list_status.num_episodes_watched;
    const data = {
      num_watched_episodes: currentEpisode + 1,
    } as Partial<MyAnimeUpdate>;
    if (anime.my_extension) anime.my_extension.lastWatchedAt = new Date();
    let completed = false;
    const { DateTime } = await import('luxon');
    if (currentEpisode + 1 === anime.node.num_episodes) {
      data.status = 'completed';
      data.finish_date = DateTime.local().toISODate() || undefined;
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
    const { Base64 } = await import('js-base64');
    data.comments = Base64.encode(JSON.stringify(anime.my_extension));
    const fullAnime = await this.animeService.getAnime(anime.node.id);
    const [animeStatus] = await Promise.all([
      this.animeService.updateAnime(
        {
          malId: anime.node.id,
          anilistId: anime.my_extension?.anilistId,
          kitsuId: anime.my_extension?.kitsuId,
          simklId: anime.my_extension?.simklId,
          annictId: anime.my_extension?.annictId,
          trakt: {
            id: anime.my_extension?.trakt,
            season: anime.node.media_type === 'movie' ? -1 : anime.my_extension?.seasonNumber,
          },
          livechartId: anime.my_extension?.livechartId,
        },
        data,
      ),
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
            await this.animeService.updateAnime(
              { malId: sequel.id },
              { status: 'completed', is_rewatching: true, num_watched_episodes: 0 },
            );
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
            const sequelData = { status } as Partial<MyAnimeUpdate>;
            if (status === 'watching') {
              sequelData.start_date = DateTime.local().toISODate() || undefined;
            }
            await this.animeService.updateAnime({ malId: sequel.id }, sequelData);
          }
        }
        this.ngOnInit();
      }
    }
    anime.list_status.is_rewatching = animeStatus.is_rewatching;
    anime.list_status.num_episodes_watched = animeStatus.num_episodes_watched;
    anime.list_status.updated_at = animeStatus.updated_at;
    anime.busy = false;
    this.glob.notbusy();
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
    const { DateTimeFrom } =
      require('@components/luxon-helper') as typeof import('@components/luxon-helper');
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
}
