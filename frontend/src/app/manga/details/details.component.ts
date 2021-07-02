import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExtRating, Picture } from '@models/components';
import { Manga, MangaExtension, MyMangaUpdate, ReadStatus } from '@models/mal-manga';
import { Gallery } from 'angular-gallery';
import { Base64 } from 'js-base64';
import { AnilistService } from 'src/app/anilist.service';
import { GlobalService } from 'src/app/global.service';
import { KitsuService } from 'src/app/kitsu.service';
import { PlatformPipe } from 'src/app/platform.pipe';

import { MangaService } from '../manga.service';

@Component({
  selector: 'app-manga-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class MangaDetailsComponent implements OnInit, OnDestroy {
  @Input() id = 0;
  @Input() inModal = false;
  manga?: Manga;
  shortsyn = true;
  edit = false;
  busy = false;
  editBackup?: Partial<MyMangaUpdate>;
  editExtension?: MangaExtension;
  ratings: Array<{ provider: string; rating: ExtRating }> = [];
  activeTab = 1;
  constructor(
    private mangaService: MangaService,
    private route: ActivatedRoute,
    private glob: GlobalService,
    private gallery: Gallery,
    public platformPipe: PlatformPipe,
    private anilist: AnilistService,
    private kitsu: KitsuService,
  ) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.ratings = [];
        this.id = newId;
        delete this.manga;
        this.glob.busy();
        await this.ngOnInit();
      }
    });
  }

  async ngOnInit() {
    const manga = await this.mangaService.getManga(this.id);
    if (manga.mean) {
      this.setRating('mal', {
        nom: manga.mean,
        norm: manga.mean * 10,
        ratings: manga.num_scoring_users,
      });
    }
    this.manga = { ...manga };
    if (this.manga?.title) {
      this.glob.setTitle(this.manga.title);
    }
    if (!this.manga.my_extension) {
      this.manga.my_extension = {
        malId: manga.id,
      };
    } else {
      this.manga.my_extension.malId = manga.id;
    }
    if (
      !this.manga.my_extension.kitsuId ||
      !this.manga.my_extension.kitsuId.entryId ||
      !this.manga.my_extension.anilistId
    ) {
      const [anilistId, kitsuId] = await Promise.all([
        this.anilist.getId(this.id, 'MANGA'),
        this.kitsu.getId(this.id, 'manga', 'myanimelist', this.manga.my_extension.kitsuId?.kitsuId),
      ]);
      this.manga.my_extension.anilistId = anilistId;
      this.manga.my_extension.kitsuId = kitsuId;
      if (manga.my_extension) {
        await this.mangaService.updateManga(
          { malId: manga.id, kitsuId, anilistId },
          {
            comments: Base64.encode(
              JSON.stringify({
                ...manga.my_extension,
                kitsuId,
                anilistId,
              }),
            ),
          },
        );
      }
    }
    this.glob.notbusy();
    await this.getRatings();
  }

  async editSave() {
    if (this.busy) return;
    if (this.manga?.my_list_status) {
      if (this.edit) return this.save();
      this.startEdit();
    } else {
      this.setStatus('plan_to_read');
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
      const extension = JSON.parse(
        Base64.decode(this.manga.my_list_status.comments),
      ) as unknown as Partial<MangaExtension>;
      this.editExtension = {
        ...this.manga.my_extension,
        ...extension,
      };
    } catch (e) {
      this.editExtension = { ...this.manga.my_extension };
    }
  }

  enableKitsu() {
    if (!this.editExtension) return false;
    if (!this.editExtension.kitsuId) {
      this.editExtension.kitsuId = { kitsuId: '' };
    }
    return true;
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
    await this.mangaService.updateManga(
      {
        malId: this.manga.id,
        anilistId: this.manga.my_extension?.anilistId,
        kitsuId: this.manga.my_extension?.kitsuId,
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

  async setStatus(status: ReadStatus) {
    if (!this.manga) return;
    this.glob.busy();
    this.busy = true;
    await this.mangaService.updateManga(
      {
        malId: this.manga.id,
        anilistId: this.manga.my_extension?.anilistId,
        kitsuId: this.manga.my_extension?.kitsuId,
      },
      { status },
    );
    await this.ngOnInit();
    this.busy = false;
  }

  async reread() {
    if (!this.manga) return;
    this.glob.busy();
    this.busy = true;
    await this.mangaService.updateManga(
      {
        malId: this.manga.id,
        anilistId: this.manga.my_extension?.anilistId,
        kitsuId: this.manga.my_extension?.kitsuId,
      },
      {
        status: 'completed',
        is_rereading: true,
        num_chapters_read: 0,
        num_volumes_read: 0,
      },
    );
    await this.ngOnInit();
    this.busy = false;
  }

  async plusOne(type: 'chapter' | 'volume') {
    if (!this.manga || !this.manga.my_list_status) return;
    this.glob.busy();
    const currentChapter = this.manga.my_list_status?.num_chapters_read || 0;
    const currentVolume = this.manga.my_list_status?.num_volumes_read || 0;
    const data = {} as Partial<MyMangaUpdate>;
    if (type === 'volume') {
      data.num_volumes_read = currentVolume + 1;
    } else {
      data.num_chapters_read = currentChapter + 1;
    }
    let completed = false;
    if (type === 'volume' && this.manga.num_chapters && this.manga.num_volumes) {
      data.num_chapters_read = Math.max(
        this.manga.my_list_status?.num_chapters_read || 0,
        Math.floor(((currentVolume + 1) / this.manga.num_volumes) * this.manga.num_chapters),
      );
    }
    if (
      data.num_volumes_read === this.manga.num_volumes ||
      data.num_chapters_read === this.manga.num_chapters
    ) {
      data.status = 'completed';
      data.is_rereading = false;
      if (this.manga.my_list_status.is_rereading) {
        data.num_times_reread = this.manga.my_list_status.num_times_reread + 1 || 1;
      }
      if (this.manga.num_chapters) data.num_chapters_read = this.manga.num_chapters;
      if (this.manga.num_volumes) data.num_volumes_read = this.manga.num_volumes;
      completed = true;
      if (!this.manga.my_list_status?.score) {
        const myScore = Math.round(Number(prompt('Your score (1-10)?')));
        if (myScore > 0 && myScore <= 10) data.score = myScore;
      }
    }
    const statusResponse = await this.mangaService.updateManga(
      {
        malId: this.manga.id,
        anilistId: this.manga.my_extension?.anilistId,
        kitsuId: this.manga.my_extension?.kitsuId,
      },
      data,
    );
    this.manga.my_list_status.num_chapters_read = statusResponse.num_chapters_read;
    this.manga.my_list_status.num_volumes_read = statusResponse.num_volumes_read;
    this.manga.my_list_status.status = statusResponse.status;
    this.manga.my_list_status.score = statusResponse.score;
    this.manga.my_list_status.num_times_reread = statusResponse.num_times_reread;
    this.manga.my_list_status.is_rereading = statusResponse.is_rereading;
    this.glob.notbusy();
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

  showGallery() {
    if (!this.manga || !this.manga.main_picture) return;
    function picMap(pic: Picture) {
      return { path: pic.large || pic.medium };
    }
    const prop = {
      images: [
        picMap(this.manga.main_picture),
        ...this.manga.pictures
          .filter(pic => pic.medium !== this.manga?.main_picture?.medium)
          .map(picMap),
      ],
    };
    this.gallery.load(prop);
  }

  async getRatings() {
    if (!this.getRating('anilist')) {
      this.anilist.getRating(this.manga?.my_extension?.anilistId, 'MANGA').then(rating => {
        this.setRating('anilist', rating);
      });
    }
    if (!this.getRating('kitsu')) {
      this.kitsu
        .getRating(Number(this.manga?.my_extension?.kitsuId?.kitsuId), 'manga')
        .then(rating => {
          this.setRating('kitsu', rating);
        });
    }
  }

  get meanRating(): number {
    if (this.manga?.my_list_status?.score) return this.manga?.my_list_status?.score * 10;
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

  changeOngoing() {
    const ongoing = !this.editExtension?.ongoing;
    if (!this.editExtension) this.editExtension = { ongoing };
    this.editExtension.ongoing = ongoing;
  }

  ngOnDestroy() {
    this.gallery.close();
  }
}
