import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListMedia, PersonalStatus } from '@models/media';
import { GlobalService } from 'src/app/global.service';
import { SettingsService } from 'src/app/settings/settings.service';

import { AnimeService } from '../anime.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class AnimeListComponent implements OnInit {
  @Input() status?: PersonalStatus;
  animes: ListMedia[] = [];
  layout = 'list';

  constructor(
    private animeService: AnimeService,
    private route: ActivatedRoute,
    private settings: SettingsService,
    private glob: GlobalService,
  ) {
    this.route.paramMap.subscribe(params => {
      const newStatus = params.get('status') as PersonalStatus;
      if (newStatus !== this.status) {
        this.status = newStatus;
        this.animes = [];
        this.glob.setTitle(`Watchlist – ${newStatus}`);
        this.glob.busy();
        this.ngOnInit();
      }
    });
  }

  async ngOnInit() {
    this.animes = await this.animeService.list(this.status);
    this.settings.layout.subscribe(
      layout => (this.layout = this.animes.length > 50 ? 'list' : layout),
    );
    this.glob.notbusy();
  }
}
