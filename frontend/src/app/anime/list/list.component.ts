import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListAnime, WatchStatus } from '@models/anime';
import { GlobalService } from 'src/app/global.service';
import { SettingsService } from 'src/app/settings/settings.service';

import { AnimeService } from '../anime.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  @Input() type: 'anime' | 'manga' = 'anime';
  @Input() status?: WatchStatus;
  animes: ListAnime[] = [];

  lang = 'en';

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
        this.glob.busy();
        this.ngOnInit();
      }
    });
    this.settings.language.subscribe(lang => (this.lang = lang));
  }

  async ngOnInit() {
    this.animes = await this.animeService.list(this.status);
    this.glob.notbusy();
  }
}
