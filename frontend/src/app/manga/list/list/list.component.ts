import { Component, Input } from '@angular/core';
import { ListManga, MangaNode } from '@models/manga';
import { SettingsService } from 'src/app/settings/settings.service';

@Component({
  selector: 'myanili-manga-list',
  templateUrl: './list.component.html',
})
export class MangaListListComponent {
  @Input() mangas: ListManga[] = [];

  lang = 'en';

  constructor(private settings: SettingsService) {
    this.settings.language.subscribe(lang => (this.lang = lang));
  }

  getAuthor(manga: MangaNode): string[] {
    return (
      manga.authors?.map(
        author => `${author.node.last_name} ${author.node.first_name} (${author.role})`,
      ) || []
    );
  }
}