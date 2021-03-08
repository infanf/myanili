import { Component, OnInit } from '@angular/core';
import { Anime, ListAnime, MyAnimeUpdate } from '@models/anime';
import * as moment from 'moment';
import { GlobalService } from 'src/app/global.service';
import { Language, SettingsService } from 'src/app/settings/settings.service';

import { AnimeService } from '../anime.service';
import { SimklService } from '../simkl.service';
import { TraktService } from '../trakt.service';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
})
export class WatchlistComponent implements OnInit {
  animes: ListAnime[] = [];
  lang: Language = 'default';

  constructor(
    private animeService: AnimeService,
    private settings: SettingsService,
    private glob: GlobalService,
    private trakt: TraktService,
    private simkl: SimklService,
  ) {
    this.glob.busy();
    this.settings.language.subscribe(lang => {
      this.lang = lang;
    });
  }

  async ngOnInit() {
    const animes = await this.animeService.list('watching');
    this.animes = animes
      .filter(anime => {
        if (!anime.my_extension) return true;
        if (!anime.my_extension?.simulDay && anime.my_extension?.simulDay !== 0) {
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
    if (this.isSeen(anime) || anime.busy) return;
    anime.busy = true;
    const currentEpisode = anime.list_status.num_episodes_watched;
    const data = {
      num_watched_episodes: currentEpisode + 1,
    } as Partial<MyAnimeUpdate>;
    let completed = false;
    if (currentEpisode + 1 === anime.node.num_episodes) {
      data.status = 'completed';
      completed = true;
      if (!anime.list_status?.score) {
        const myScore = Math.round(Number(prompt('Your score (1-10)?')));
        if (myScore > 0 && myScore <= 10) data.score = myScore;
      }
    }
    const fullAnime = await this.animeService.getAnime(anime.node.id);
    const [animeStatus] = await Promise.all([
      this.animeService.updateAnime(
        {
          malId: anime.node.id,
          anilistId: anime.my_extension?.anilistId,
          kitsuId: anime.my_extension?.kitsuId,
        },
        data,
      ),
      this.scrobbleTrakt(fullAnime, currentEpisode + 1),
      this.simkl.scrobble(
        { simkl: anime.my_extension?.simklId, mal: anime.node.id },
        currentEpisode + 1,
      ),
    ]);
    if (completed) {
      this.glob.busy();
      const sequels = fullAnime.related_anime.filter(related => related.relation_type === 'sequel');
      if (sequels.length) {
        const sequel = sequels[0];
        const startSequel = confirm(`Start watching sequel "${sequel.node.title}"?`);
        if (startSequel) {
          await this.animeService.updateAnime({ malId: sequel.node.id }, { status: 'watching' });
          this.ngOnInit();
        }
      }
    }
    anime.list_status.num_episodes_watched = animeStatus.num_episodes_watched;
    anime.list_status.updated_at = animeStatus.updated_at;
    anime.busy = false;
    this.glob.notbusy();
  }

  async scrobbleTrakt(anime: Anime, episode: number): Promise<boolean> {
    return new Promise(r => {
      this.trakt.user.subscribe(async traktUser => {
        if (!traktUser || !anime.my_extension?.trakt) return r(false);
        r(
          await this.trakt.scrobble(
            anime.my_extension.trakt,
            anime.my_extension.seasonNumber || 1,
            episode + (anime.my_extension.episodeCorOffset || 0),
          ),
        );
      });
    });
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
