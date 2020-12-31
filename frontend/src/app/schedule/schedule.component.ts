import { Component, OnInit } from '@angular/core';
import { ListAnime } from '@models/anime';
import * as moment from 'moment';

import { AnimeService } from '../anime/anime.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements OnInit {
  animes: ListAnime[] = [];
  today = moment().day();
  lang: 'jp' | 'en' = 'jp';
  constructor(private readonly animeService: AnimeService) {}

  async ngOnInit() {
    this.animes = (await this.animeService.list('watching'))
      .filter(this.isInSeason)
      .sort(
        (a, b) =>
          Number(a.my_extension?.simulTime ? a.my_extension.simulTime.replace(/\D/g, '') : 0) -
          Number(b.my_extension?.simulTime ? b.my_extension.simulTime.replace(/\D/g, '') : 0),
      );
  }

  getAnimes(day: number): ListAnime[] {
    return this.animes.filter(anime => Number(anime.my_extension?.simulDay) % 7 === day % 7);
  }

  getDay(day: number): string {
    return moment()
      .day(this.today + day)
      .format('dddd');
  }

  isInSeason(anime: ListAnime): boolean {
    if (anime.node.start_date) {
      if (moment(anime.node.start_date).subtract(6, 'd') < moment()) {
        if (anime.node.end_date && moment(anime.node.end_date).add(6, 'd') < moment()) {
          return false;
        }
        return true;
      }
    }
    return false;
  }
}
