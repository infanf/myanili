import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Anime } from '@models/anime';
import { Manga } from '@models/manga';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnilistService } from '@services/anilist.service';
import { GlobalService } from '@services/global.service';
import { KitsuService } from '@services/kitsu.service';
import { MalService } from '@services/mal.service';
import { SettingsService } from '@services/settings.service';

import { AnimeDetailsComponent } from '../anime/details/details.component';
import { MangaDetailsComponent } from '../manga/details/details.component';

@Component({
  selector: 'myanili-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements AfterViewInit {
  @Input() type: 'anime' | 'manga' = 'anime';
  results: Array<Anime | Manga> = [];
  nextResults: Array<Anime | Manga> = [];
  resultsFiltered: Array<Anime | Manga> = [];
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
  ) {
    this.route.paramMap.subscribe(params => {
      this.type = params.get('type') === 'manga' ? 'manga' : 'anime';
      this.glob.setTitle(`Search ${this.type}`);
      this.results = [];
    });
    this.settings.nsfw$.asObservable().subscribe(nsfw => (this._nsfw = nsfw));
    this.glob.notbusy();
  }

  ngAfterViewInit() {
    this.sb?.first.nativeElement.focus();
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
    if (this.query.match(/kitsu.io/)) {
      this.glob.notbusy();
      return this.addFromKitsu(this.query);
    }
    this.glob.setTitle(`Search: ${this.query}`);
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

  filterResults() {
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
      this.type === 'manga' ? MangaDetailsComponent : AnimeDetailsComponent,
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

  async addFromKitsu(url: string) {
    const regex = /kitsu.io\/([a-z]+)\/(\d+|[\w\-]+)/;
    const result = regex.exec(url);
    if (result?.length !== 3) return;
    const [all, type, idStr] = result;
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
