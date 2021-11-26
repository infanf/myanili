import { Component } from '@angular/core';
import { ExternalComponent } from '@external/external.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MangaService } from '../../manga/manga.service';

@Component({
  selector: 'app-bakamanga',
  templateUrl: '../external.component.html',
})
export class BakamangaComponent extends ExternalComponent {
  constructor(public modal: NgbActiveModal, private mangaService: MangaService) {
    super(modal);
  }

  async ngOnInit() {
    if (!this.title) return;
    const mangas = await this.mangaService.getBakaMangas(this.title);
    this.nodes =
      mangas?.mangas.map(manga => ({
        title: manga.title,
        id: manga.id,
        url: manga.link,
        year: manga.year,
      })) || [];
  }
}
