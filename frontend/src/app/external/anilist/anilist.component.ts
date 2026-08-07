import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ExternalComponent } from '@external/external.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AnilistService } from '@services/anilist.service';

@Component({
  selector: 'myanili-anilist',
  templateUrl: '../external.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AnilistComponent extends ExternalComponent {
  @Input() type: 'anime' | 'manga' = 'anime';

  constructor(
    public modal: NgbActiveModal,
    private anilist: AnilistService,
  ) {
    super(modal);
  }

  async ngOnInit() {
    if (!this.title) return;
    this.nodes = [];
    this.searching = true;
    const medias = await this.anilist.searchMedia(
      this.title,
      this.type === 'manga' ? 'MANGA' : 'ANIME',
    );
    this.nodes = medias.map(media => ({
      title: media.title,
      id: media.id,
      year: media.year,
      url: `https://anilist.co/${this.type}/${media.id}`,
      description: media.description,
      genres: [media.format, ...(media.genres || [])].filter(Boolean) as string[],
      poster: media.image,
    }));
    this.searching = false;
  }
}
