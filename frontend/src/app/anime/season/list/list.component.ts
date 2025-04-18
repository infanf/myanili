import { Component, Input } from '@angular/core';
import { Anime } from '@models/anime';

import { SeasonComponent } from '../season.component';

@Component({
  selector: 'myanili-anime-season-list',
  templateUrl: './list.component.html',
  standalone: false,
})
export class SeasonListComponent extends SeasonComponent {
  @Input() animes: Array<Partial<Anime>> = [];

  ngOnInit(): void {}
}
