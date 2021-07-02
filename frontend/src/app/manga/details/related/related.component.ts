import { Component, Input } from '@angular/core';
import { RelatedMedia } from '@models/media';

@Component({
  selector: 'app-manga-related',
  templateUrl: './related.component.html',
  styleUrls: ['./related.component.scss'],
})
export class MangaRelatedComponent {
  @Input() related_manga: RelatedMedia[] = [];
  getRelatedMangas() {
    if (!this.related_manga?.length) return [];
    const types = this.related_manga
      .map(an => an.relation_type_formatted)
      .filter((value, index, self) => self.indexOf(value) === index);
    const relatedManga = [];
    for (const type of types) {
      const related = this.related_manga
        .filter(value => value.relation_type_formatted === type)
        .map(an => an.node);
      relatedManga.push({ name: type, entries: related });
    }
    return relatedManga;
  }
}
