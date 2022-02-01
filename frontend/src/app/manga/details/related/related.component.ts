import { Component, Input, OnInit } from '@angular/core';
import { Manga, RelatedManga } from '@models/manga';
import { MalService } from 'src/app/mal.service';

@Component({
  selector: 'myanili-manga-related',
  templateUrl: './related.component.html',
})
export class MangaRelatedComponent implements OnInit {
  @Input() related_manga: RelatedManga[] = [];
  @Input() has_covers = true;

  constructor(private mal: MalService) {}

  ngOnInit() {
    if (!this.has_covers) {
      this.related_manga.forEach(async manga => {
        const response = await this.mal.get<Manga>(`manga/${manga.node.id}`);
        manga.node.main_picture = response.main_picture;
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
