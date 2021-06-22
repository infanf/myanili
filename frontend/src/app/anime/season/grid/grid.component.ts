import { Component, Input } from '@angular/core';
import { Media } from '@models/media';

import { SeasonComponent } from '../season.component';

@Component({
  selector: 'app-anime-season-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class SeasonGridComponent extends SeasonComponent {
  @Input() animes: Array<Partial<Media>> = [];

  ngOnInit(): void {}

  classColor(anime?: Partial<Media>): string {
    switch (anime?.my_list_status?.status) {
      case 'completed':
        return 'bg-dark';
      case 'dropped':
        return 'bg-danger';
      case 'on_hold':
      case 'planning':
        return 'bg-warning';
      case 'current':
        return 'bg-success';
      default:
        return 'bg-primary';
    }
  }
}
