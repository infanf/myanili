import { Component, OnInit } from '@angular/core';
import { Season, SeasonNumber } from '@models/components';

import { SettingsService } from '../settings.service';

@Component({
  selector: 'myanili-widget-season',
  templateUrl: './widget-season.component.html',
})
export class WidgetSeasonComponent implements OnInit {
  season: Season;
  currentSeason: Season;
  icons = ['snow', 'flower1', 'sun', 'clouds'];

  constructor(private settings: SettingsService) {
    this.currentSeason = {
      year: new Date().getFullYear(),
      season: Math.floor(new Date().getMonth() / 3) as unknown as 0 | 1 | 2 | 3,
    };
    this.season = this.currentSeason;
  }

  ngOnInit(): void {
    this.settings.season.subscribe(season => {
      this.season = season;
    });
  }

  changeSeason(offset: number) {
    const season = ((this.season.season + offset + 4) % 4) as SeasonNumber;
    const year = this.season.year + Math.floor((this.season.season + offset) / 4);
    this.settings.setSeason(year, season);
  }

  setCurrentSeason() {
    this.settings.resetSeason();
  }
}
