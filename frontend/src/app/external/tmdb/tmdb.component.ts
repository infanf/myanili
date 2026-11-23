import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LiveactionService } from '@services/liveaction/liveaction.service';

import { ExternalComponent } from '../external.component';

@Component({
  selector: 'myanili-tmdb',
  templateUrl: '../external.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TmdbComponent extends ExternalComponent {
  @Input() type: 'movie' | 'tv' = 'tv';

  constructor(
    public modal: NgbActiveModal,
    private liveaction: LiveactionService,
  ) {
    super(modal);
  }

  async ngOnInit() {
    this.nodes = [];
    if (!this.title) return;
    this.searching = true;
    const results = await this.liveaction.searchTmdb(this.type, this.title);
    this.nodes = results.map(result => ({
      id: result.tmdb,
      title:
        result.title && result.originalTitle && result.title !== result.originalTitle
          ? `${result.title} (${result.originalTitle})`
          : result.title || result.originalTitle || '',
      year: result.year || undefined,
      poster: result.poster || undefined,
      description: result.overview || undefined,
      url: `https://www.themoviedb.org/${this.type}/${result.tmdb}`,
    }));
    this.searching = false;
  }
}
