import { Component, OnInit } from '@angular/core';
import { Anime } from '@models/anime';
import { SettingsService } from 'src/app/settings/settings.service';

import { AnimeService } from '../anime.service';

@Component({
  selector: 'app-season',
  templateUrl: './season.component.html',
  styleUrls: ['./season.component.scss'],
})
export class SeasonComponent implements OnInit {
  animes: Array<Partial<Anime>> = [];
  year!: number;
  season!: number;
  onlyInList = true;

  constructor(private animeService: AnimeService, private settings: SettingsService) {
    this.settings.season.subscribe(season => {
      this.year = season.year;
      this.season = season.season;
      this.update();
    });
  }

  async ngOnInit() {}

  async update() {
    const animes = await this.animeService.season(this.year, this.season);
    if (this.onlyInList) {
      this.animes = animes.filter(anime => anime.my_list_status);
    } else {
      this.animes = animes;
    }
  }
}
