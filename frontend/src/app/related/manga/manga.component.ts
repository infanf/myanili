import { Component, Input } from '@angular/core';
import { RelatedManga } from '@models/manga';
import { MangaService } from '@services/manga/manga.service';

@Component({
  selector: 'myanili-manga-related',
  templateUrl: './manga.component.html',
})
export class MangaRelatedComponent {
  @Input() related_manga: RelatedManga[] = [];
  @Input() has_covers = true;

  constructor(private manga: MangaService) {}

  async getPoster(manga: RelatedManga) {
    const medium = (await this.manga.getPoster(manga.node.id)) || '';
    manga.node.main_picture = { medium };
  }

  getRelatedMangas() {
    if (!this.related_manga?.length) return [];
    const types = this.related_manga
      .map(an => an.relation_type_formatted)
      .filter((value, index, self) => self.indexOf(value) === index);
    const relatedManga = [];
    for (const type of types) {
      const related = this.related_manga
        .filter(value => value.relation_type_formatted === type)
        .map(m => {
          if (!this.has_covers) this.getPoster(m);
          return m;
        })
        .map(an => an.node);
      relatedManga.push({ name: type, entries: related });
    }
    this.has_covers = true;
    return relatedManga;
  }
}
