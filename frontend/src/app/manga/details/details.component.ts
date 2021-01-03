import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Manga, MangaExtension, MyMangaUpdate } from '@models/manga';
import { Base64 } from 'js-base64';
import { GlobalService } from 'src/app/global.service';

import { MangaService } from '../manga.service';

@Component({
  selector: 'app-manga-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class MangaDetailsComponent implements OnInit {
  @Input() id = 0;
  @Input() inModal = false;
  manga?: Manga;
  shortsyn = true;
  edit = false;
  busy = false;
  editBackup?: Partial<MyMangaUpdate>;
  editExtension?: MangaExtension;
  constructor(
    private mangaService: MangaService,
    private route: ActivatedRoute,
    private glob: GlobalService,
  ) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.manga;
        this.glob.busy();
        await this.ngOnInit();
      }
    });
  }

  async ngOnInit() {
    this.manga = await this.mangaService.getManga(this.id);
    this.glob.notbusy();
  }

  async editSave() {
    if (this.busy) return;
    if (this.manga?.my_list_status) {
      if (this.edit) return this.save();
      this.startEdit();
    } else {
      this.addManga();
    }
  }

  async startEdit() {
    if (!this.manga?.my_list_status) return;
    this.edit = true;
    this.editBackup = {
      status: this.manga.my_list_status.status || 'plan_to_read',
      is_rereading: this.manga.my_list_status.is_rereading,
      score: this.manga.my_list_status.score,
      num_chapters_read: this.manga.my_list_status.num_chapters_read,
      num_volumes_read: this.manga.my_list_status.num_volumes_read,
      priority: this.manga.my_list_status.priority,
      reread_value: this.manga.my_list_status.reread_value,
      tags: this.manga.my_list_status.tags,
    };
    try {
      const extension = (JSON.parse(
        Base64.decode(this.manga.my_list_status.comments),
      ) as unknown) as Partial<MangaExtension>;
      this.editExtension = {
        ...extension,
      };
    } catch (e) {
      this.editExtension = {};
    }
  }

  async save() {
    if (!this.manga?.my_list_status) return;
    if (!this.editBackup) {
      this.edit = false;
      return;
    }
    this.busy = true;
    const updateData = {
      comments: Base64.encode(JSON.stringify(this.editExtension)),
    } as Partial<MyMangaUpdate>;
    if (this.editBackup.status !== this.manga.my_list_status.status) {
      updateData.status = this.editBackup?.status;
    }
    if (this.editBackup.is_rereading !== this.manga.my_list_status.is_rereading) {
      updateData.is_rereading = this.editBackup?.is_rereading;
    }
    if (this.editBackup.score !== this.manga.my_list_status.score) {
      updateData.score = this.editBackup?.score;
    }
    if (this.editBackup.num_chapters_read !== this.manga.my_list_status.num_chapters_read) {
      updateData.num_chapters_read = this.editBackup?.num_chapters_read;
    }
    if (this.editBackup.num_volumes_read !== this.manga.my_list_status.num_volumes_read) {
      updateData.num_volumes_read = this.editBackup?.num_volumes_read;
    }
    if (this.editBackup.priority !== this.manga.my_list_status.priority) {
      updateData.priority = this.editBackup?.priority;
    }
    if (this.editBackup.reread_value !== this.manga.my_list_status.reread_value) {
      updateData.reread_value = this.editBackup?.reread_value;
    }
    if (this.editBackup.tags !== this.manga.my_list_status.tags) {
      updateData.tags = this.editBackup?.tags;
    }
    await this.mangaService.updateManga(this.manga.id, updateData);
    this.stopEdit();
    await this.ngOnInit();
    this.busy = false;
  }

  stopEdit() {
    this.edit = false;
    delete this.editBackup;
    delete this.editExtension;
  }

  async addManga() {
    if (!this.manga) return;
    this.busy = true;
    await this.mangaService.updateManga(this.manga.id, { status: 'plan_to_read' });
    await this.ngOnInit();
    this.busy = false;
  }

  async plusOneVolume() {
    if (!this.manga) return;
    this.glob.busy();
    const currentVolume = this.manga.my_list_status?.num_volumes_read || 0;
    const data = {
      num_volumes_read: currentVolume + 1,
    } as Partial<MyMangaUpdate>;
    let completed = false;
    if (currentVolume + 1 === this.manga.num_volumes) {
      data.status = 'completed';
      if (this.manga.num_chapters) data.num_chapters_read = this.manga.num_chapters;
      completed = true;
      if (!this.manga.my_list_status?.score) {
        const myScore = Math.round(Number(prompt('Your score (1-10)?')));
        if (myScore > 0 && myScore <= 10) data.score = myScore;
      }
    }
    await this.mangaService.updateManga(this.manga.id, data);
    this.ngOnInit();
  }

  async plusOneChapter() {
    if (!this.manga) return;
    this.glob.busy();
    const currentChapter = this.manga.my_list_status?.num_chapters_read || 0;
    const data = {
      num_chapters_read: currentChapter + 1,
    } as Partial<MyMangaUpdate>;
    let completed = false;
    if (currentChapter + 1 === this.manga.num_chapters) {
      data.status = 'completed';
      if (this.manga.num_volumes) data.num_volumes_read = this.manga.num_volumes;
      completed = true;
      if (!this.manga.my_list_status?.score) {
        const myScore = Math.round(Number(prompt('Your score (1-10)?')));
        if (myScore > 0 && myScore <= 10) data.score = myScore;
      }
    }
    await this.mangaService.updateManga(this.manga.id, data);
    this.ngOnInit();
  }

  getRelatedAnimes() {
    if (!this.manga?.related_anime?.length) return [];
    const types = this.manga.related_anime
      .map(an => an.relation_type_formatted)
      .filter((value, index, self) => self.indexOf(value) === index);
    const relatedAnime = [];
    for (const type of types) {
      const related = this.manga.related_anime
        .filter(value => value.relation_type_formatted === type)
        .map(an => an.node);
      relatedAnime.push({ name: type, entries: related });
    }
    return relatedAnime;
  }

  getRelatedMangas() {
    if (!this.manga?.related_manga?.length) return [];
    const types = this.manga.related_manga
      .map(an => an.relation_type_formatted)
      .filter((value, index, self) => self.indexOf(value) === index);
    const relatedAnime = [];
    for (const type of types) {
      const related = this.manga.related_manga
        .filter(value => value.relation_type_formatted === type)
        .map(an => an.node);
      relatedAnime.push({ name: type, entries: related });
    }
    return relatedAnime;
  }
}
