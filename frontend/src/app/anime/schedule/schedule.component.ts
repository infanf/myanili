import { Component } from '@angular/core';
import { Anime } from '@models/anime';
import * as moment from 'moment';

import { GlobalService } from '../../global.service';
import { SettingsService } from '../../settings/settings.service';
import { AnimeService } from '../anime.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent {
  animes: Array<Partial<Anime>> = [];
  today = moment().day();
  lang: 'jp' | 'en' = 'jp';
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
      await this.update();
      this.glob.notbusy();
    });
  }

  async update() {
    if (!this.year || (this.season !== 0 && !this.season)) return;
    this.animes = (await this.animeService.season(this.year, this.season)).sort(
      (a, b) =>
        Number(a.my_extension?.simulTime ? a.my_extension.simulTime.replace(/\D/g, '') : 0) -
        Number(b.my_extension?.simulTime ? b.my_extension.simulTime.replace(/\D/g, '') : 0),
    );
  }

  getAnimes(day: number): Array<Partial<Anime>> {
    return this.animes.filter(anime => Number(anime.my_extension?.simulDay) % 7 === day % 7);
  }

  getDay(day: number): string {
    return moment()
      .day(this.today + day)
      .format('dddd');
  }
}
