import { Component } from '@angular/core';
import { ExternalComponent } from '@external/external.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AnimescheduleService } from '@services/anime/animeschedule.service';

@Component({
  selector: 'myanili-animeschedule',
  templateUrl: '../external.component.html',
  standalone: false,
})
export class AnimescheduleComponent extends ExternalComponent {
  constructor(
    public modal: NgbActiveModal,
    private animeschedule: AnimescheduleService,
  ) {
    super(modal);
  }

  async ngOnInit() {
    if (!this.title) return;
    this.nodes = [];
    this.searching = true;
    const animes = (await this.animeschedule.getAnimes(this.title)) || [];
    this.nodes = animes.map(anime => ({
      title: anime.title,
      id: anime.route,
      url: `https://animeschedule.net/anime/${anime.route}`,
      year: anime.year ?? (anime.premier ? new Date(anime.premier).getFullYear() : undefined),
      description: anime.description,
      genres: anime.genres?.map(genre => genre.name) || [],
    }));
    this.searching = false;
  }
}
