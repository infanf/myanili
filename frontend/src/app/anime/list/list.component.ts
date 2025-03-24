import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListAnime, WatchStatus } from '@models/anime';
import { AnimeService } from '@services/anime/anime.service';
import { GlobalService } from '@services/global.service';
import { SettingsService } from '@services/settings.service';

@Component({
  selector: 'myanili-list',
  templateUrl: './list.component.html',
  standalone: false,
})
export class AnimeListComponent {
  @Input() status?: WatchStatus;
  animes: ListAnime[] = [];
  nextAnimes: ListAnime[] = [];
  loadedAll = false;
  loading = false;
  title = 'Watchlist';

  constructor(
    private animeService: AnimeService,
    private route: ActivatedRoute,
    public settings: SettingsService,
    private glob: GlobalService,
  ) {
    this.route.paramMap.subscribe(params => {
      const newStatus = params.get('status') as WatchStatus;
      if (newStatus !== this.status) {
        this.status = newStatus;
        this.animes = [];
        const status = newStatus.replace(/_/g, ' ');
        this.title = status.charAt(0).toUpperCase() + status.slice(1);
        this.glob.setTitle(`Watchlist – ${this.title}`);
        this.glob.busy();
        this.update();
      }
    });
  }

  async update() {
    this.loadedAll = false;
    this.nextAnimes = await this.animeService.list(this.status, {
      limit: 50,
    });
    this.loadMore();
    this.glob.notbusy();
  }

  async handleScroll(event: { target: Element; visible: boolean }) {
    if (!event.visible) return;
    let maxTries = 50;
    while (this.loading && maxTries-- > 0) {
      await this.glob.sleep(100);
    }
    this.loadMore();
  }

  async loadMore() {
    if (this.nextAnimes.length < 20) this.loadedAll = true;
    this.animes.push(...this.nextAnimes);
    this.nextAnimes = [];
    if (this.loadedAll || this.loading) return;
    this.loading = true;
    this.nextAnimes = await this.animeService.list(this.status, {
      limit: 20,
      offset: this.animes.length,
    });
    this.loading = false;
  }
}
