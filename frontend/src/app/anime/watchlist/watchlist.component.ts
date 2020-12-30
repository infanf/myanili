import { Component, OnInit } from '@angular/core';
import { ListAnime, MyAnimeUpdate } from '@models/anime';
import * as moment from 'moment';

import { AnimeService } from '../anime.service';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
})
export class WatchlistComponent implements OnInit {
  animes: ListAnime[] = [];
  constructor(private animeService: AnimeService) {}

  async ngOnInit() {
    this.animes = await this.animeService.list('watching');
  }

  isSeen(anime: ListAnime): boolean {
    const now = moment();
    const eightAm = moment().hour(8).minute(0).second(0).millisecond(0);
    const last8am = now > eightAm ? eightAm : eightAm.subtract(1, 'd');
    const updateDate = moment(anime.list_status.updated_at);
    return last8am < updateDate;
  }

  async markSeen(anime: ListAnime) {
    const currentEpisode = anime.list_status.num_episodes_watched;
    const data = {
      num_watched_episodes: currentEpisode + 1,
    } as Partial<MyAnimeUpdate>;
    if (currentEpisode + 1 === anime.node.num_episodes) {
      data.status = 'completed';
    }
    await this.animeService.updateAnime(anime.node.id, data);
    this.ngOnInit();
  }
}
