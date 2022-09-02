import { Component } from '@angular/core';
import { ExternalComponent } from '@external/external.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MangaupdatesService } from 'src/app/manga/mangaupdates.service';

@Component({
  selector: 'myanili-bakamanga',
  templateUrl: '../external.component.html',
})
export class BakamangaComponent extends ExternalComponent {
  constructor(public modal: NgbActiveModal, private baka: MangaupdatesService) {
    super(modal);
  }

  async ngOnInit() {
    if (!this.title) return;
    this.nodes = [];
    this.searching = true;
    const mangas = (await this.baka.findSeries(this.title)) || [];
    this.nodes =
      mangas.map(manga => ({
        title: manga.title,
        id: manga.series_id,
        url: manga.url,
        year: manga.year,
        description: manga.description,
        poster: manga.image.url.original,
        genres: manga.genres?.map(genre => genre.genre),
      })) || [];
    this.searching = false;
  }
}
