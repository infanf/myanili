import { Component } from '@angular/core';
import { ExternalComponent } from '@external/external.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AnnictService } from '../../anime/annict.service';

@Component({
  selector: 'app-annict',
  templateUrl: '../external.component.html',
})
export class AnnictComponent extends ExternalComponent {
  constructor(public modal: NgbActiveModal, private annict: AnnictService) {
    super(modal);
  }

  async ngOnInit() {
    const results = await this.annict.search(this.title);
    this.nodes =
      results?.map(result => ({
        id: result.annictId,
        title: result.title,
        year: result.seasonYear,
        description: `${result.titleEn}`,
        genres: [],
        poster: result.image.recommendedImageUrl,
        url: `https://annict.com/works/${result.annictId}`,
      })) || [];
  }
}
