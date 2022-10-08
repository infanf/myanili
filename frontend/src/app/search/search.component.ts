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

import { AnilistService } from '../anilist.service';
import { AnimeDetailsComponent } from '../anime/details/details.component';
import { GlobalService } from '../global.service';
import { KitsuService } from '../kitsu.service';
import { MalService } from '../mal.service';
import { MangaDetailsComponent } from '../manga/details/details.component';
import { Language, SettingsService } from '../settings/settings.service';

@Component({
  selector: 'myanili-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements AfterViewInit {
  @Input() type: 'anime' | 'manga' = 'anime';
  lang: Language = 'default';
  results: Array<Anime | Manga> = [];
  resultsFiltered: Array<Anime | Manga> = [];
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
  nsfw = true;

  constructor(
    private _router: Router,
    private malService: MalService,
    private kitsu: KitsuService,
    private anilist: AnilistService,
    private route: ActivatedRoute,
    private settings: SettingsService,
    private glob: GlobalService,
    private modal: NgbModal,
  ) {
    this.route.paramMap.subscribe(params => {
      this.type = params.get('type') === 'manga' ? 'manga' : 'anime';
      this.glob.setTitle(`Search ${this.type}`);
      this.results = [];
    });
    this.settings.language.subscribe(lang => (this.lang = lang));
    this.settings.nsfw.subscribe(nsfw => (this.nsfw = nsfw));
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
    this.results = (
      await this.malService.get<Array<{ node: Anime | Manga }>>(
        this.type + 's',
        new URLSearchParams({
          query: this.query,
          limit: '500',
        }),
      )
    )
      .filter(result =>
        this.nsfw ? true : !result.node.genres?.map(g => g.name).includes('Hentai'),
      )
      .map(result => result.node);
    this.allFilters.type = [...new Set(this.results.map(result => result.media_type))].sort();
    this.allFilters.status = [...new Set(this.results.map(result => result.status))].sort();
    const genres = this.results.map(result => result.genres?.map(g => g.name) || []);
    this.allFilters.genre = [...new Set(genres.reduce((acc, cur) => acc.concat(cur), []))].sort();
    this.filterResults();
    this.glob.notbusy();
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
      return true;
    });
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
    const malId = await this.kitsu.getExternalId(id, type, 'myanimelist');
    if (!malId) return;
    if (type === 'anime') {
      this._router.navigate(['anime', 'details', malId]);
    } else if (type === 'manga') {
      this._router.navigate(['manga', 'details', malId]);
    }
  }
}
