import { Component, Input, OnInit } from '@angular/core';
import { RelatedAnime } from '@models/anime';

import { AnimeService } from '../../anime.service';

@Component({
  selector: 'myanili-anime-related',
  templateUrl: './related.component.html',
})
export class AnimeRelatedComponent implements OnInit {
  @Input() related_anime: RelatedAnime[] = [];

  @Input() has_covers = true;

  constructor(private anime: AnimeService) {}

  ngOnInit() {
    if (!this.has_covers) {
      this.related_anime.forEach(async anime => {
        anime.node.main_picture = {
          medium: (await this.anime.getPoster(anime.node.id)) || '',
        };
      });
    }
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
        .map(an => an.node);
      relatedAnime.push({ name: type, entries: related });
    }
    return relatedAnime;
  }
}
