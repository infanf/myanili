import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Anime, AnimeExtension, MyAnimeUpdate } from '@models/anime';
import { Picture } from '@models/components';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Gallery } from 'angular-gallery';
import { Base64 } from 'js-base64';
import * as moment from 'moment';
import { GlobalService } from 'src/app/global.service';
import { StreamPipe } from 'src/app/stream.pipe';

import { AnimeService } from '../anime.service';
import { TraktService } from '../trakt.service';
import { TraktComponent } from '../trakt/trakt.component';

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
  activeTab = 1;
  @Input() inModal = false;

  constructor(
    private animeService: AnimeService,
    private route: ActivatedRoute,
    public streamPipe: StreamPipe,
    private glob: GlobalService,
    private trakt: TraktService,
    private modalService: NgbModal,
    private gallery: Gallery,
  ) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.anime;
        this.busy = false;
        this.edit = false;
        this.activeTab = 1;
        this.glob.busy();
        await this.ngOnInit();
      }
    });
    this.trakt.user.subscribe(user => {
      this.traktUser = user;
    });
  }

  async ngOnInit() {
    this.anime = await this.animeService.getAnime(this.id);
    this.glob.notbusy();
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
      const extension = (JSON.parse(
        Base64.decode(this.anime.my_list_status.comments),
      ) as unknown) as Partial<AnimeExtension>;
      this.editExtension = {
        series: '',
        seasonNumber: 1,
        episodeCorOffset: 0,
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
    await this.animeService.updateAnime(this.anime.id, updateData);
    this.stopEdit();
    await this.ngOnInit();
    this.busy = false;
  }

  stopEdit() {
    this.edit = false;
    delete this.editBackup;
    delete this.editExtension;
  }

  async addAnime() {
    if (!this.anime) return;
    this.busy = true;
    await this.animeService.updateAnime(this.anime.id, { status: 'plan_to_watch' });
    await this.ngOnInit();
    this.busy = false;
  }

  async setWatching() {
    if (!this.anime) return;
    this.glob.busy();
    this.busy = true;
    await this.animeService.updateAnime(this.anime.id, { status: 'watching' });
    await this.ngOnInit();
    this.busy = false;
  }

  async plusOne() {
    if (!this.anime) return;
    this.glob.busy();
    const currentEpisode = this.anime.my_list_status?.num_episodes_watched || 0;
    const data = {
      num_watched_episodes: currentEpisode + 1,
    } as Partial<MyAnimeUpdate>;
    let completed = false;
    if (currentEpisode + 1 === this.anime.num_episodes) {
      data.status = 'completed';
      completed = true;
      if (!this.anime.my_list_status?.score) {
        const myScore = Math.round(Number(prompt('Your score (1-10)?')));
        if (myScore > 0 && myScore <= 10) data.score = myScore;
      }
    }
    await Promise.all([this.animeService.updateAnime(this.anime.id, data), this.scrobbleTrakt()]);
    if (completed) {
      const sequels = this.anime.related_anime.filter(
        related => related.relation_type === 'sequel',
      );
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

  async scrobbleTrakt(): Promise<boolean> {
    if (!this.anime) return false;
    return new Promise(async r => {
      if (!this.anime) return r(false);
      if (!this.traktUser || !this.anime.my_extension?.trakt) return r(false);
      r(
        await this.trakt.scrobble(
          this.anime.my_extension.trakt,
          this.anime.my_extension.seasonNumber,
          (this.anime.my_list_status?.num_episodes_watched || 0) +
            1 +
            (this.anime.my_extension.episodeCorOffset || 0),
        ),
      );
    });
  }

  async findTrakt() {
    if (!this.anime || !this.editExtension) return;
    const modal = this.modalService.open(TraktComponent);
    modal.componentInstance.title = this.anime.my_extension?.series || this.anime.title;
    modal.closed.subscribe(value => {
      if (this.editExtension) this.editExtension.trakt = String(value);
    });
  }

  getDay(day?: number): string {
    if (!day && day !== 0) return '';
    return moment().day(day).format('dddd');
  }

  showGallery() {
    if (!this.anime || !this.anime.main_picture) return;
    function picMap(pic: Picture) {
      return { path: pic.large || pic.medium };
    }
    const prop = {
      images: [
        picMap(this.anime.main_picture),
        ...this.anime.pictures
          .filter(pic => pic.medium !== this.anime?.main_picture?.medium)
          .map(picMap),
      ],
    };
    this.gallery.load(prop);
  }

  ngOnDestroy() {
    this.gallery.close();
  }
}
