import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AnnService } from '@services/ann.service';

import { ExternalComponent, Node } from '../external.component';

@Component({
  selector: 'myanili-ann',
  templateUrl: '../external.component.html',
  standalone: false,
})
export class AnnComponent extends ExternalComponent {
  type: 'anime' | 'manga' = 'anime';
  constructor(
    public modal: NgbActiveModal,
    private ann: AnnService,
  ) {
    super(modal);
  }

  async ngOnInit() {
    if (!this.title) return;
    this.nodes = [];
    this.searching = true;
    const data = await this.ann.getEntries(this.title);
    if ('warning' in data.ann) {
      this.nodes = [];
      this.searching = false;
      return;
    }
    this.nodes =
      data.ann[this.type].map(media => {
        const entry = {
          title: media._attributes.name,
          id: media._attributes.id,
          url: `https://www.animenewsnetwork.com/encyclopedia/${this.type}.php?id=${media._attributes.id}`,
          // genres: manga.genres?.map(genre => genre.genre),
        } as Node;
        const posterData = media.info.find(
          info => info._attributes.type === 'Picture',
        )?._attributes;
        if (posterData?.type === 'Picture') {
          entry.poster = posterData.src;
        }
        const plotData = media.info.find(info => info._attributes.type === 'Plot Summary');
        if (plotData && '_text' in plotData) {
          entry.description = plotData._text;
        }
        const yearData = media.info.find(info => info._attributes.type === 'Vintage');
        if (yearData && '_text' in yearData) {
          const year = yearData._text.match(/\d{4}/);
          if (year) {
            entry.year = Number(year[0]);
          }
        }
        return entry;
      }) || [];
    this.searching = false;
  }
}
