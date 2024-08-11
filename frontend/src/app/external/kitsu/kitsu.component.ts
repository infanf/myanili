import { Component } from '@angular/core';
import { ExternalComponent } from '@external/external.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { KitsuService } from '@services/kitsu.service';

@Component({
  selector: 'myanili-kitsu',
  templateUrl: '../external.component.html',
})
export class KitsuComponent extends ExternalComponent {
  type: 'anime' | 'manga' = 'anime';

  constructor(public modal: NgbActiveModal, private kitsu: KitsuService) {
    super(modal);
  }

  async ngOnInit() {
    this.nodes = [];
    this.searching = true;
    if (this.title) {
      const data = await this.kitsu.getDataFromName(this.title, this.type);
      this.nodes = data.map(entry => ({
        id: entry.id,
        title: entry.attributes.canonicalTitle,
        url: `https://kitsu.app/${this.type}/${entry.id}`,
        poster: entry.attributes.posterImage?.original,
        description: entry.attributes.synopsis,
        year: new Date(entry.attributes.startDate).getFullYear(),
      }));
    }
    this.searching = false;
  }
}
