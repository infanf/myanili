import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListAnime, WatchStatus } from '@models/anime';
import { GlobalService } from 'src/app/global.service';
import { SettingsService } from 'src/app/settings/settings.service';

import { AnimeService } from '../anime.service';

@Component({
  selector: 'myanili-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class AnimeListComponent implements OnInit {
  @Input() status?: WatchStatus;
  animes: ListAnime[] = [];
  nextAnimes: ListAnime[] = [];
  layout = 'list';
  loadedAll = false;
  loading = false;

  constructor(
    private animeService: AnimeService,
    private route: ActivatedRoute,
    private settings: SettingsService,
    private glob: GlobalService,
  ) {
    this.route.paramMap.subscribe(params => {
      const newStatus = params.get('status') as WatchStatus;
      if (newStatus !== this.status) {
        this.status = newStatus;
        this.animes = [];
        this.glob.setTitle(`Watchlist – ${newStatus.replace(/_/g, ' ')}`);
        this.glob.busy();
        this.ngOnInit();
      }
    });
  }

  async ngOnInit() {
    this.loadedAll = false;
    this.nextAnimes = await this.animeService.list(this.status, {
      limit: 50,
    });
    this.loadMore();
    this.settings.layout.subscribe(layout => (this.layout = layout));
    this.glob.notbusy();
  }

  handleScroll(event: { target: Element; visible: boolean }) {
    if (event.visible) this.loadMore();
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
