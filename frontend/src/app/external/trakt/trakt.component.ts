import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { TraktService } from '../../anime/trakt.service';
import { ExternalComponent } from '../external.component';

@Component({
  selector: 'app-trakt',
  templateUrl: '../external.component.html',
})
export class TraktComponent extends ExternalComponent {
  @Input() isMovie = false;

  constructor(public modal: NgbActiveModal, private trakt: TraktService) {
    super(modal);
  }

  async ngOnInit() {
    if (this.title) {
      this.nodes = (
        this.isMovie
          ? await this.trakt.searchMovie(this.title)
          : await this.trakt.search(this.title)
      ).map(show => ({
        id: show.show.ids.slug || show.show.ids.trakt,
        title: show.show.title,
        description: show.show.overview,
        genres: show.show.genres,
        year: show.show.year,
        url: `https://trakt.tv/${this.isMovie ? 'movies' : 'shows'}/${
          show.show.ids.slug || show.show.ids.trakt
        }`,
      }));
    }
  }
}
