import { Component, Input } from '@angular/core';
import { ListAnime, WatchStatus } from '@models/anime';
import { SettingsService } from '@services/settings.service';

@Component({
  selector: 'myanili-anime-grid',
  templateUrl: './grid.component.html',
})
export class AnimeListGridComponent {
  @Input() animes: ListAnime[] = [];

  constructor(public settings: SettingsService) {}

  getStatus(anime: ListAnime): WatchStatus | undefined {
    return anime.list_status.is_rewatching ? 'watching' : anime.list_status.status;
  }
}
