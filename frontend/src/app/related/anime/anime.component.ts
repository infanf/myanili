import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { AnimeNode, RelatedAnime } from '@models/anime';
import { AnimeService } from '@services/anime/anime.service';

interface RelatedAnimeGroup {
  name: string;
  entries: AnimeNode[];
}

@Component({
  selector: 'myanili-anime-related',
  templateUrl: './anime.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AnimeRelatedComponent implements OnChanges {
  @Input() related_anime: RelatedAnime[] = [];
  @Input() has_covers = true;
  relatedGroups: RelatedAnimeGroup[] = [];
  private postersFetched = false;

  constructor(private anime: AnimeService) {}

  ngOnChanges() {
    this.relatedGroups = this.buildGroups();
  }

  async getPoster(anime: RelatedAnime) {
    const medium = (await this.anime.getPoster(anime.node.id)) || '';
    anime.node.main_picture = { medium };
  }

  private buildGroups(): RelatedAnimeGroup[] {
    if (!this.related_anime?.length) return [];
    const fetchPosters = !this.has_covers && !this.postersFetched;
    const types = this.related_anime
      .map(an => an.relation_type_formatted)
      .filter((value, index, self) => self.indexOf(value) === index);
    const groups: RelatedAnimeGroup[] = [];
    for (const type of types) {
      const entries = this.related_anime
        .filter(value => value.relation_type_formatted === type)
        .map(a => {
          if (fetchPosters) this.getPoster(a);
          return a.node;
        });
      groups.push({ name: type, entries });
    }
    if (fetchPosters) this.postersFetched = true;
    return groups;
  }
}
