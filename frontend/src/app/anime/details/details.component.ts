import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnisearchComponent } from '@external/anisearch/anisearch.component';
import { AnnictComponent } from '@external/annict/annict.component';
import { TraktComponent } from '@external/trakt/trakt.component';
import { Anime, AnimeExtension, MyAnimeUpdate, WatchStatus } from '@models/anime';
import { ExtRating } from '@models/components';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Base64 } from 'js-base64';
import * as moment from 'moment';
import { AnilistService } from 'src/app/anilist.service';
import { AnisearchService } from 'src/app/anisearch.service';
import { GlobalService } from 'src/app/global.service';
import { KitsuService } from 'src/app/kitsu.service';
import { StreamPipe } from 'src/app/stream.pipe';

import { AnimeService } from '../anime.service';
import { AnnictService } from '../annict.service';
import { SimklService } from '../simkl.service';
import { TraktService } from '../trakt.service';

@Component({
  selector: 'app-anime-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class AnimeDetailsComponent implements OnInit {
  @Input() id = 0;
  anime?: Anime;
  edit = false;
  busy = false;
  editBackup?: Partial<MyAnimeUpdate>;
  editExtension?: AnimeExtension;
  traktUser?: string;
  annictUser?: string;
  activeTab = 1;
  ratings: Array<{ provider: string; rating: ExtRating }> = [];
  @Input() inModal = false;

  constructor(
    private animeService: AnimeService,
    private route: ActivatedRoute,
    public streamPipe: StreamPipe,
    private glob: GlobalService,
    private trakt: TraktService,
    private modalService: NgbModal,
    private anilist: AnilistService,
    private kitsu: KitsuService,
    private simkl: SimklService,
    private annict: AnnictService,
    private anisearch: AnisearchService,
  ) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.ratings = [];
        this.id = newId;
        delete this.anime;
        this.busy = false;
        this.edit = false;
        this.glob.busy();
        await this.ngOnInit();
      }
    });
    this.trakt.user.subscribe(user => {
      this.traktUser = user;
    });
    this.annict.user.subscribe(user => {
      this.annictUser = user;
    });
  }

  async ngOnInit() {
    const anime = await this.animeService.getAnime(this.id);
    if (anime.mean) {
      this.setRating('mal', {
        nom: anime.mean,
        norm: anime.mean * 10,
        ratings: anime.num_scoring_users,
      });
    }
    this.anime = { ...anime };
    if (this.anime?.title) {
      this.glob.setTitle(this.anime.title);
    }
    if (!this.anime.my_extension) {
      this.anime.my_extension = {
        malId: anime.id,
      };
    } else {
      this.anime.my_extension.malId = anime.id;
    }
    if (
      !this.anime.my_extension.kitsuId ||
      !this.anime.my_extension.anilistId ||
      !this.anime.my_extension.simklId ||
      !this.anime.my_extension.annictId ||
      !this.anime.my_extension.anisearchId
    ) {
      const [anilistId, kitsuId, simklId, annictId, anisearchId] = await Promise.all([
        this.anilist.getId(this.id, 'ANIME'),
        this.kitsu.getId(this.id, 'anime'),
        this.simkl.getId(this.id),
        this.annict.getId(this.id, anime.alternative_titles?.ja || anime.title),
        this.anisearch.getId(this.anime.title, 'anime', {
          parts: this.anime.num_episodes,
          year: this.anime.start_season?.year,
        }),
      ]);
      this.anime.my_extension.anilistId = anilistId || this.anime.my_extension.anilistId;
      this.anime.my_extension.kitsuId = kitsuId || this.anime.my_extension.kitsuId;
      this.anime.my_extension.simklId = simklId || this.anime.my_extension.simklId;
      this.anime.my_extension.annictId = annictId || this.anime.my_extension.annictId;
      this.anime.my_extension.anisearchId = anisearchId || this.anime.my_extension.anisearchId;
      if (anime.my_extension) {
        await this.animeService.updateAnime(
          { malId: anime.id, kitsuId, simklId, anilistId, annictId },
          {
            comments: Base64.encode(
              JSON.stringify({
                ...anime.my_extension,
                kitsuId,
                anilistId,
                simklId,
                annictId,
                anisearchId,
              }),
            ),
          },
        );
      }
    }
    if (!this.anime.related_manga.length) {
      this.anime.related_manga_promise.then(relatedManga => {
        if (this.anime) this.anime.related_manga = relatedManga;
      });
    }
    this.glob.notbusy();
    await this.getRatings();
    // await this.findAnisearch();
  }

  async editSave() {
    if (this.busy) return;
    if (this.anime?.my_list_status) {
      if (this.edit) return this.save();
      this.startEdit();
    } else {
      this.addAnime();
    }
  }

  async startEdit() {
    if (!this.anime?.my_list_status) return;
    this.edit = true;
    this.editBackup = {
      status: this.anime.my_list_status.status || 'plan_to_watch',
      is_rewatching: this.anime.my_list_status.is_rewatching,
      score: this.anime.my_list_status.score,
      num_watched_episodes: this.anime.my_list_status.num_episodes_watched,
      priority: this.anime.my_list_status.priority,
      rewatch_value: this.anime.my_list_status.rewatch_value,
      tags: this.anime.my_list_status.tags?.join(','),
    };
    try {
      const extension = JSON.parse(
        Base64.decode(this.anime.my_list_status.comments),
      ) as unknown as Partial<AnimeExtension>;
      this.editExtension = {
        series: '',
        seasonNumber: 1,
        episodeCorOffset: 0,
        ...this.anime.my_extension,
        ...extension,
      };
    } catch (e) {
      this.editExtension = {
        series: '',
        seasonNumber: 1,
        episodeCorOffset: 0,
        externalStreaming: '',
        externalStreamingId: '',
        simulCountry: '',
        simulDay: undefined,
        simulTime: undefined,
        ...this.anime.my_extension,
      };
    }
  }

  async save() {
    if (!this.anime?.my_list_status) return;
    if (!this.editBackup) {
      this.edit = false;
      return;
    }
    this.busy = true;
    if (this.editExtension && this.editExtension.simulDay) {
      this.editExtension.simulDay = Number(this.editExtension.simulDay);
    }
    const updateData = {
      comments: Base64.encode(JSON.stringify(this.editExtension)),
    } as Partial<MyAnimeUpdate>;
    if (this.editBackup.status !== this.anime.my_list_status.status) {
      updateData.status = this.editBackup?.status;
    }
    if (this.editBackup.is_rewatching !== this.anime.my_list_status.is_rewatching) {
      updateData.is_rewatching = this.editBackup?.is_rewatching;
    }
    if (this.editBackup.score !== this.anime.my_list_status.score) {
      updateData.score = this.editBackup?.score;
    }
    if (this.editBackup.num_watched_episodes !== this.anime.my_list_status.num_episodes_watched) {
      updateData.num_watched_episodes = this.editBackup?.num_watched_episodes;
    }
    if (this.editBackup.priority !== this.anime.my_list_status.priority) {
      updateData.priority = this.editBackup?.priority;
    }
    if (this.editBackup.rewatch_value !== this.anime.my_list_status.rewatch_value) {
      updateData.rewatch_value = this.editBackup?.rewatch_value;
    }
    if (this.editBackup.tags !== this.anime.my_list_status.tags?.join(',')) {
      updateData.tags = this.editBackup?.tags;
    }
    await this.animeService.updateAnime(
      {
        malId: this.anime.id,
        anilistId: this.anime.my_extension?.anilistId,
        kitsuId: this.anime.my_extension?.kitsuId,
        simklId: this.anime.my_extension?.simklId,
        annictId: this.anime.my_extension?.annictId,
        trakt: {
          id: this.anime.my_extension?.trakt,
          season: this.anime.media_type === 'movie' ? -1 : this.anime.my_extension?.seasonNumber,
        },
      },
      updateData,
    );
    this.stopEdit();
    await this.ngOnInit();
    this.busy = false;
  }

  stopEdit() {
    this.edit = false;
    delete this.editBackup;
    delete this.editExtension;
  }

  enableKitsu() {
    if (!this.editExtension) return false;
    if (!this.editExtension.kitsuId) {
      this.editExtension.kitsuId = { kitsuId: '' };
    }
    return true;
  }

  async addAnime() {
    if (!this.anime) return;
    this.busy = true;
    await this.animeService.updateAnime(
      {
        malId: this.anime.id,
        anilistId: this.anime.my_extension?.anilistId,
        kitsuId: this.anime.my_extension?.kitsuId,
        simklId: this.anime.my_extension?.simklId,
        annictId: this.anime.my_extension?.annictId,
      },
      { status: 'plan_to_watch' },
    );
    await this.ngOnInit();
    this.busy = false;
  }

  async setStatus(status: WatchStatus) {
    if (!this.anime) return;
    this.glob.busy();
    this.busy = true;
    await this.animeService.updateAnime(
      {
        malId: this.anime.id,
        anilistId: this.anime.my_extension?.anilistId,
        kitsuId: this.anime.my_extension?.kitsuId,
        simklId: this.anime.my_extension?.simklId,
        annictId: this.anime.my_extension?.annictId,
      },
      { status },
    );
    await this.ngOnInit();
    this.busy = false;
  }

  async rewatch() {
    if (!this.anime) return;
    this.glob.busy();
    this.busy = true;
    await this.animeService.updateAnime(
      {
        malId: this.anime.id,
        anilistId: this.anime.my_extension?.anilistId,
        kitsuId: this.anime.my_extension?.kitsuId,
        simklId: this.anime.my_extension?.simklId,
        annictId: this.anime.my_extension?.annictId,
      },
      {
        status: 'completed',
        is_rewatching: true,
        num_watched_episodes: 0,
      },
    );
    await this.ngOnInit();
    this.busy = false;
  }

  async plusOne() {
    if (!this.anime || !this.anime.my_list_status) return;
    this.glob.busy();
    const currentEpisode = this.anime.my_list_status?.num_episodes_watched || 0;
    const data = {
      num_watched_episodes: currentEpisode + 1,
    } as Partial<MyAnimeUpdate>;
    let completed = false;
    if (currentEpisode + 1 === this.anime.num_episodes) {
      data.status = 'completed';
      data.is_rewatching = false;
      if (this.anime.my_list_status.is_rewatching) {
        data.num_times_rewatched = this.anime.my_list_status.num_times_rewatched + 1 || 1;
      }
      completed = true;
      if (!this.anime.my_list_status?.score) {
        const myScore = Math.round(Number(prompt('Your score (1-10)?')));
        if (myScore > 0 && myScore <= 10) data.score = myScore;
      }
    }
    const [animeStatus] = await Promise.all([
      this.animeService.updateAnime(
        {
          malId: this.anime.id,
          anilistId: this.anime.my_extension?.anilistId,
          kitsuId: this.anime.my_extension?.kitsuId,
          simklId: this.anime.my_extension?.simklId,
          annictId: this.anime.my_extension?.annictId,
        },
        data,
      ),
      this.scrobbleTrakt(),
      this.simkl.scrobble(
        { simkl: this.anime.my_extension?.simklId, mal: this.anime.id },
        currentEpisode + 1,
      ),
    ]);
    if (completed) {
      animeStatus.is_rewatching = false;
      const sequels = this.anime.related_anime.filter(
        related => related.relation_type === 'sequel',
      );
      if (sequels.length) {
        const sequel = await this.animeService.getAnime(sequels[0].node.id);
        if (sequel.my_list_status?.status === 'completed') {
          const startSequel = confirm(`Rewatch sequel "${sequel.title}"?`);
          if (startSequel) {
            await this.animeService.updateAnime(
              { malId: sequel.id },
              { status: 'completed', is_rewatching: true, num_watched_episodes: 0 },
            );
          }
        } else {
          const startSequel = confirm(`Start watching sequel "${sequel.title}"?`);
          if (startSequel) {
            await this.animeService.updateAnime({ malId: sequel.id }, { status: 'watching' });
          }
        }
        this.ngOnInit();
      }
    }
    this.anime.my_list_status.num_episodes_watched = animeStatus.num_episodes_watched;
    this.anime.my_list_status.status = animeStatus.status;
    this.anime.my_list_status.score = animeStatus.score;
    this.anime.my_list_status.is_rewatching = animeStatus.is_rewatching;
    this.anime.my_list_status.num_times_rewatched = animeStatus.num_times_rewatched;
    this.glob.notbusy();
  }

  async scrobbleTrakt(): Promise<boolean> {
    if (!this.anime) return false;
    return new Promise(async r => {
      if (!this.anime) return r(false);
      if (!this.traktUser || !this.anime.my_extension?.trakt) return r(false);
      r(
        this.anime.media_type === 'movie'
          ? await this.trakt.scrobbleMovie(this.anime.my_extension.trakt)
          : await this.trakt.scrobble(
              this.anime.my_extension.trakt,
              this.anime.my_extension.seasonNumber || 1,
              (this.anime.my_list_status?.num_episodes_watched || 0) +
                1 +
                (this.anime.my_extension.episodeCorOffset || 0),
            ),
      );
    });
  }

  async deleteEntry(): Promise<boolean> {
    if (!this.anime) return false;
    if (!confirm(`Are you sure you want to delete "${this.anime.title}"?`)) return false;
    this.glob.busy();
    this.busy = true;
    await this.animeService.deleteAnime({
      malId: this.anime.id,
      anilistId: this.anime.my_extension?.anilistId,
      kitsuId: this.anime.my_extension?.kitsuId,
      simklId: this.anime.my_extension?.simklId,
      annictId: this.anime.my_extension?.annictId,
    });
    this.edit = false;
    await this.ngOnInit();
    this.glob.notbusy();
    this.busy = false;
    return true;
  }

  async findTrakt() {
    if (!this.anime || !this.editExtension) return;
    const modal = this.modalService.open(TraktComponent);
    modal.componentInstance.isMovie = this.anime.media_type === 'movie';
    modal.componentInstance.title = this.anime.my_extension?.series || this.anime.title;
    modal.closed.subscribe(value => {
      if (this.editExtension) this.editExtension.trakt = String(value);
    });
  }

  async findAnisearch() {
    if (!this.anime || !this.editExtension) return;
    const modal = this.modalService.open(AnisearchComponent);
    modal.componentInstance.title = this.anime.title;
    modal.closed.subscribe(value => {
      if (this.editExtension) this.editExtension.anisearchId = Number(value);
    });
  }

  async findAnnict() {
    if (!this.anime || !this.editExtension) return;
    const modal = this.modalService.open(AnnictComponent);
    modal.componentInstance.title = this.anime.alternative_titles?.ja || this.anime.title;
    modal.closed.subscribe(value => {
      if (this.editExtension) this.editExtension.annictId = Number(value);
    });
  }

  getDay(day?: number): string {
    if (!day && day !== 0) return '';
    return moment().day(day).format('dddd');
  }

  async getRatings() {
    if (!this.getRating('trakt')) {
      this.trakt
        .getRating(
          this.anime?.my_extension?.trakt,
          this.anime?.media_type === 'movie' ? -1 : this.anime?.my_extension?.seasonNumber || 1,
        )
        .then(rating => {
          this.setRating('trakt', rating);
        });
    }
    if (!this.getRating('anilist')) {
      this.anilist.getRating(this.anime?.my_extension?.anilistId).then(rating => {
        this.setRating('anilist', rating);
      });
    }
    if (!this.getRating('kitsu')) {
      this.kitsu.getRating(Number(this.anime?.my_extension?.kitsuId?.kitsuId)).then(rating => {
        this.setRating('kitsu', rating);
      });
    }
    if (!this.getRating('simkl')) {
      this.simkl.getRating(this.anime?.my_extension?.simklId).then(rating => {
        this.setRating('simkl', rating);
      });
    }
    if (!this.getRating('annict')) {
      this.annict.getRating(this.anime?.my_extension?.annictId).then(rating => {
        this.setRating('annict', rating);
      });
    }
    if (!this.getRating('anisearch')) {
      this.anisearch.getRating(this.anime?.my_extension?.anisearchId).then(rating => {
        this.setRating('anisearch', rating);
      });
    }
  }

  get meanRating(): number {
    if (this.anime?.my_list_status?.score) return this.anime?.my_list_status?.score * 10;
    let count = 0;
    const weighted = this.ratings.map(rating => {
      count += rating.rating.ratings || 0;
      return rating.rating.norm * (rating.rating.ratings || 0);
    });
    if (count) return weighted.reduce((prev, curr) => prev + curr) / count;
    return 0;
  }

  getRating(provider: string): { provider: string; rating: ExtRating } | undefined {
    return this.ratings.filter(rat => rat.provider === provider).pop();
  }

  setRating(provider: string, rating?: ExtRating) {
    if (rating) {
      let exists = false;
      this.ratings.forEach(rat => {
        if (rat.provider === provider) {
          rat.rating = rating;
          exists = true;
        }
      });
      if (!exists) this.ratings.push({ provider, rating });
    }
  }
}
