import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlatformPipe } from '@components/platform.pipe';
import { ExtRating, Weekday } from '@models/components';
import { Manga, MyMangaUpdateExtended, ReadStatus } from '@models/manga';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnilistService } from '@services/anilist.service';
import { AnisearchService } from '@services/anisearch.service';
import { AnnService } from '@services/ann.service';
import { CacheService } from '@services/cache.service';
import { DialogueService } from '@services/dialogue.service';
import { GlobalService } from '@services/global.service';
import { KitsuService } from '@services/kitsu.service';
import { MangaService } from '@services/manga/manga.service';
import { MangabakaService } from '@services/manga/mangabaka.service';
import { MangadexService } from '@services/manga/mangadex.service';
import { MangapassionService } from '@services/manga/mangapassion.service';
import { MangaupdatesService } from '@services/manga/mangaupdates.service';
import { ShikimoriService } from '@services/shikimori.service';
import { Base64 } from 'js-base64';
import { DateTime } from 'luxon';

import { MangaEditComponent } from './edit/manga-edit.component';

@Component({
  selector: 'myanili-manga-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  standalone: false,
})
export class MangaDetailsComponent implements OnInit {
  @Input() id = 0;
  @Input() inModal = false;
  manga?: Manga;
  title?: string;
  shortsyn = true;
  fromCache = false;
  busy = false;
  ratings: Array<{ provider: string; rating: ExtRating }> = [];
  activeTab = 1;
  originalLanguage = 'Japanese';
  animePlanetId?: number;

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
    private mangabaka: MangabakaService,
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
        this.anisearch.getId(this.id, 'manga').then(anisearchId => {
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
    if (!this.manga.my_extension.mangabakaId) {
      promises.push(
        (async () => {
          let mbSeries;

          // Try AniList ID mapping first
          if (this.manga?.my_extension?.anilistId) {
            try {
              const mbSerieses = await this.mangabaka.mapFromSource(
                'anilist',
                this.manga.my_extension.anilistId,
              );
              mbSeries = mbSerieses?.[0];
              if (mbSeries && this?.manga?.my_extension) {
                this.manga.my_extension.mangabakaId = mbSeries.id;
              }
            } catch (error) {
              console.log('MangaBaka AniList mapping failed:', error);
            }
          }

          // Fallback to MAL ID mapping
          if (!mbSeries && this.manga?.id) {
            try {
              const mbSerieses = await this.mangabaka.mapFromSource('my-anime-list', this.manga.id);
              mbSeries = mbSerieses?.[0];
              if (mbSeries && this?.manga?.my_extension) {
                this.manga.my_extension.mangabakaId = mbSeries.id;
              }
            } catch (error) {
              console.log('MangaBaka MAL mapping failed:', error);
            }
          }

          // Extract additional IDs from MangaBaka source data
          if (mbSeries && this?.manga?.my_extension) {
            // Anime News Network ID (provides fallback/enhancement to direct ANN lookup)
            if (!this.manga.my_extension.annId && mbSeries.source?.anime_news_network?.id) {
              this.manga.my_extension.annId = mbSeries.source.anime_news_network.id;
            }

            // Anime-Planet ID (temporary - not persisted, used for link display only)
            if (mbSeries.source?.anime_planet?.id) {
              // Store temporarily on component for link generation
              this.animePlanetId = mbSeries.source.anime_planet.id;
            }
          }
        })(),
      );
    }
    await Promise.all(promises);
    if (promises.length && manga.my_extension && manga.my_list_status) {
      await this.mangaService.updateManga(
        {
          malId: manga.id,
          kitsuId: this.manga.my_extension.kitsuId,
          anilistId: this.manga.my_extension.anilistId,
          anisearchId: this.manga.my_extension.anisearchId,
          bakaId: this.manga.my_extension.bakaId,
          mangabakaId: this.manga.my_extension.mangabakaId,
        },
        {
          status: manga.my_list_status.status || 'plan_to_read',
          is_rereading: manga.my_list_status.is_rereading,
          extension: Base64.encode(
            JSON.stringify({
              ...manga.my_extension,
              kitsuId: this.manga.my_extension.kitsuId,
              anilistId: this.manga.my_extension.anilistId,
              anisearchId: this.manga.my_extension.anisearchId,
              bakaId: this.manga.my_extension.bakaId,
              mangabakaId: this.manga.my_extension.mangabakaId,
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
      this.openEditModal();
    } else {
      this.setStatus('plan_to_read');
    }
  }

  async openEditModal() {
    if (!this.manga) return;

    const modal = this.modalService.open(MangaEditComponent, { size: 'xl' });
    modal.componentInstance.manga = this.manga;

    modal.closed.subscribe(async result => {
      if (result === 'deleted') {
        // Entry was deleted, reload component to handle missing data
        await this.ngOnInit();
      } else if (result) {
        // Reload component data after successful save
        await this.ngOnInit();
      }
    });
  }

  async setStatus(status: ReadStatus) {
    if (!this.manga) return;
    this.glob.busy();
    this.busy = true;
    const data = { status, is_rereading: false } as MyMangaUpdateExtended;
    if (status === 'reading' && !this.manga.my_list_status?.start_date) {
      data.start_date = DateTime.local().toISODate() || undefined;
    }
    await this.mangaService.updateManga(
      {
        malId: this.manga.id,
        anilistId: this.manga.my_extension?.anilistId,
        kitsuId: this.manga.my_extension?.kitsuId,
        anisearchId: this.manga.my_extension?.anisearchId,
        bakaId: this.manga.my_extension?.bakaId,
        mangabakaId: this.manga.my_extension?.mangabakaId,
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
        anisearchId: this.manga.my_extension?.anisearchId,
        bakaId: this.manga.my_extension?.bakaId,
        mangabakaId: this.manga.my_extension?.mangabakaId,
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
    await this.mangaService.updateManga(
      {
        malId: this.manga.id,
        anilistId: this.manga.my_extension?.anilistId,
        kitsuId: this.manga.my_extension?.kitsuId,
        anisearchId: this.manga.my_extension?.anisearchId,
        bakaId: this.manga.my_extension?.bakaId,
        mangabakaId: this.manga.my_extension?.mangabakaId,
      },
      {
        status: 'reading',
        is_rereading: false,
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
    const currentChapter = this.manga.my_list_status.num_chapters_read || 0;
    const currentVolume = this.manga.my_list_status.num_volumes_read || 0;
    const data = {
      status: this.manga.my_list_status.status,
      is_rereading: this.manga.my_list_status.is_rereading,
    } as MyMangaUpdateExtended;
    const mdId = this.manga.my_extension?.mdId;
    if (type === 'volume') {
      data.num_volumes_read = currentVolume + 1;
      if (mdId) {
        const chapters = await this.mangadex.getChapter(mdId, currentVolume + 1);
        if (chapters?.last) {
          data.num_chapters_read = Math.floor(Math.max(chapters.last, currentChapter));
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
        this.manga.my_list_status.num_chapters_read || 0,
        Math.floor(((currentVolume + 1) / this.manga.num_volumes) * this.manga.num_chapters),
      );
    }
    if (
      ((data.num_volumes_read || 0) > 0 && data.num_volumes_read === this.manga.num_volumes) ||
      ((data.num_chapters_read || 0) > 0 && data.num_chapters_read === this.manga.num_chapters)
    ) {
      data.status = 'completed';
      data.finish_date =
        this.manga.my_list_status.finish_date || DateTime.local().toISODate() || undefined;
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
        anisearchId: this.manga.my_extension?.anisearchId,
        bakaId: this.manga.my_extension?.bakaId,
        mangabakaId: this.manga.my_extension?.mangabakaId,
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
      anisearchId: this.manga.my_extension?.anisearchId,
      mangabakaId: this.manga.my_extension?.mangabakaId,
    });
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
    if (!this.getRating('mangabaka')) {
      const mangabakaId = this.manga?.my_extension?.mangabakaId;
      if (mangabakaId) {
        this.mangabaka.getSeries(mangabakaId).then(series => {
          if (series?.rating) {
            this.setRating('mangabaka', {
              nom: series.rating,
              norm: series.rating,
              unit: '%',
            });
          }
        });
      }
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
        const date = DateTime.local().set({ weekday: this.glob.toWeekday(day) });
        return date.weekdayLong;
      })
      .join(', ');
  }
}
