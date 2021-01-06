import { Component, Input } from '@angular/core';
import { RelatedAnime } from '@models/anime';

@Component({
  selector: 'app-anime-related',
  templateUrl: './related.component.html',
  styleUrls: ['./related.component.scss'],
})
export class AnimeRelatedComponent {
  @Input() related_anime: RelatedAnime[] = [];
  getRelatedAnimes() {
    if (!this.related_anime?.length) return [];
    const types = this.related_anime
      .map(an => an.relation_type_formatted)
      .filter((value, index, self) => self.indexOf(value) === index);
    const relatedAnime = [];
    for (const type of types) {
      const related = this.related_anime
        .filter(value => value.relation_type_formatted === type)
        .map(an => an.node);
      relatedAnime.push({ name: type, entries: related });
    }
    return relatedAnime;
  }
}
