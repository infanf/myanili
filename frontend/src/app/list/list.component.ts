import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AnimeService } from '../anime.service';
import { ListAnime, WatchStatus } from '../models/anime';

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
  }

  async ngOnInit() {
    this.animes = await this.animeService.list(this.status);
  }
}
