import { Component, Input } from '@angular/core';
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
export class MalComponent {
  @Input() type: 'anime' | 'manga' = 'anime';
  lang: Language = 'default';
  results: Array<Anime | Manga> = [];
  query = '';

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

  async search() {
    if (!this.query) return;
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