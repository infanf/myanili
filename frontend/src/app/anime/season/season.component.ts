import { Component } from '@angular/core';
import { Anime } from '@models/anime';
import { GlobalService } from 'src/app/global.service';
import { SettingsService } from 'src/app/settings/settings.service';

import { AnimeService } from '../anime.service';

@Component({
  selector: 'app-season',
  templateUrl: './season.component.html',
  styleUrls: ['./season.component.scss'],
})
export class SeasonComponent {
  animes: Array<Partial<Anime>> = [];
  year!: number;
  season!: number;
  onlyInList = true;

  lang = 'en';
  layout = 'list';

  constructor(
    private animeService: AnimeService,
    private settings: SettingsService,
    private glob: GlobalService,
  ) {
    this.settings.season.subscribe(async season => {
      this.year = season.year;
      this.season = season.season;
      this.glob.busy();
      if (await this.update(season.year, season.season)) {
        const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];
        this.glob.setTitle(`${season.year} ${seasons[season.season]} – List`);
        this.glob.notbusy();
      }
    });
    this.settings.language.subscribe(lang => (this.lang = lang));
    this.settings.layout.subscribe(layout => (this.layout = layout));
    this.settings.onlyInList.subscribe(async inList => {
      this.onlyInList = inList;
      this.glob.busy();
      await this.update();
      this.glob.notbusy();
    });
  }

  async update(year?: number, season?: number): Promise<boolean | undefined> {
    const animes = await this.animeService.season(this.year, this.season);
    if (year && season && (year !== this.year || season !== this.season)) return;
    if (this.onlyInList) {
      this.animes = animes.filter(anime => anime.my_list_status);
    } else {
      this.animes = animes;
    }
    return true;
  }

  async addToList(anime: Partial<Anime>) {
    if (anime.my_list_status || anime.busy || !anime.id) return;
    anime.busy = true;
    const statusResponse = await this.animeService.updateAnime(
      {
        malId: anime.id,
        anilistId: anime.my_extension?.anilistId,
        kitsuId: anime.my_extension?.kitsuId,
        simklId: anime.my_extension?.simklId,
        annictId: anime.my_extension?.annictId,
      },
      {
        status: 'plan_to_watch',
      },
    );
    anime.my_list_status = statusResponse;
    delete anime.busy;
  }
}
