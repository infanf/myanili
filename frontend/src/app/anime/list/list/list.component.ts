import { Component, Input } from '@angular/core';
import { ListAnime } from '@models/anime';
import { SettingsService } from '@services/settings.service';

@Component({
  selector: 'myanili-anime-list',
  templateUrl: './list.component.html',
})
export class AnimeListListComponent {
  @Input() animes: ListAnime[] = [];

  lang = 'en';

  constructor(private settings: SettingsService) {
    this.settings.language.subscribe(lang => (this.lang = lang));
  }
}
