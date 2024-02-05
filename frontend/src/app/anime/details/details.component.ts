import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Button } from '@components/dialogue/dialogue.component';
import { StreamPipe } from '@components/stream.pipe';
import { AnnComponent } from '@external/ann/ann.component';
import { AnnictComponent } from '@external/annict/annict.component';
import { KitsuComponent } from '@external/kitsu/kitsu.component';
import { LivechartComponent } from '@external/livechart/livechart.component';
import { TraktComponent } from '@external/trakt/trakt.component';
import {
  Anime,
  AnimeEpisodeRule,
  AnimeExtension,
  daysToLocal,
  MyAnimeUpdate,
  parseExtension,
  WatchStatus,
} from '@models/anime';
import { ExtRating } from '@models/components';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnilistService } from '@services/anilist.service';
import { AnimePlanetService } from '@services/anime-planet.service';
import { AnidbService } from '@services/anime/anidb.service';
import { AnimeService } from '@services/anime/anime.service';
import { AnnictService } from '@services/anime/annict.service';
import { LegacyStream, LivechartService } from '@services/anime/livechart.service';
import { SimklService } from '@services/anime/simkl.service';
import { TraktService } from '@services/anime/trakt.service';
import { AnisearchService } from '@services/anisearch.service';
import { AnnService } from '@services/ann.service';
import { CacheService } from '@services/cache.service';
import { DialogueService } from '@services/dialogue.service';
import { GlobalService } from '@services/global.service';
import { KitsuService } from '@services/kitsu.service';
import { ShikimoriService } from '@services/shikimori.service';
import Timezone from 'timezone-enum';

@Component({
  selector: 'myanili-anime-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class AnimeDetailsComponent implements OnInit {
  @Input() id = 0;
  anime?: Anime;
  title?: string;
  imageCache?: string;
  edit = false;
  fromCache = false;
  busy = false;
  editBackup?: Partial<MyAnimeUpdate>;
  editExtension?: { simulcast: {} } & AnimeExtension;
  traktUser?: string;
  annictUser?: string;
  activeTab = 1;
  ratings: Array<{ provider: string; rating: ExtRating }> = [];
  @Input() inModal = false;
  streams: LegacyStream[] = [];
  originalLanguage = 'Japanese';

  constructor(
    private animeService: AnimeService,
    private route: ActivatedRoute,
    public streamPipe: StreamPipe,
    private glob: GlobalService,
    private trakt: TraktService,
    private modalService: NgbModal,
    private anilist: AnilistService,
    private kitsu: KitsuService,
    private shikimori: ShikimoriService,
    private simkl: SimklService,
    private annict: AnnictService,
    private anisearch: AnisearchService,
    private livechart: LivechartService,
    private ann: AnnService,
    private anidb: AnidbService,
    private ap: AnimePlanetService,
    private cache: CacheService,
    private dialogue: DialogueService,
  ) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.ratings = [];
        this.streams = [];
        this.id = newId;
        delete this.title;
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
    this.title = '';
    this.cache
      .getValues<Anime>(this.id, 'anime')
      .then(animeCached => {
        if (animeCached && !this.anime) {
          this.title = animeCached.title;
          this.anime = animeCached;
          this.glob.setTitle(animeCached.title);
          this.fromCache = true;
          this.glob.notbusy();
        }
      })
      .catch(() => {});
    const anime = await this.animeService.getAnime(this.id);

    if (anime.mean) {
      this.setRating('mal', {
        nom: anime.mean,
        norm: anime.mean * 10,
        ratings: anime.num_scoring_users,
      });
    }
    this.anime = { ...anime };
    this.fromCache = false;
    if (this.anime?.title) {
      this.glob.setTitle(this.anime.title);
    }
    if (!this.anime.my_extension) {
      this.anime.my_extension = {
        malId: anime.id,
        simulcast: {},
      };
    } else {
      this.anime.my_extension.malId = anime.id;
    }
    await this.checkExternalIds(anime);
    if (!this.anime.related_manga.length) {
      this.anime.related_manga_promise.then(relatedManga => {
        if (this.anime) this.anime.related_manga = relatedManga;
      });
    }
    if (!this.anime.website) {
      this.anime.website_promise?.then(website => {
        if (this.anime) this.anime.website = website;
      });
    }
    if (!this.streams.length) {
      this.initStreams();
    }
    this.glob.notbusy();
    await this.getRatings();
  }

  async getOriginalLanguage() {
    const anilistId = this.anime?.my_extension?.anilistId;
    if (!anilistId) {
      this.originalLanguage = 'Japanese';
      return;
    }
    this.anilist.getLang(anilistId).then(lang => {
      this.originalLanguage = lang || 'Japanese';
    });
  }

  async checkExternalIds(anime: Anime) {
    if (!this.anime || !this.anime.my_extension) return;
    const promises = [];
    if (!this.anime.my_extension.kitsuId?.kitsuId) {
      promises.push(
        this.kitsu
          .getId({ id: this.id, title: anime.title, year: anime.start_season?.year }, 'anime')
          .then(kitsuId => {
            if (kitsuId && this?.anime?.my_extension) {
              this.anime.my_extension.kitsuId = kitsuId;
            }
          }),
      );
    }
    if (!this.anime.my_extension.anilistId) {
      promises.push(
        this.anilist.getId(this.id, 'ANIME').then(anilistId => {
          if (anilistId && this?.anime?.my_extension) {
            this.anime.my_extension.anilistId = anilistId;
            this.getOriginalLanguage();
          }
        }),
      );
    } else {
      this.getOriginalLanguage();
    }
    if (!this.anime.my_extension.simklId) {
      promises.push(
        this.simkl.getId(this.id).then(simklId => {
          if (simklId && this?.anime?.my_extension) {
            this.anime.my_extension.simklId = simklId;
          }
        }),
      );
    }
    if (!this.anime.my_extension.annictId) {
      promises.push(
        this.annict.getId(this.id, anime.alternative_titles?.ja || anime.title).then(annictId => {
          if (annictId && this?.anime?.my_extension) {
            this.anime.my_extension.annictId = annictId;
          }
        }),
      );
    }
    /** @deprecated currently not working */
    // if (!this.anime.my_extension.anisearchId) {
    //   promises.push(
    //     this.anisearch
    //       .getId(this.anime.title, 'anime', {
    //         parts: this.anime.num_episodes,
    //         year: this.anime.start_season?.year,
    //       })
    //       .then(anisearchId => {
    //         if (anisearchId && this?.anime?.my_extension) {
    //           this.anime.my_extension.anisearchId = anisearchId;
    //         }
    //       }),
    //   );
    // }
    if (!this.anime.my_extension.livechartId) {
      const livechartPromise = new Promise(async resolve => {
        const livechartId = await this.livechart.getId(this.id, anime.title);
        if (livechartId && this?.anime?.my_extension) {
          this.anime.my_extension.livechartId = livechartId;
        }
        resolve(livechartId);
      });
      promises.push(livechartPromise);
    }
    if (!this.anime.my_extension.annId) {
      const annPromise = this.ann
        .getId(this.anime.alternative_titles?.en?.replace(/^The /, '') || this.anime.title)
        .then(annId => {
          if (annId && this?.anime?.my_extension) {
            this.anime.my_extension.annId = annId;
          }
        });
      promises.push(annPromise);
    }
    if (!this.anime.my_extension.trakt) {
      promises.push(
        this.animeService.getTraktData(this.id).then(traktData => {
          if (!traktData || !this?.anime?.my_extension) return;
          this.anime.my_extension.trakt ||= String(traktData.id);
          this.anime.my_extension.seasonNumber ||= traktData.season;
        }),
      );
    }
    await Promise.all(promises);
    if (!this.anime.my_extension.anidbId) {
      const anidbId = await this.anidb.getId({
        kitsuId: Number(this.anime.my_extension.kitsuId?.kitsuId),
        livechartId: this.anime.my_extension.livechartId,
      });
      if (anidbId && this?.anime?.my_extension) {
        this.anime.my_extension.anidbId = anidbId;
      }
    }
    if (!this.anime.my_extension.apSlug) {
      const apSlug = await this.ap.getSlug(this.anime.my_extension.livechartId);
      if (apSlug && this?.anime?.my_extension) {
        this.anime.my_extension.apSlug = apSlug;
      }
    }
    if (!this.anime.my_extension.anisearchId) {
      const anisearchId = await this.livechart.getAnisearchId(this.anime.my_extension.livechartId);
      if (anisearchId && this?.anime?.my_extension) {
        this.anime.my_extension.anisearchId = anisearchId;
      }
    }
    if (promises.length && anime.my_extension && anime.my_list_status?.status) {
      if ('series' in anime.my_extension) delete anime.my_extension.series;
      const { Base64 } = await import('js-base64');
      await this.animeService.updateAnime(
        {
          malId: anime.id,
          kitsuId: this.anime.my_extension.kitsuId,
          anilistId: this.anime.my_extension.anilistId,
          simklId: this.anime.my_extension.simklId,
          annictId: this.anime.my_extension.annictId,
        },
        {
          comments: Base64.encode(
            JSON.stringify({
              ...anime.my_extension,
              kitsuId: this.anime.my_extension.kitsuId,
              anilistId: this.anime.my_extension.anilistId,
              simklId: this.anime.my_extension.simklId,
              annictId: this.anime.my_extension.annictId,
              anisearchId: this.anime.my_extension.anisearchId,
              livechartId: this.anime.my_extension.livechartId,
              trakt: this.anime.my_extension.trakt,
              seasonNumber: this.anime.my_extension.seasonNumber,
            }),
          ),
        },
      );
    }
  }

  async initStreams() {
    if (!this.anime?.my_extension?.livechartId) return;
    this.streams = await this.livechart.getStreams(this.anime.my_extension.livechartId);
  }

  get streamsAvailable() {
    return this.streams.filter(stream => stream.availableInViewerRegion).length;
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
      start_date: this.anime.my_list_status.start_date,
      finish_date: this.anime.my_list_status.finish_date,
      tags: this.anime.my_list_status.tags?.join(','),
    };
    try {
      const extension = parseExtension(this.anime.my_list_status.comments);
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
        simulcast: {},
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
    const { Base64 } = await import('js-base64');
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
    if (this.editBackup.start_date !== this.anime.my_list_status.start_date) {
      updateData.start_date = this.editBackup?.start_date;
    }
    if (this.editBackup.finish_date !== this.anime.my_list_status.finish_date) {
      updateData.finish_date = this.editBackup?.finish_date;
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
        livechartId: this.anime.my_extension?.livechartId,
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
    await this.animeService.addAnime(this.anime);
    await this.ngOnInit();
    this.busy = false;
  }

  async setStatus(status: WatchStatus) {
    if (!this.anime) return;
    this.glob.busy();
    this.busy = true;
    const data = { status } as Partial<MyAnimeUpdate>;
    if (status === 'watching' && !this.anime.my_list_status?.start_date) {
      const { DateTime } = await import('luxon');
      data.start_date = DateTime.local().toISODate() || undefined;
    }
    await this.animeService.updateAnime(
      {
        malId: this.anime.id,
        anilistId: this.anime.my_extension?.anilistId,
        kitsuId: this.anime.my_extension?.kitsuId,
        simklId: this.anime.my_extension?.simklId,
        annictId: this.anime.my_extension?.annictId,
        livechartId: this.anime.my_extension?.livechartId,
      },
      data,
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
        livechartId: this.anime.my_extension?.livechartId,
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
    if (this.anime.my_extension) this.anime.my_extension.lastWatchedAt = new Date();
    let completed = false;
    if (currentEpisode + 1 === this.anime.num_episodes) {
      data.status = 'completed';
      const { DateTime } = await import('luxon');
      data.finish_date = DateTime.local().toISODate() || undefined;
      data.is_rewatching = false;
      if (this.anime.my_list_status.is_rewatching) {
        data.num_times_rewatched = this.anime.my_list_status.num_times_rewatched + 1 || 1;
      }
      completed = true;
      if (!this.anime.my_list_status?.score) {
        const myScore = await this.dialogue.rating(this.anime.title);
        if (myScore > 0 && myScore <= 10) data.score = myScore;
      }
    } else if (!data.is_rewatching && currentEpisode + 1 === this.anime.my_extension?.episodeRule) {
      const continueWatching = await this.dialogue.open(
        `You set yourself a ${this.anime.my_extension?.episodeRule} episode rule for "${this.anime.title}". Do you want to continue watching?`,
        'Continue Watching?',
        [
          { label: 'Ask again next ep.', value: AnimeEpisodeRule.ASK_AGAIN },
          { label: 'Drop', value: AnimeEpisodeRule.DROP },
          { label: 'Continue', value: AnimeEpisodeRule.CONTINUE },
        ],
        AnimeEpisodeRule.CONTINUE,
      );
      if (continueWatching === AnimeEpisodeRule.DROP) {
        data.status = 'dropped';
      }
      if (continueWatching === AnimeEpisodeRule.ASK_AGAIN) {
        this.anime.my_extension.episodeRule++;
      }
    }
    const { Base64 } = await import('js-base64');
    data.comments = Base64.encode(JSON.stringify(this.anime.my_extension));
    const [animeStatus] = await Promise.all([
      this.animeService.updateAnime(
        {
          malId: this.anime.id,
          anilistId: this.anime.my_extension?.anilistId,
          kitsuId: this.anime.my_extension?.kitsuId,
          simklId: this.anime.my_extension?.simklId,
          annictId: this.anime.my_extension?.annictId,
          livechartId: this.anime.my_extension?.livechartId,
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
          const startSequel = await this.dialogue.confirm(
            `Rewatch sequel "${sequel.title}"?`,
            'Rewatch sequel',
          );
          if (startSequel) {
            await this.animeService.updateAnime(
              { malId: sequel.id },
              { status: 'completed', is_rewatching: true, num_watched_episodes: 0 },
            );
          }
        } else {
          const futureShow =
            sequel.status !== 'finished_airing' && sequel.status !== 'currently_airing';
          const buttons = [
            { label: "Don't watch", value: false },
            { label: 'Add to my List', value: 'plan_to_watch' },
            { label: 'Start Watching now', value: 'watching' },
          ] as Array<Button<WatchStatus | false>>;
          if (futureShow) buttons.pop();
          const status = await this.dialogue.open<WatchStatus | false>(
            `Watch sequel "${sequel.title}"?`,
            'Watch sequel',
            buttons,
            false,
          );
          if (status) {
            const sequelData = { status } as Partial<MyAnimeUpdate>;
            if (status === 'watching') {
              const { DateTime } = await import('luxon');
              sequelData.start_date = DateTime.local().toISODate() || undefined;
            }
            await this.animeService.updateAnime({ malId: sequel.id }, sequelData);
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
    this.anime.my_list_status.start_date = animeStatus.start_date;
    this.anime.my_list_status.finish_date = animeStatus.finish_date;
    this.glob.notbusy();
  }

  async skip() {
    if (!this.anime || !this.anime.my_list_status) return;
    const reallySkip = await this.dialogue.confirm(`Skip ${this.anime.title} this week?`, 'Skip');
    if (!reallySkip) return;
    this.glob.busy();
    if (!this.anime.my_extension) {
      this.anime.my_extension = {
        simulcast: {},
      };
    }
    this.anime.my_extension.lastWatchedAt = new Date();
    const { Base64 } = await import('js-base64');
    const data = {
      comments: Base64.encode(JSON.stringify(this.anime.my_extension)),
    };
    await this.animeService.updateAnime(
      {
        malId: this.anime.id,
        anilistId: this.anime.my_extension?.anilistId,
        kitsuId: this.anime.my_extension?.kitsuId,
        simklId: this.anime.my_extension?.simklId,
        annictId: this.anime.my_extension?.annictId,
        livechartId: this.anime.my_extension?.livechartId,
      },
      data,
    );
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
              this.anime.my_extension.seasonNumber === 0
                ? 0
                : this.anime.my_extension.seasonNumber || 1,
              (this.anime.my_list_status?.num_episodes_watched || 0) +
                1 +
                (this.anime.my_extension.episodeCorOffset || 0),
            ),
      );
    });
  }

  async deleteEntry(): Promise<boolean> {
    if (!this.anime) return false;
    if (
      !(await this.dialogue.confirm(
        `Are you sure you want to delete "${this.anime.title}"?`,
        'Remove Entry',
      ))
    ) {
      return false;
    }
    this.glob.busy();
    this.busy = true;
    await this.animeService.deleteAnime({
      malId: this.anime.id,
      anilistId: this.anime.my_extension?.anilistId,
      kitsuId: this.anime.my_extension?.kitsuId,
      simklId: this.anime.my_extension?.simklId,
      annictId: this.anime.my_extension?.annictId,
      traktId: this.anime.my_extension?.trakt,
      livechartId: this.anime.my_extension?.livechartId,
    });
    this.edit = false;
    await this.ngOnInit();
    this.glob.notbusy();
    this.busy = false;
    return true;
  }

  changeWatchlist() {
    const hideWatchlist = !this.editExtension?.hideWatchlist;
    if (!this.editExtension) this.editExtension = { hideWatchlist, simulcast: {} };
    this.editExtension.hideWatchlist = hideWatchlist;
  }

  async findTrakt() {
    if (!this.anime || !this.editExtension) return;
    const modal = this.modalService.open(TraktComponent);
    modal.componentInstance.isMovie = this.anime.media_type === 'movie';
    modal.componentInstance.title = this.anime.title;
    modal.closed.subscribe(value => {
      if (this.editExtension) this.editExtension.trakt = String(value);
    });
  }

  async findKitsu() {
    if (!this.anime || !this.editExtension) return;
    const modal = this.modalService.open(KitsuComponent);
    modal.componentInstance.title = this.anime.title;
    modal.closed.subscribe(value => {
      if (this.editExtension) this.editExtension.kitsuId = { kitsuId: Number(value) };
    });
  }

  /** @deprecated doesn't work anymore */
  async findAnisearch() {
    return;
    // if (!this.anime || !this.editExtension) return;
    // const modal = this.modalService.open(AnisearchComponent);
    // modal.componentInstance.title = this.anime.title;
    // modal.closed.subscribe(value => {
    //   if (this.editExtension) this.editExtension.anisearchId = Number(value);
    // });
  }

  async findAnnict() {
    if (!this.anime || !this.editExtension) return;
    const modal = this.modalService.open(AnnictComponent);
    modal.componentInstance.title = this.anime.alternative_titles?.ja || this.anime.title;
    modal.closed.subscribe(value => {
      if (this.editExtension) this.editExtension.annictId = Number(value);
    });
  }

  async findLivechart() {
    if (!this.anime || !this.editExtension) return;
    const modal = this.modalService.open(LivechartComponent);
    modal.componentInstance.title = this.anime.title;
    modal.closed.subscribe(value => {
      if (this.editExtension) this.editExtension.livechartId = Number(value);
    });
  }

  async findANN() {
    if (!this.anime || !this.editExtension) return;
    const modal = this.modalService.open(AnnComponent);
    modal.componentInstance.title =
      this.anime.alternative_titles?.en?.replace(/^The /, '') || this.anime.title;
    modal.componentInstance.type = 'anime';
    modal.closed.subscribe(value => {
      if (this.editExtension) this.editExtension.annId = Number(value);
    });
  }

  getDay(simulcast: AnimeExtension['simulcast']): string {
    const day = daysToLocal(simulcast);
    const names = day.map(d => this.animeService.getDay(d));
    return names.join(', ');
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
    if (!this.getRating('shikimori')) {
      this.shikimori.getRating(this.id, 'anime').then(rating => {
        console.log(rating);
        this.setRating('shikimori', rating);
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
    if (!this.getRating('livechart')) {
      this.livechart.getRating(this.anime?.my_extension?.livechartId).then(rating => {
        this.setRating('livechart', rating);
      });
    }
    if (!this.getRating('ann')) {
      this.ann.getRating(this.anime?.my_extension?.annId).then(rating => {
        this.setRating('ann', rating);
      });
    }
    if (!this.getRating('anidb')) {
      this.anidb.getRating(this.anime?.my_extension?.anidbId).then(rating => {
        this.setRating('anidb', rating);
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

  get timezones() {
    return Object.values(Timezone);
  }
}
