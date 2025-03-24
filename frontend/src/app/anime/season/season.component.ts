import { Component } from '@angular/core';
import { Anime } from '@models/anime';
import { AnimeService } from '@services/anime/anime.service';
import { GlobalService } from '@services/global.service';
import { SettingsService } from '@services/settings.service';

@Component({
  selector: 'myanili-season',
  templateUrl: './season.component.html',
  standalone: false,
})
export class SeasonComponent {
  animes: Array<Partial<Anime>> = [];
  year?: number;
  season?: number;
  onlyInList?: boolean;
  title = 'Season';

  constructor(
    private animeService: AnimeService,
    public settings: SettingsService,
    private glob: GlobalService,
  ) {
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
    this.settings.inList$
      .asObservable()
      .pipe(
        switchMap(inList => {
          return new Observable<Array<Partial<Anime>> | undefined>(observer => {
            if (!this.year || this.season === undefined || this.onlyInList === inList) return;
            this.onlyInList = inList;
            this.glob.busy();
            this.update().then(animes => {
              observer.next(animes);
              observer.complete();
            });
          });
        }),
      )
      .subscribe(animes => {
        if (animes) {
          this.glob.notbusy();
          this.animes = animes;
        }
      });
  }

  async update(year?: number, season?: number) {
    if (!this.year || this.season === undefined) return;
    const animes = (await this.animeService.season(this.year, this.season).catch(() => [])).sort(
      (anime, bnime) => (bnime.num_list_users || 0) - (anime.num_list_users || 0),
    );
    if (year && season && (year !== this.year || season !== this.season)) {
      return;
    }
    if (this.onlyInList) {
      return animes.filter(anime => anime.my_list_status);
    }
    return animes;
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
