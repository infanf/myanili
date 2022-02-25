import { Component, Input, OnInit } from '@angular/core';
import { RelatedManga } from '@models/manga';

import { MangaService } from '../../manga.service';

@Component({
  selector: 'myanili-manga-related',
  templateUrl: './related.component.html',
})
export class MangaRelatedComponent implements OnInit {
  @Input() related_manga: RelatedManga[] = [];
  @Input() has_covers = true;

  constructor(private manga: MangaService) {}

  ngOnInit() {
    if (!this.has_covers) {
      this.related_manga.forEach(async manga => {
        manga.node.main_picture = {
          medium: (await this.manga.getPoster(manga.node.id)) || '',
        };
      });
    }
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
        .map(an => an.node);
      relatedManga.push({ name: type, entries: related });
    }
    return relatedManga;
  }
}
