import { Component, Input } from '@angular/core';
import { Genre } from '@models/components';

@Component({
  selector: 'myanili-genres-badges',
  templateUrl: './genres-badges.component.html',
  standalone: false,
})
export class GenresBadgesComponent {
  @Input() genres: Genre[] = [];
}
