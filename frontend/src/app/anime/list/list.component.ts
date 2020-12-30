import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListAnime, WatchStatus } from '@models/anime';

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

  constructor(private animeService: AnimeService, private route: ActivatedRoute) {
    this.status = this.route?.snapshot?.paramMap?.get('status') as WatchStatus;
    this.route.url.subscribe(url => {
      const newStatus = this.route?.snapshot?.paramMap?.get('status') as WatchStatus;
      if (newStatus !== this.status) {
        this.status = newStatus;
        this.animes = [];
        this.ngOnInit();
      }
    });
  }

  async ngOnInit() {
    this.animes = await this.animeService.list(this.status);
  }
}
