import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AnisearchService } from '../../anisearch.service';
import { ExternalComponent } from '../external.component';

@Component({
  selector: 'app-anisearch',
  templateUrl: '../external.component.html',
})
export class AnisearchComponent extends ExternalComponent {
  @Input() type: 'anime' | 'manga' = 'anime';

  constructor(public modal: NgbActiveModal, private anisearch: AnisearchService) {
    super(modal);
  }

  async ngOnInit() {
    this.nodes =
      this.type === 'anime'
        ? (await this.anisearch.getAnimes(this.title || '')).nodes.map(anime => ({
            title: anime.title,
            id: anime.id,
            year: Number(anime.year) || undefined,
            url: anime.link,
            genres: anime.genre?.split(',') || [],
            description: anime.description,
            poster: anime.image,
          }))
        : (await this.anisearch.getMangas(this.title || '')).nodes.map(manga => ({
            title: manga.title,
            id: manga.id,
            year: Number(manga.year) || undefined,
            url: manga.link,
            genres: manga.genre?.split(',') || [],
            description: manga.description,
            poster: manga.image,
          }));
  }
}
