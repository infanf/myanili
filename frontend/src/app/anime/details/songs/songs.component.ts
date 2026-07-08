import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Anime } from '@models/anime';

@Component({
  selector: 'myanili-anime-songs',
  templateUrl: './songs.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AnimeSongsComponent {
  @Input() anime?: Anime;
  @Input() edit = false;
  constructor() {}
}
