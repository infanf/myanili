import { Component, Input } from '@angular/core';
import { ListAnime } from '@models/anime';
import { SettingsService } from '@services/settings.service';

@Component({
  selector: 'myanili-anime-grid',
  templateUrl: './grid.component.html',
})
export class AnimeListGridComponent {
  @Input() animes: ListAnime[] = [];

  constructor(public settings: SettingsService) {}
}
