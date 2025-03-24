import { Component } from '@angular/core';
import { DateTimeFrom } from '@components/luxon-helper';
import { Anime, daysToLocal } from '@models/anime';
import { Weekday } from '@models/components';
import { AnimeService } from '@services/anime/anime.service';
import { GlobalService } from '@services/global.service';
import { SettingsService } from '@services/settings.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'myanili-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
  standalone: false,
})
export class ScheduleComponent {
  animes: Array<Partial<Anime>> = [];
  today: Weekday = 0;
  year?: number;
  season?: number;
  constructor(
    private readonly animeService: AnimeService,
    public settings: SettingsService,
    private glob: GlobalService,
  ) {
    this.today = DateTime.now().weekday as Weekday;
    const { Observable, switchMap } = require('rxjs') as typeof import('rxjs');
    this.settings.season$
      .asObservable()
      .pipe(
        switchMap(season => {
          this.year = season.year;
          this.season = season.season;
          this.glob.busy();
          return new Observable<Array<Partial<Anime>> | undefined>(observer => {
            this.update(season.year, season.season).then(animes => {
              observer.next(animes);
              observer.complete();
            });
          });
        }),
      )
      .subscribe(animes => {
        if (animes) {
          const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];
          this.glob.setTitle(`${this.year} ${seasons[this.season || 0]} – Schedule`);
          this.glob.notbusy();
          this.animes = animes;
        }
      });
  }

  async update(year?: number, season?: number) {
    if (!this.year || (this.season !== 0 && !this.season)) return;
    const allAnime = await this.animeService.season(this.year, this.season).catch(() => []);
    if (year && season && (year !== this.year || season !== this.season)) return;
    return allAnime.sort(
      (a, b) =>
        Number(
          a.my_extension?.simulcast.time ? a.my_extension.simulcast.time.replace(/\D/g, '') : 0,
        ) -
        Number(
          b.my_extension?.simulcast.time ? b.my_extension.simulcast.time.replace(/\D/g, '') : 0,
        ),
    );
  }

  getAnimes(day: number): Array<Partial<Anime>> {
    return this.animes.filter(anime => {
      if (!anime.my_extension) return false;
      let simulDay = daysToLocal(anime.my_extension.simulcast);
      simulDay = simulDay.map(d => Number(d) % 7) as number[];
      return (
        (simulDay.includes(day % 7) || (anime.broadcast?.weekday === day && !simulDay.length)) &&
        anime.my_list_status?.status !== 'dropped'
      );
    });
  }

  getOtherAnimes(): Array<Partial<Anime>> {
    return this.animes
      .filter(
        anime =>
          anime.my_list_status && // is in my list
          anime.my_list_status?.status !== 'dropped' &&
          !anime.broadcast?.day_of_the_week &&
          !anime.my_extension?.simulcast.day?.length && // include empty arrays of days
          ['tv', 'ova', 'ona'].includes(anime.media_type || ''),
      )
      .sort(
        (a, b) => DateTimeFrom(a.start_date).millisecond - DateTimeFrom(b.start_date).millisecond,
      );
  }

  getDay(day: number): string {
    const weekday = this.glob.toWeekday(this.today + day);
    return DateTime.now().set({ weekday }).toFormat('cccc');
  }

  length(input?: Date | string): number {
    return `${input}`.length;
  }
}
