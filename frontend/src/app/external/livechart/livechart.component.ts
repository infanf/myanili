import { Component } from '@angular/core';
import { ExternalComponent } from '@external/external.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LivechartService } from '@services/anime/livechart.service';

@Component({
  selector: 'myanili-livechart',
  templateUrl: '../external.component.html',
})
export class LivechartComponent extends ExternalComponent {
  constructor(public modal: NgbActiveModal, private livechart: LivechartService) {
    super(modal);
  }

  async ngOnInit() {
    if (!this.title) return;
    this.nodes = [];
    this.searching = true;
    const animes = (await this.livechart.getAnimes(this.title)) || [];
    this.nodes =
      animes.map(anime => ({
        title: anime.romajiTitle,
        id: anime.databaseId,
        url: `https://www.livechart.me/anime/${anime.databaseId}`,
        year: anime.startDate?.value ? new Date(anime.startDate?.value).getFullYear() : undefined,
        description: anime.synopsis?.markdown,
        // poster: anime.poster?.url ? `${environment.backend}livechart/img?url=${encodeURIComponent(anime.poster.url)}` : undefined,
        genres: anime.tags?.filter(tag => !tag.hidden).map(tag => tag.name) || [],
      })) || [];
    this.searching = false;
  }
}