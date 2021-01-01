import { Component, OnInit } from '@angular/core';
import { ListAnime, MyAnimeUpdate } from '@models/anime';
import * as moment from 'moment';
import { GlobalService } from 'src/app/global.service';

import { AnimeService } from '../anime.service';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
})
export class WatchlistComponent implements OnInit {
  animes: ListAnime[] = [];
  constructor(private animeService: AnimeService, private glob: GlobalService) {
    this.glob.busy();
  }

  async ngOnInit() {
    const animes = await this.animeService.list('watching');
    this.animes = animes
      .filter(anime => {
        if (!anime.my_extension) return true;
        if (
          ((!anime.my_extension?.simulDay && anime.my_extension?.simulDay !== 0) ||
            !anime.my_extension?.simulTime) &&
          !this.isInSeason(anime)
        ) {
          return true;
        }
        return anime.my_extension.simulDay === this.getLast8am().day();
      })
      .sort(
        (a, b) =>
          Number(a.my_extension?.simulTime ? a.my_extension.simulTime.replace(/\D/g, '') : 0) -
          Number(b.my_extension?.simulTime ? b.my_extension.simulTime.replace(/\D/g, '') : 0),
      );
    this.glob.notbusy();
  }

  isSeen(anime: ListAnime): boolean {
    if (anime.list_status.num_episodes_watched === 0) return false;
    const updateDate = moment(anime.list_status.updated_at);
    return this.getLast8am() < updateDate;
  }

  getLast8am() {
    const now = moment();
    const eightAm = moment().hour(8).minute(0).second(0).millisecond(0);
    return now > eightAm ? eightAm : eightAm.subtract(1, 'd');
  }

  async markSeen(anime: ListAnime) {
    if (this.isSeen(anime)) return;
    this.glob.busy();
    const currentEpisode = anime.list_status.num_episodes_watched;
    const data = {
      num_watched_episodes: currentEpisode + 1,
    } as Partial<MyAnimeUpdate>;
    let completed = false;
    if (currentEpisode + 1 === anime.node.num_episodes) {
      data.status = 'completed';
      completed = true;
    }
    await this.animeService.updateAnime(anime.node.id, data);
    if (completed) {
      const fullAnime = await this.animeService.getAnime(anime.node.id);
      const sequels = fullAnime.related_anime.filter(related => related.relation_type === 'sequel');
      if (sequels.length) {
        const sequel = sequels[0];
        const startSequel = confirm(`Start watching sequel "${sequel.node.title}"?`);
        if (startSequel) {
          await this.animeService.updateAnime(sequel.node.id, { status: 'watching' });
        }
      }
    }
    this.ngOnInit();
  }

  isInSeason(anime: ListAnime): boolean {
    if (anime.node.start_date) {
      if (moment(anime.node.start_date).subtract(6, 'd') < moment()) {
        if (anime.node.end_date && moment(anime.node.end_date).add(6, 'd') < moment()) {
          return false;
        }
        return true;
      }
    }
    return false;
  }
}
