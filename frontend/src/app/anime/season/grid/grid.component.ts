import { Component, Input } from '@angular/core';
import { Anime } from '@models/anime';

import { SeasonComponent } from '../season.component';

@Component({
  selector: 'myanili-anime-season-grid',
  templateUrl: './grid.component.html',
})
export class SeasonGridComponent extends SeasonComponent {
  @Input() animes: Array<Partial<Anime>> = [];

  initSubscriptions() {}
  ngOnInit(): void {}

  classColor(anime?: Partial<Anime>): string {
    switch (anime?.my_list_status?.status) {
      case 'completed':
        return 'bg-black';
      case 'dropped':
        return 'bg-danger';
      case 'on_hold':
      case 'plan_to_watch':
        return 'bg-warning';
      case 'watching':
        return 'bg-success';
      default:
        return 'bg-primary';
    }
  }
}
