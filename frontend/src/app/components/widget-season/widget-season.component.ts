import { Component, OnInit } from '@angular/core';
import { Season, SeasonNumber } from '@models/components';
import { GlobalService } from '@services/global.service';
import { SettingsService } from '@services/settings.service';

@Component({
  selector: 'myanili-widget-season',
  templateUrl: './widget-season.component.html',
  styleUrls: ['./widget-season.component.scss'],
  standalone: false,
})
export class WidgetSeasonComponent implements OnInit {
  season: Season;
  currentSeason: Season;
  icons = ['snow', 'flower1', 'sun', 'clouds'];
  lastPosition = 0;
  hide = false;

  constructor(
    private settings: SettingsService,
    private glob: GlobalService,
  ) {
    this.currentSeason = {
      year: new Date().getFullYear(),
      season: Math.floor(new Date().getMonth() / 3) as unknown as 0 | 1 | 2 | 3,
    };
    this.season = this.currentSeason;
    this.glob.hideNavbar.subscribe(hide => {
      this.hide = hide;
    });
  }

  ngOnInit(): void {
    this.settings.season$.asObservable().subscribe(season => {
      this.season = season;
    });
  }

  changeSeason(offset: number) {
    const season = ((this.season.season + offset + 4) % 4) as SeasonNumber;
    const year = this.season.year + Math.floor((this.season.season + offset) / 4);
    this.settings.season = { year, season };
  }

  setCurrentSeason() {
    this.settings.resetSeason();
  }
}
