import { AfterViewInit, Component, Input, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Anime } from '@models/mal-anime';
import { Manga } from '@models/mal-manga';
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
  query = '';
  // tslint:disable-next-line:no-any
  @ViewChildren('searchbar') sb: any;

  constructor(
    private malService: MalService,
    private route: ActivatedRoute,
    private settings: SettingsService,
    private glob: GlobalService,
    private modal: NgbModal,
  ) {
    this.route.paramMap.subscribe(params => {
      this.type = params.get('type') === 'manga' ? 'manga' : 'anime';
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
    this.results = (
      await this.malService.get<Array<{ node: Anime | Manga }>>(this.type + 's?query=' + this.query)
    ).map(result => result.node);
    this.glob.notbusy();
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
