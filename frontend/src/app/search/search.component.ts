import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewSettingsComponent } from '@components/view-settings/view-settings.component';
import { Anime } from '@models/anime';
import { ListLiveaction, platformName } from '@models/liveaction';
import { Manga } from '@models/manga';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnilistService } from '@services/anilist.service';
import { GlobalService } from '@services/global.service';
import { KitsuService } from '@services/kitsu.service';
import { LiveactionService } from '@services/liveaction/liveaction.service';
import { MalService } from '@services/mal.service';
import { SettingsService } from '@services/settings.service';

import { AnimeDetailsComponent } from '../anime/details/details.component';
import { LiveactionDetailsComponent } from '../liveaction/details/details.component';
import { MangaDetailsComponent } from '../manga/details/details.component';

type SearchType = 'anime' | 'manga' | 'liveaction';

@Component({
  selector: 'myanili-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SearchComponent implements AfterViewInit {
  @Input() type: SearchType = 'anime';
  results: Array<Anime | Manga> = [];
  nextResults: Array<Anime | Manga> = [];
  resultsFiltered: Array<Anime | Manga> = [];
  // Live action results come from Bangumi instead of MAL
  liveResults: ListLiveaction[] = [];
  nextLiveResults: ListLiveaction[] = [];
  liveResultsFiltered: ListLiveaction[] = [];
  private liveOffset = 0;
  private liveMore = false;
  loadedAll = false;
  loading = false;
  query = '';
  // tslint:disable-next-line:no-any
  @ViewChildren('searchbar') sb?: QueryList<ElementRef>;
  filter = {
    type: [],
    status: [],
    genre: [],
  } as { [key: string]: string[] };
  allFilters = {
    type: [],
    status: [],
    genre: [],
  } as { [key: string]: string[] };
  showFilters = false;
  private _nsfw = true;

  constructor(
    private _router: Router,
    private malService: MalService,
    private kitsu: KitsuService,
    private anilist: AnilistService,
    private route: ActivatedRoute,
    public settings: SettingsService,
    private glob: GlobalService,
    private modal: NgbModal,
    private liveaction: LiveactionService,
  ) {
    this.route.paramMap.subscribe(params => {
      const type = params.get('type');
      this.type = type === 'manga' || type === 'liveaction' ? type : 'anime';
      this.glob.setTitle(`Search ${this.type === 'liveaction' ? 'live action' : this.type}`);
      this.results = [];
      this.liveResults = [];
      this.liveResultsFiltered = [];
      if (params.get('query')) {
        this.query = params.get('query') || '';
        this.search();
      }
    });
    this.settings.nsfw$.asObservable().subscribe(nsfw => (this._nsfw = nsfw));
    this.glob.notbusy();
  }

  ngAfterViewInit() {
    this.sb?.first.nativeElement.focus();
  }

  openSettings() {
    const modalRef = this.modal.open(ViewSettingsComponent);
    modalRef.componentInstance.keys = ['language', 'nsfw'];
    modalRef.componentInstance.title = 'Search Settings';
  }

  async search() {
    if (!this.query) {
      this.sb?.first.nativeElement.focus();
      return;
    }
    this.sb?.first.nativeElement.blur();
    this.glob.busy();
    if (this.query.match(/myanimelist.net/)) {
      this.glob.notbusy();
      return this.addFromMal(this.query);
    }
    if (this.query.match(/anilist.co/)) {
      this.glob.notbusy();
      return this.addFromAnilist(this.query);
    }
    if (this.query.match(/kitsu.(io|app)/)) {
      this.glob.notbusy();
      return this.addFromKitsu(this.query);
    }
    if (this.type === 'liveaction' && this.query.match(/(bgm|bangumi)\.tv\/subject\/\d+/)) {
      this.glob.notbusy();
      return this.addFromBangumi(this.query);
    }
    this.glob.setTitle(`Search: ${this.query}`);
    if (this.type === 'liveaction') {
      this.liveResults = [];
      this.liveOffset = 0;
      await this.fetchLiveResults(50);
      this.loadMore();
      this.glob.notbusy();
      return;
    }
    this.nextResults = (
      await this.malService.get<Array<{ node: Anime | Manga }>>(
        this.type + 's',
        new URLSearchParams({
          query: this.query,
          limit: '50',
          offset: '0',
        }),
      )
    ).map(result => result.node);
    this.results = [];
    this.loadMore();
    this.glob.notbusy();
  }

  async handleScroll(event: { target: Element; visible: boolean }) {
    if (!event.visible) return;
    let maxTries = 50;
    while (this.loading && maxTries-- > 0) {
      await this.glob.sleep(100);
    }
    this.loadMore();
  }

  async loadMore() {
    if (this.type === 'liveaction') return this.loadMoreLive();
    if (this.nextResults.length < 20) this.loadedAll = true;
    this.results.push(...this.nextResults);
    this.allFilters.type = [...new Set(this.results.map(result => result.media_type))].sort();
    this.allFilters.status = [...new Set(this.results.map(result => result.status))].sort();
    const genres = this.results.map(result => result.genres?.map(g => g.name) || []);
    this.allFilters.genre = [...new Set(genres.reduce((acc, cur) => acc.concat(cur), []))].sort();
    this.nextResults = [];
    this.filterResults();
    if (this.loadedAll || this.loading) return;
    this.loading = true;
    this.nextResults = (
      await this.malService.get<Array<{ node: Anime | Manga }>>(
        this.type + 's',
        new URLSearchParams({
          query: this.query,
          limit: '20',
          offset: String(this.results.length),
        }),
      )
    ).map(result => result.node);
    this.loading = false;
  }

  private async fetchLiveResults(limit: number) {
    const query = this.query;
    const { results, more } = await this.liveaction.search(query, limit, this.liveOffset);
    if (query !== this.query) return;
    this.liveOffset += limit;
    this.liveMore = more;
    this.nextLiveResults = results;
  }

  private async loadMoreLive() {
    this.loadedAll = !this.liveMore;
    this.liveResults.push(...this.nextLiveResults);
    this.nextLiveResults = [];
    this.allFilters.type = [
      ...new Set(this.liveResults.map(result => this.liveType(result))),
    ].sort();
    this.allFilters.status = [];
    const genres = this.liveResults.map(result => result.meta?.genres || []);
    this.allFilters.genre = [...new Set(genres.reduce((acc, cur) => acc.concat(cur), []))].sort();
    this.filterResults();
    if (this.loadedAll || this.loading) return;
    this.loading = true;
    await this.fetchLiveResults(20);
    this.loading = false;
  }

  liveType(result: ListLiveaction): string {
    return platformName(result.subject);
  }

  /**
   * English title from TMDB if already cached (search never resolves it);
   * the native title is the Bangumi subject name
   */
  liveTitle(result: ListLiveaction): string {
    return result.meta?.title || result.subject.name;
  }

  filterResults() {
    if (this.type === 'liveaction') {
      this.liveResultsFiltered = this.liveResults.filter(result => {
        if (this.filter.type.length > 0 && !this.filter.type.includes(this.liveType(result))) {
          return false;
        }
        const genres = result.meta?.genres || [];
        return this.filter.genre.every(genre => genres.includes(genre));
      });
      if (this.liveResultsFiltered.length < 20 && !this.loadedAll && !this.loading) {
        this.loadMore();
      }
      return;
    }
    this.resultsFiltered = this.results.filter(result => {
      if (this.filter.type.length > 0 && !this.filter.type.includes(result.media_type)) {
        return false;
      }
      if (this.filter.status.length > 0 && !this.filter.status.includes(result.status)) {
        return false;
      }
      if (this.filter.genre.length > 0) {
        for (const genre of this.filter.genre) {
          if (!result.genres.map(g => g.name).includes(genre)) {
            return false;
          }
        }
      }
      return this._nsfw ? true : !result.genres?.map(g => g.name).includes('Hentai');
    });
    if (this.resultsFiltered.length < 20) this.loadMore();
  }

  open(id: number) {
    const modalRef = this.modal.open(
      this.type === 'liveaction'
        ? LiveactionDetailsComponent
        : this.type === 'manga'
          ? MangaDetailsComponent
          : AnimeDetailsComponent,
      { windowClass: 'mal' },
    );
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.inModal = true;
  }

  async addFromMal(url: string) {
    const regex = /myanimelist.net\/([a-z]+)\/(\d+)/;
    const result = regex.exec(url);
    if (result?.length !== 3) return;
    const [all, type, idStr] = result;
    const id = Number(idStr);
    if (!all || !id) return;
    if (type === 'anime') {
      this._router.navigate(['anime', 'details', id]);
    } else if (type === 'manga') {
      this._router.navigate(['manga', 'details', id]);
    }
  }

  async addFromAnilist(url: string) {
    const regex = /anilist.co\/([a-z]+)\/(\d+)/;
    const result = regex.exec(url);
    if (result?.length !== 3) return;
    const [all, type, idStr] = result;
    const id = Number(idStr);
    if (!all || !id) return;
    if (type === 'anime') {
      const malId = await this.anilist.getMalId(id, 'ANIME');
      if (!malId) return;
      this._router.navigate(['anime', 'details', malId]);
    } else if (type === 'manga') {
      const malId = await this.anilist.getMalId(id, 'MANGA');
      if (!malId) return;
      this._router.navigate(['manga', 'details', malId]);
    }
  }

  async addFromBangumi(url: string) {
    const id = Number(/(bgm|bangumi)\.tv\/subject\/(\d+)/.exec(url)?.[2]);
    if (!id) return;
    this._router.navigate(['liveaction', 'details', id]);
  }

  async addFromKitsu(url: string) {
    const regex = /kitsu.(io|app)\/([a-z]+)\/(\d+|[\w\-]+)/;
    const result = regex.exec(url);
    if (result?.length !== 4) return;
    const [all, tld, type, idStr] = result;
    if (tld === 'io') {
      console.warn('Kitsu.io is deprecated, please use Kitsu.app instead');
    }
    if (!all || !idStr || (type !== 'anime' && type !== 'manga')) return;
    let id;
    if (!idStr.match(/^\d+$/)) {
      id = await this.kitsu.getIdFromSlug(idStr, type);
    } else {
      id = Number(idStr);
    }
    if (!id) return;
    const malId = await this.kitsu.getExternalId(id, type, `myanimelist/${type}`);
    if (!malId) return;
    if (type === 'anime') {
      this._router.navigate(['anime', 'details', malId]);
    } else if (type === 'manga') {
      this._router.navigate(['manga', 'details', malId]);
    }
  }
}
