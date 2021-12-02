import { AfterViewInit, Component, Input, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Anime } from '@models/anime';
import { Manga } from '@models/manga';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AnimeDetailsComponent } from '../anime/details/details.component';
import { GlobalService } from '../global.service';
import { MalService } from '../mal.service';
import { MangaDetailsComponent } from '../manga/details/details.component';
import { Language, SettingsService } from '../settings/settings.service';

@Component({
  selector: 'app-mal',
  templateUrl: './mal.component.html',
  styleUrls: ['./mal.component.scss'],
})
export class MalComponent implements AfterViewInit {
  @Input() type: 'anime' | 'manga' = 'anime';
  lang: Language = 'default';
  results: Array<Anime | Manga> = [];
  resultsFiltered: Array<Anime | Manga> = [];
  query = '';
  // tslint:disable-next-line:no-any
  @ViewChildren('searchbar') sb: any;
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

  constructor(
    private malService: MalService,
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
    this.glob.notbusy();
  }

  ngAfterViewInit() {
    this.sb.first.nativeElement.focus();
  }

  async search() {
    if (!this.query) {
      this.sb.first.nativeElement.focus();
      return;
    }
    this.sb.first.nativeElement.blur();
    this.glob.busy();
    this.glob.setTitle(`Search: ${this.query}`);
    this.results = (
      await this.malService.get<Array<{ node: Anime | Manga }>>(this.type + 's?query=' + this.query)
    ).map(result => result.node);
    this.allFilters.type = [...new Set(this.results.map(result => result.media_type))].sort();
    this.allFilters.status = [...new Set(this.results.map(result => result.status))].sort();
    const genres = this.results.map(result => result.genres?.map(g => g.name) || []);
    this.allFilters.genre = [...new Set(genres.reduce((acc, cur) => acc.concat(cur), []))].sort();
    this.filterResults();
    console.log(this.allFilters);
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
}
