import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Anime, AnimeExtension, MyAnimeUpdate } from '@models/anime';
import * as moment from 'moment';
import { StreamPipe } from 'src/app/stream.pipe';

import { AnimeService } from '../anime.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
  @Input() id!: number;
  anime?: Anime;
  shortsyn = true;
  edit = false;
  busy = false;
  editBackup?: Partial<MyAnimeUpdate>;
  editExtension?: AnimeExtension;

  constructor(
    private animeService: AnimeService,
    private route: ActivatedRoute,
    public streamPipe: StreamPipe,
  ) {
    this.id = Number(this.route?.snapshot?.paramMap?.get('id'));
    this.route.url.subscribe(url => {
      const newId = Number(this.route?.snapshot?.paramMap?.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.anime;
        this.ngOnInit();
      }
    });
  }

  async ngOnInit() {
    this.anime = await this.animeService.getAnime(this.id);
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
        atob(this.anime.my_list_status.comments),
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
    const updateData = {
      comments: btoa(JSON.stringify(this.editExtension)),
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

  getDay(day?: number): string {
    if (!day) return '';
    return moment().day(day).format('dddd');
  }
}
