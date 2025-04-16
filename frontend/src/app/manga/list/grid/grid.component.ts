import { Component, Input } from '@angular/core';
import { ListManga, MangaNode } from '@models/manga';
import { SettingsService } from '@services/settings.service';

@Component({
  selector: 'myanili-manga-grid',
  templateUrl: './grid.component.html',
  standalone: false,
})
export class MangaListGridComponent {
  @Input() mangas: ListManga[] = [];

  constructor(public settings: SettingsService) {}

  getAuthor(manga: MangaNode): string[] {
    return (
      manga.authors?.map(
        author => `${author.node.last_name} ${author.node.first_name} (${author.role})`,
      ) || []
    );
  }
}
