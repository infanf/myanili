import { Component } from '@angular/core';
import { Anime } from '@models/anime';
import { GlobalService } from 'src/app/global.service';
import { SettingsService } from 'src/app/settings/settings.service';

import { AnimeService } from '../anime.service';

@Component({
  selector: 'myanili-season',
  templateUrl: './season.component.html',
})
export class SeasonComponent {
  animes: Array<Partial<Anime>> = [];
  year!: number;
  season!: number;
  onlyInList = true;
  title = 'Season';

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
        this.title = `${seasons[this.season]} ${this.year}`;
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
    const animes = (await this.animeService.season(this.year, this.season).catch(() => [])).sort(
      (anime, bnime) => (bnime.num_list_users || 0) - (anime.num_list_users || 0),
    );
    if (year && season && (year !== this.year || season !== this.season)) return;
    if (this.onlyInList) {
      this.animes = animes.filter(anime => anime.my_list_status);
    } else {
      this.animes = animes;
    }
    return true;
  }

  async addToList(anime: Partial<Anime>, $event?: Event) {
    $event?.stopPropagation();
    if (anime.my_list_status || anime.busy || !anime.id) return;
    anime.busy = true;
    const statusResponse = await this.animeService.addAnime(anime);
    if (statusResponse) anime.my_list_status = statusResponse;
    delete anime.busy;
  }
}
