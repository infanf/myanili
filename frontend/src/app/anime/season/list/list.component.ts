import { Component, Input } from '@angular/core';
import { Media } from '@models/media';

import { SeasonComponent } from '../season.component';

@Component({
  selector: 'app-anime-season-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class SeasonListComponent extends SeasonComponent {
  @Input() animes: Array<Partial<Media>> = [];

  ngOnInit(): void {}
}
