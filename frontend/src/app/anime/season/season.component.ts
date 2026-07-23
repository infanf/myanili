import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SeasonPlannerComponent } from '@app/anime/season/planner/planner.component';
import { ViewSettingsComponent } from '@components/view-settings/view-settings.component';
import { Anime } from '@models/anime';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnimeService } from '@services/anime/anime.service';
import { SeasonPlannerService } from '@services/anime/season-planner.service';
import { GlobalService } from '@services/global.service';
import { SettingsService } from '@services/settings.service';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'myanili-season',
  templateUrl: './season.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
    private plannerService: SeasonPlannerService,
    private modalService: NgbModal,
    public settings: SettingsService,
    private glob: GlobalService,
  ) {
    this.settings.season$
      .asObservable()
      .pipe(
        switchMap(season => {
          this.year = season.year;
          this.season = season.season;
          this.glob.busy();
          return new Observable<Array<Partial<Anime>> | undefined>(observer => {
            this.update(season.year, season.season).then(
              animes => {
                observer.next(animes);
                observer.complete();
              },
              () => {
                observer.next(undefined);
                observer.complete();
              },
            );
          });
        }),
      )
      .subscribe(animes => {
        this.glob.notbusy();
        if (animes) {
          const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];
          this.glob.setTitle(`${this.year} ${seasons[this.season || 0]} – Schedule`);
          this.animes = animes;
        }
      });
    this.settings.inList$
      .asObservable()
      .pipe(
        switchMap(inList => {
          return new Observable<Array<Partial<Anime>> | undefined>(observer => {
            if (!this.year || this.season === undefined || this.onlyInList === inList) {
              return;
            }
            this.onlyInList = inList;
            this.glob.busy();
            this.update().then(
              animes => {
                observer.next(animes);
                observer.complete();
              },
              () => {
                observer.next(undefined);
                observer.complete();
              },
            );
          });
        }),
      )
      .subscribe(animes => {
        this.glob.notbusy();
        if (animes) {
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
    const filtered: Array<Partial<Anime>> = [];
    year = this.year as number;
    season = this.season as number;
    for (const anime of animes) {
      if (anime.id && !anime.my_list_status) {
        const skipped = await this.plannerService.isSkipped(anime.id, year, season);
        if (skipped) continue;
      }
      filtered.push(anime);
    }
    if (this.onlyInList) {
      return filtered.filter(anime => anime.my_list_status);
    }
    return filtered;
  }

  async addToList(anime: Partial<Anime>, $event?: Event) {
    $event?.stopPropagation();
    if (anime.my_list_status || anime.busy || !anime.id) return;
    anime.busy = true;
    const statusResponse = await this.animeService.addAnime(anime);
    if (statusResponse) anime.my_list_status = statusResponse;
    delete anime.busy;
  }

  openSettings() {
    const modalRef = this.modalService.open(ViewSettingsComponent);
    modalRef.componentInstance.keys = ['language', 'inList', 'nsfw', 'layout', 'scoreDisplay'];
    modalRef.componentInstance.title = 'Season Settings';
  }

  async openPlanner() {
    if (this.year === undefined || this.season === undefined) return;
    const modal = this.modalService.open(SeasonPlannerComponent, {
      size: 'md',
      centered: true,
      scrollable: true,
    });
    modal.componentInstance.animes = this.animes;
    modal.componentInstance.year = this.year;
    modal.componentInstance.season = this.season;
    await modal.result.catch(() => {});
    this.glob.busy();
    try {
      const animes = await this.update();
      if (animes) this.animes = animes;
    } finally {
      this.glob.notbusy();
    }
  }
}
