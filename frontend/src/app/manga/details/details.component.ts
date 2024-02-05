import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlatformPipe } from '@components/platform.pipe';
import { AnnComponent } from '@external/ann/ann.component';
import { BakamangaComponent } from '@external/bakamanga/bakamanga.component';
import { KitsuComponent } from '@external/kitsu/kitsu.component';
import { ExtRating, Weekday } from '@models/components';
import { Manga, MangaExtension, MyMangaUpdate, ReadStatus } from '@models/manga';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnilistService } from '@services/anilist.service';
import { AnisearchService } from '@services/anisearch.service';
import { AnnService } from '@services/ann.service';
import { CacheService } from '@services/cache.service';
import { DialogueService } from '@services/dialogue.service';
import { GlobalService } from '@services/global.service';
import { KitsuService } from '@services/kitsu.service';
import { MangaService } from '@services/manga/manga.service';
import { MangadexService } from '@services/manga/mangadex.service';
import { MangapassionService } from '@services/manga/mangapassion.service';
import { MangaupdatesService } from '@services/manga/mangaupdates.service';
import { ShikimoriService } from '@services/shikimori.service';

@Component({
  selector: 'myanili-manga-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class MangaDetailsComponent implements OnInit {
  @Input() id = 0;
  @Input() inModal = false;
  manga?: Manga;
  title?: string;
  shortsyn = true;
  edit = false;
  fromCache = false;
  busy = false;
  editBackup?: Partial<MyMangaUpdate>;
  editExtension?: MangaExtension;
  ratings: Array<{ provider: string; rating: ExtRating }> = [];
  activeTab = 1;
  originalLanguage = 'Japanese';

  constructor(
    private mangaService: MangaService,
    private route: ActivatedRoute,
    private glob: GlobalService,
    public platformPipe: PlatformPipe,
    private anilist: AnilistService,
    private kitsu: KitsuService,
    private shikimori: ShikimoriService,
    private baka: MangaupdatesService,
    private mangadex: MangadexService,
    private mangapassion: MangapassionService,
    private anisearch: AnisearchService,
    private ann: AnnService,
    private modalService: NgbModal,
    private cache: CacheService,
    private dialogue: DialogueService,
  ) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.ratings = [];
        this.id = newId;
        delete this.title;
        delete this.manga;
        this.glob.busy();
        await this.ngOnInit();
      }
    });
  }

  async ngOnInit() {
    this.cache
      .getValues<Manga>(this.id, 'manga')
      .then(mangaCached => {
        if (mangaCached && !this.manga) {
          this.manga = mangaCached;
          this.title = mangaCached.title;
          this.fromCache = true;
          this.glob.setTitle(mangaCached.title);
          this.glob.notbusy();
        }
      })
      .catch(() => {});
    const manga = await this.mangaService.getManga(this.id);
    if (manga.mean) {
      this.setRating('mal', {
        nom: manga.mean,
        norm: manga.mean * 10,
        ratings: manga.num_scoring_users,
      });
    }
    this.manga = { ...manga };
    this.fromCache = false;
    if (this.manga?.title) {
      this.glob.setTitle(this.manga.title);
      this.cache.saveTitle(this.manga.id, 'manga', this.manga.title);
    }
    if (!this.manga.my_extension) {
      this.manga.my_extension = {
        malId: manga.id,
      };
    } else {
      this.manga.my_extension.malId = manga.id;
    }
    await this.checkExternalIds(manga);
    if (!this.manga.related_anime.length) {
      this.manga.related_anime_promise.then(relatedAnime => {
        if (this.manga) this.manga.related_anime = relatedAnime;
      });
    }
    this.glob.notbusy();
    await this.getRatings();
  }

  async getOriginalLanguage() {
    const anilistId = this.manga?.my_extension?.anilistId;
    if (!anilistId) {
      this.originalLanguage = 'Japanese';
      return;
    }
    this.anilist.getLang(anilistId).then(lang => {
      this.originalLanguage = lang || 'Japanese';
    });
  }

  async checkExternalIds(manga: Manga) {
    if (!this.manga?.my_extension) return;
    const promises = [];
    if (!this.manga.my_extension.kitsuId?.kitsuId) {
      promises.push(
        this.kitsu
          .getId(
            {
              id: this.id,
              title: manga.title,
              year: manga.start_date ? new Date(manga.start_date).getFullYear() : undefined,
            },
            'manga',
            'myanimelist',
            this.manga.my_extension.kitsuId?.kitsuId,
          )
          .then(kitsuId => {
            if (kitsuId && this?.manga?.my_extension) {
              this.manga.my_extension.kitsuId = kitsuId;
            }
          }),
      );
    }
    if (!this.manga.my_extension.anilistId) {
      promises.push(
        this.anilist.getId(this.id, 'MANGA').then(anilistId => {
          if (anilistId && this?.manga?.my_extension) {
            this.manga.my_extension.anilistId = anilistId;
            this.getOriginalLanguage();
          }
        }),
      );
    } else {
      this.getOriginalLanguage();
    }
    if (!this.manga.my_extension.anisearchId) {
      promises.push(
        this.anisearch
          .getId(this.manga.title, 'manga', {
            parts: this.manga.num_chapters,
            volumes: this.manga.num_volumes,
            year: this.manga.start_date ? new Date(this.manga.start_date).getFullYear() : undefined,
          })
          .then(anisearchId => {
            if (anisearchId && this?.manga?.my_extension) {
              this.manga.my_extension.anisearchId = anisearchId;
            }
          }),
      );
    }
    if (!this.manga.my_extension.bakaId || /[a-z]/.test(String(this.manga.my_extension.bakaId))) {
      promises.push(
        this.baka.getIdFromManga(this.manga).then(bakaId => {
          if (bakaId && this?.manga?.my_extension) {
            this.manga.my_extension.bakaId = bakaId;
          }
        }),
      );
    }
    if (!this.manga.my_extension.annId) {
      promises.push(
        this.ann
          .getId(
            this.manga.alternative_titles?.en?.replace(/^The /, '') || this.manga.title,
            'manga',
          )
          .then(annId => {
            if (annId && this?.manga?.my_extension) {
              this.manga.my_extension.annId = annId;
            }
          }),
      );
    }
    if (!this.manga.my_extension.mdId) {
      promises.push(
        this.mangadex.getByMalId(this.manga.id, this.manga.title).then(mdmanga => {
          if (mdmanga && this?.manga?.my_extension) {
            this.manga.my_extension.mdId = mdmanga.id;
          }
        }),
      );
    }
    if (!this.manga.my_extension.mpasId) {
      const titles = [this.manga.title];
      if (this.manga.alternative_titles?.en) {
        titles.push(this.manga.alternative_titles.en);
      }
      if (this.manga.alternative_titles?.ja) {
        titles.push(this.manga.alternative_titles.ja);
      }
      promises.push(
        this.mangapassion.getIdFromTitle(titles).then(mpasId => {
          if (mpasId && this?.manga?.my_extension) {
            this.manga.my_extension.mpasId = mpasId;
          }
        }),
      );
    }
    await Promise.all(promises);
    if (promises.length && manga.my_extension && manga.my_list_status) {
      const { Base64 } = await import('js-base64');
      await this.mangaService.updateManga(
        {
          malId: manga.id,
          kitsuId: this.manga.my_extension.kitsuId,
          anilistId: this.manga.my_extension.anilistId,
        },
        {
          comments: Base64.encode(
            JSON.stringify({
              ...manga.my_extension,
              kitsuId: this.manga.my_extension.kitsuId,
              anilistId: this.manga.my_extension.anilistId,
              anisearchId: this.manga.my_extension.anisearchId,
              bakaId: this.manga.my_extension.bakaId,
              annId: this.manga.my_extension.annId,
              mdId: this.manga.my_extension.mdId,
              mpasId: this.manga.my_extension.mpasId,
            }),
          ),
        },
      );
    }
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
      start_date: this.manga.my_list_status.start_date,
      finish_date: this.manga.my_list_status.finish_date,
      tags: this.manga.my_list_status.tags,
    };
    try {
      const { Base64 } = await import('js-base64');
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
    const { Base64 } = await import('js-base64');
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
    if (this.editBackup.start_date !== this.manga.my_list_status.start_date) {
      updateData.start_date = this.editBackup?.start_date;
    }
    if (this.editBackup.finish_date !== this.manga.my_list_status.finish_date) {
      updateData.finish_date = this.editBackup?.finish_date;
    }
    await this.mangaService.updateManga(
      {
        malId: this.manga.id,
        anilistId: this.manga.my_extension?.anilistId,
        kitsuId: this.manga.my_extension?.kitsuId,
        bakaId: this.manga.my_extension?.bakaId,
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
    const data = { status } as Partial<MyMangaUpdate>;
    if (status === 'reading' && !this.manga.my_list_status?.start_date) {
      const { DateTime } = require('luxon') as typeof import('luxon');
      data.start_date = DateTime.local().toISODate() || undefined;
    }
    await this.mangaService.updateManga(
      {
        malId: this.manga.id,
        anilistId: this.manga.my_extension?.anilistId,
        kitsuId: this.manga.my_extension?.kitsuId,
        bakaId: this.manga.my_extension?.bakaId,
      },
      data,
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

  async startOver() {
    if (!this.manga) return;
    this.glob.busy();
    this.busy = true;
    if (
      !(await this.dialogue.confirm(
        `Are you sure you want to read "${this.manga.title}" from the start again?`,
        'Start over',
      ))
    ) {
      this.busy = false;
      this.glob.notbusy();
      return;
    }
    const { DateTime } = require('luxon') as typeof import('luxon');
    await this.mangaService.updateManga(
      {
        malId: this.manga.id,
        anilistId: this.manga.my_extension?.anilistId,
        kitsuId: this.manga.my_extension?.kitsuId,
        bakaId: this.manga.my_extension?.bakaId,
      },
      {
        status: 'reading',
        num_chapters_read: 0,
        num_volumes_read: 0,
        start_date: DateTime.local().toISODate() || undefined,
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
    const mdId = this.manga.my_extension?.mdId;
    if (type === 'volume') {
      data.num_volumes_read = currentVolume + 1;
      if (mdId) {
        const chapters = await this.mangadex.getChapter(mdId, currentVolume + 1);
        if (chapters?.last) {
          data.num_chapters_read = Math.max(chapters.last, currentChapter);
        }
      }
    } else {
      data.num_chapters_read = currentChapter + 1;
      if (mdId) {
        const volume = await this.mangadex.getVolume(mdId, currentChapter + 1);
        if (volume?.last) {
          data.num_volumes_read = Math.max(volume.volume, currentVolume);
        }
      }
    }
    if (
      type === 'volume' &&
      this.manga.num_chapters &&
      this.manga.num_volumes &&
      !data.num_chapters_read
    ) {
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
      const { DateTime } = require('luxon') as typeof import('luxon');
      data.finish_date = DateTime.local().toISODate() || undefined;
      data.is_rereading = false;
      if (this.manga.my_list_status.is_rereading) {
        data.num_times_reread = this.manga.my_list_status.num_times_reread + 1 || 1;
      }
      if (this.manga.num_chapters) data.num_chapters_read = this.manga.num_chapters;
      if (this.manga.num_volumes) data.num_volumes_read = this.manga.num_volumes;
      if (!this.manga.my_list_status?.score) {
        const myScore = await this.dialogue.rating(this.manga.title);
        if (myScore > 0 && myScore <= 10) data.score = myScore;
      }
    }
    const statusResponse = await this.mangaService.updateManga(
      {
        malId: this.manga.id,
        anilistId: this.manga.my_extension?.anilistId,
        kitsuId: this.manga.my_extension?.kitsuId,
        bakaId: this.manga.my_extension?.bakaId,
      },
      data,
    );
    this.manga.my_list_status.num_chapters_read = statusResponse.num_chapters_read;
    this.manga.my_list_status.num_volumes_read = statusResponse.num_volumes_read;
    this.manga.my_list_status.status = statusResponse.status;
    this.manga.my_list_status.score = statusResponse.score;
    this.manga.my_list_status.num_times_reread = statusResponse.num_times_reread;
    this.manga.my_list_status.is_rereading = statusResponse.is_rereading;
    this.manga.my_list_status.updated_at = statusResponse.updated_at;
    this.manga.my_list_status.start_date = statusResponse.start_date;
    this.manga.my_list_status.finish_date = statusResponse.finish_date;
    this.glob.notbusy();
  }

  async deleteEntry(): Promise<boolean> {
    if (!this.manga) return false;
    if (
      !(await this.dialogue.confirm(
        `Are you sure you want to delete "${this.manga.title}"?`,
        'Remove Entry',
      ))
    ) {
      return false;
    }
    this.glob.busy();
    this.busy = true;
    await this.mangaService.deleteManga({
      malId: this.manga.id,
      anilistId: this.manga.my_extension?.anilistId,
      kitsuId: this.manga.my_extension?.kitsuId,
    });
    this.edit = false;
    await this.ngOnInit();
    this.glob.notbusy();
    this.busy = false;
    return true;
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
    if (!this.getRating('shikimori')) {
      this.shikimori.getRating(this.id, 'manga').then(rating => {
        this.setRating('shikimori', rating);
      });
    }
    if (!this.getRating('bu')) {
      this.mangaService.getBakaManga(this.manga?.my_extension?.bakaId).then(bakaManga => {
        if (bakaManga) {
          this.setRating('bu', {
            nom: bakaManga.score || 0,
            norm: (bakaManga.score || 0) * 10,
            ratings: bakaManga.votes,
          });
        }
      });
    }
    if (!this.getRating('md')) {
      const mdId = this.manga?.my_extension?.mdId;
      this.mangadex.getMangaRating(mdId).then(statistics => {
        if (!statistics || !mdId) return;
        if (mdId in statistics) {
          const rating = statistics[mdId];
          const distribution = rating.rating.distribution;
          const ratings =
            distribution[1] +
            distribution[2] +
            distribution[3] +
            distribution[4] +
            distribution[5] +
            distribution[6] +
            distribution[7] +
            distribution[8] +
            distribution[9] +
            distribution[10];
          this.setRating('md', {
            nom: rating.rating.bayesian,
            norm: rating.rating.bayesian * 10,
            ratings,
          });
        }
      });
    }
    if (!this.getRating('anisearch')) {
      this.anisearch.getRating(this.manga?.my_extension?.anisearchId, 'manga').then(rating => {
        this.setRating('anisearch', rating);
      });
    }
    if (!this.getRating('ann')) {
      this.ann.getRating(this.manga?.my_extension?.annId, 'manga').then(rating => {
        this.setRating('ann', rating);
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

  changeShelf() {
    const hideShelf = !this.editExtension?.hideShelf;
    if (!this.editExtension) this.editExtension = { hideShelf };
    this.editExtension.hideShelf = hideShelf;
  }

  async findKitsu() {
    if (!this.manga || !this.editExtension) return;
    const modal = this.modalService.open(KitsuComponent);
    modal.componentInstance.type = 'manga';
    modal.componentInstance.title = this.manga.title;
    modal.closed.subscribe((value: number) => {
      if (this.editExtension) this.editExtension.kitsuId = { kitsuId: Number(value) };
    });
  }

  /** @deprecated doesn't work anymore */
  async findAnisearch() {
    return;
    // if (!this.manga || !this.editExtension) return;
    // const modal = this.modalService.open(AnisearchComponent);
    // modal.componentInstance.title = this.manga.title;
    // modal.componentInstance.type = 'manga';
    // modal.closed.subscribe((value: number) => {
    //   if (this.editExtension) this.editExtension.anisearchId = Number(value);
    // });
  }

  async findBaka() {
    if (!this.manga || !this.editExtension) return;
    const modal = this.modalService.open(BakamangaComponent);
    modal.componentInstance.title = this.manga.title;
    modal.closed.subscribe((value: string) => {
      if (this.editExtension) this.editExtension.bakaId = value;
    });
  }

  async findANN() {
    if (!this.manga || !this.editExtension) return;
    const modal = this.modalService.open(AnnComponent);
    modal.componentInstance.title = this.manga.title;
    modal.componentInstance.title =
      this.manga.alternative_titles?.en?.replace(/^The /, '') || this.manga.title;
    modal.componentInstance.type = 'manga';
    modal.closed.subscribe((value: number) => {
      if (this.editExtension) this.editExtension.annId = Number(value);
    });
  }

  getBakaUrl() {
    if (!this.manga?.my_extension?.bakaId) {
      return `https://www.mangaupdates.com/series.html?search=${this.manga?.title}`;
    }
    if (String(Number(this.manga.my_extension.bakaId)) === String(this.manga.my_extension.bakaId)) {
      return `https://www.mangaupdates.com/series.html?id=${this.manga.my_extension.bakaId}`;
    }
    return `https://www.mangaupdates.com/series/${this.manga.my_extension.bakaId}/details`;
  }

  getMdUrl() {
    if (!this.manga?.my_extension?.mdId) {
      return `https://mangadex.org/search?q=${this.manga?.title}`;
    }
    return `https://mangadex.org/title/${this.manga.my_extension.mdId}`;
  }

  getDay(simulpub?: Weekday[]): string {
    if (!simulpub) return '';
    return simulpub
      .map(day => {
        const { DateTime } = require('luxon') as typeof import('luxon');
        const date = DateTime.local().set({ weekday: this.glob.toWeekday(day) });
        return date.weekdayLong;
      })
      .join(', ');
  }
}
