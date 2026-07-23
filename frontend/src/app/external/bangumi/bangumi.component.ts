import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BangumiService } from '@services/anime/bangumi.service';

import { ExternalComponent } from '../external.component';

@Component({
  selector: 'myanili-bangumi',
  templateUrl: '../external.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class BangumiComponent extends ExternalComponent {
  @Input() type: 'anime' | 'manga' = 'anime';

  constructor(
    public modal: NgbActiveModal,
    private bangumi: BangumiService,
  ) {
    super(modal);
  }

  async ngOnInit() {
    if (!this.title) return;
    this.nodes = [];
    this.searching = true;
    const subjects =
      this.type === 'anime'
        ? await this.bangumi.getAnimes(this.title)
        : await this.bangumi.getMangas(this.title);
    this.nodes = subjects.map(subject => ({
      title: subject.name_cn || subject.name,
      id: subject.id,
      year: subject.date ? new Date(subject.date).getFullYear() : undefined,
      url: `https://bgm.tv/subject/${subject.id}`,
      description: subject.summary,
      genres: subject.meta_tags || [],
      poster: subject.images?.common,
    }));
    this.searching = false;
  }
}
