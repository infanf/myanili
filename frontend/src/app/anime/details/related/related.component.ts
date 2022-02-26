import { Component, Input } from '@angular/core';
import { RelatedAnime } from '@models/anime';

import { AnimeService } from '../../anime.service';

@Component({
  selector: 'myanili-anime-related',
  templateUrl: './related.component.html',
})
export class AnimeRelatedComponent {
  @Input() related_anime: RelatedAnime[] = [];

  @Input() has_covers = true;

  constructor(private anime: AnimeService) {}

  async getPoster(anime: RelatedAnime) {
    const medium = (await this.anime.getPoster(anime.node.id)) || '';
    anime.node.main_picture = { medium };
  }

  getRelatedAnimes() {
    if (!this.related_anime?.length) return [];
    const types = this.related_anime
      .map(an => an.relation_type_formatted)
      .filter((value, index, self) => self.indexOf(value) === index);
    const relatedAnime = [];
    for (const type of types) {
      const related = this.related_anime
        .filter(value => value.relation_type_formatted === type)
        .map(a => {
          if (!this.has_covers) this.getPoster(a);
          return a;
        })
        .map(an => an.node);
      relatedAnime.push({ name: type, entries: related });
    }
    this.has_covers = true;
    return relatedAnime;
  }
}
