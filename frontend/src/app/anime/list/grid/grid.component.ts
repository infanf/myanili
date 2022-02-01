import { Component, Input } from '@angular/core';
import { ListAnime } from '@models/anime';
import { SettingsService } from 'src/app/settings/settings.service';

@Component({
  selector: 'myanili-anime-grid',
  templateUrl: './grid.component.html',
})
export class AnimeListGridComponent {
  @Input() animes: ListAnime[] = [];

  lang = 'en';

  constructor(private settings: SettingsService) {
    this.settings.language.subscribe(lang => (this.lang = lang));
  }
}
