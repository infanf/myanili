import { Component, Input, OnInit } from '@angular/core';

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

  constructor(private animeService: AnimeService) {}

  async ngOnInit() {
    this.animes = await this.animeService.list('watching');
  }
}
