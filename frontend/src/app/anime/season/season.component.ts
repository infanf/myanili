import { Component, OnInit } from '@angular/core';
import { Anime } from '@models/anime';
import { GlobalService } from 'src/app/global.service';
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

  lang = 'en';

  constructor(
    private animeService: AnimeService,
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
    this.settings.language.subscribe(lang => (this.lang = lang));
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
