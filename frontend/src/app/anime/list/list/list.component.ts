import { Component, Input } from '@angular/core';
import { ListMedia } from '@models/media';
import { SettingsService } from 'src/app/settings/settings.service';

@Component({
  selector: 'app-anime-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class AnimeListListComponent {
  @Input() animes: ListMedia[] = [];

  lang = 'en';

  constructor(private settings: SettingsService) {
    this.settings.language.subscribe(lang => (this.lang = lang));
  }
}
