import { Component } from '@angular/core';
import { Anime } from '@models/anime';
import * as moment from 'moment';

import { GlobalService } from '../../global.service';
import { Language, SettingsService } from '../../settings/settings.service';
import { AnimeService } from '../anime.service';

@Component({
  selector: 'myanili-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent {
  animes: Array<Partial<Anime>> = [];
  today = moment().day();
  lang: Language = 'jp';
  year?: number;
  season?: number;
  constructor(
    private readonly animeService: AnimeService,
    private settings: SettingsService,
    private glob: GlobalService,
  ) {
    this.settings.season.subscribe(async season => {
      this.year = season.year;
      this.season = season.season;
      this.glob.busy();
      if (await this.update(season.year, season.season)) {
        const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];
        this.glob.setTitle(`${season.year} ${seasons[season.season]} – Schedule`);
        this.glob.notbusy();
      }
    });
    this.settings.language.subscribe(lang => {
      this.lang = lang;
    });
  }

  async update(year?: number, season?: number): Promise<boolean | undefined> {
    if (!this.year || (this.season !== 0 && !this.season)) return;
    const allAnime = await this.animeService.season(this.year, this.season);
    if (year && season && (year !== this.year || season !== this.season)) return;
    this.animes = allAnime.sort(
      (a, b) =>
        Number(a.my_extension?.simulTime ? a.my_extension.simulTime.replace(/\D/g, '') : 0) -
        Number(b.my_extension?.simulTime ? b.my_extension.simulTime.replace(/\D/g, '') : 0),
    );
    return true;
  }

  getAnimes(day: number): Array<Partial<Anime>> {
    return this.animes.filter(anime => {
      let simulDay = anime.my_extension?.simulDay;
      if (!simulDay && simulDay !== 0) return false;
      if (!Array.isArray(simulDay)) simulDay = [simulDay];
      simulDay = simulDay.map(d => Number(d) % 7) as number[];
      return (
        simulDay.includes(day % 7) &&
        anime.my_extension?.simulDay !== null &&
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
          (!anime.my_extension?.simulDay || // include empty days
            (Array.isArray(anime.my_extension.simulDay) && !anime.my_extension.simulDay.length)) && // include empty arrays of days
          anime.my_extension?.simulDay !== 0 && // exclude sundays
          ['tv', 'ova', 'ona'].includes(anime.media_type || ''),
      )
      .sort((a, b) => moment(a.start_date).unix() - moment(b.start_date).unix());
  }

  getDay(day: number): string {
    return moment()
      .day(this.today + day)
      .format('dddd');
  }

  length(input?: Date | string): number {
    return `${input}`.length;
  }
}
