import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TraktService } from '@services/anime/trakt.service';
import { environment } from 'src/environments/environment';

import { ExternalComponent } from '../external.component';

@Component({
  selector: 'myanili-trakt',
  templateUrl: '../external.component.html',
  standalone: false,
})
export class TraktComponent extends ExternalComponent {
  @Input() isMovie = false;

  constructor(
    public modal: NgbActiveModal,
    private trakt: TraktService,
  ) {
    super(modal);
  }

  async ngOnInit() {
    this.nodes = [];
    this.searching = true;
    if (this.title) {
      this.nodes = (
        this.isMovie
          ? await this.trakt.searchMovie(this.title)
          : await this.trakt.search(this.title)
      ).map(show => {
        const node = {
          id: show.show.ids.slug || show.show.ids.trakt,
          title: show.show.title,
          description: show.show.overview,
          genres: show.show.genres,
          year: show.show.year,
          poster: '',
          url: `https://trakt.tv/${this.isMovie ? 'movies' : 'shows'}/${
            show.show.ids.slug || show.show.ids.trakt
          }`,
        };
        if (show.show.ids.tmdb) {
          fetch(
            `${environment.backend}tmdb/poster/${this.isMovie ? 'movie' : 'tv'}/${
              show.show.ids.tmdb
            }`,
          )
            .then(res => res.json())
            .then(res => {
              if (res?.posters?.length) {
                node.poster = `https://image.tmdb.org/t/p/w500/${res.posters[0].file_path}`;
              }
            });
        }
        return node;
      });
    }
    this.searching = false;
  }
}
