import { Component, Input } from '@angular/core';
import { ListMedia } from '@models/media';
import { SettingsService } from 'src/app/settings/settings.service';

@Component({
  selector: 'app-anime-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class AnimeListGridComponent {
  @Input() animes: ListMedia[] = [];

  lang = 'en';

  constructor(private settings: SettingsService) {
    this.settings.language.subscribe(lang => (this.lang = lang));
  }
}
