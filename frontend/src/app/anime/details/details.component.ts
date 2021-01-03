import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Anime, AnimeExtension, AnimeTheme, MyAnimeUpdate } from '@models/anime';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Base64 } from 'js-base64';
import * as moment from 'moment';
import { DeviceDetectorService } from 'ngx-device-detector';
import { GlobalService } from 'src/app/global.service';
import { MalService } from 'src/app/mal.service';
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
  shortsyn = true;
  edit = false;
  busy = false;
  editBackup?: Partial<MyAnimeUpdate>;
  editExtension?: AnimeExtension;
  traktUser?: string;
  @Input() inModal = false;

  constructor(
    private malService: MalService,
    private animeService: AnimeService,
    private route: ActivatedRoute,
    public streamPipe: StreamPipe,
    private glob: GlobalService,
    private trakt: TraktService,
    private modalService: NgbModal,
    private deviceDetector: DeviceDetectorService,
    private sanitizer: DomSanitizer,
  ) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.anime;
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

  getRelatedAnimes() {
    if (!this.anime?.related_anime?.length) return [];
    const types = this.anime.related_anime
      .map(an => an.relation_type_formatted)
      .filter((value, index, self) => self.indexOf(value) === index);
    const relatedAnime = [];
    for (const type of types) {
      const related = this.anime.related_anime
        .filter(value => value.relation_type_formatted === type)
        .map(an => an.node);
      relatedAnime.push({ name: type, entries: related });
    }
    return relatedAnime;
  }
  getRelatedMangas() {
    if (!this.anime?.related_manga?.length) return [];
    const types = this.anime.related_manga
      .map(an => an.relation_type_formatted)
      .filter((value, index, self) => self.indexOf(value) === index);
    const relatedAnime = [];
    for (const type of types) {
      const related = this.anime.related_manga
        .filter(value => value.relation_type_formatted === type)
        .map(an => an.node);
      relatedAnime.push({ name: type, entries: related });
    }
    return relatedAnime;
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
    if (!day) return '';
    return moment().day(day).format('dddd');
  }

  getSongUrl(spotifyUri?: string): string | SafeUrl {
    if (!spotifyUri) return '';
    if (this.deviceDetector.isMobile()) return this.sanitizer.bypassSecurityTrustUrl(spotifyUri);
    const parts = spotifyUri.split(':');
    if (parts[0] === 'spotify' && parts.length === 3) {
      return `https://open.spotify.com/${parts[1]}/${parts[2]}`;
    }
    return '';
  }

  async setSongUrl(song: AnimeTheme) {
    this.glob.busy();
    const spotify = prompt('Spotify URI', song.spotify)?.replace(
      /https:\/\/open.spotify.com\/track\/(\w+)(\?.+)?/,
      'spotify:track:$1',
    );
    if (!spotify?.match(/^spotify:track:\w+$/) || song.spotify === spotify) {
      this.glob.notbusy();
      return;
    }
    await this.malService.post('song/' + song.id, { spotify });
    this.glob.notbusy();
    song.spotify = spotify;
  }
}
