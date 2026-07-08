import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { MangaNode, RelatedManga } from '@models/manga';
import { MangaService } from '@services/manga/manga.service';

interface RelatedMangaGroup {
  name: string;
  entries: MangaNode[];
}

@Component({
  selector: 'myanili-manga-related',
  templateUrl: './manga.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class MangaRelatedComponent implements OnChanges {
  @Input() related_manga: RelatedManga[] = [];
  @Input() has_covers = true;
  relatedGroups: RelatedMangaGroup[] = [];
  private postersFetched = false;

  constructor(private manga: MangaService) {}

  ngOnChanges() {
    this.relatedGroups = this.buildGroups();
  }

  async getPoster(manga: RelatedManga) {
    const medium = (await this.manga.getPoster(manga.node.id)) || '';
    manga.node.main_picture = { medium };
  }

  private buildGroups(): RelatedMangaGroup[] {
    if (!this.related_manga?.length) return [];
    const fetchPosters = !this.has_covers && !this.postersFetched;
    const types = this.related_manga
      .map(an => an.relation_type_formatted)
      .filter((value, index, self) => self.indexOf(value) === index);
    const groups: RelatedMangaGroup[] = [];
    for (const type of types) {
      const entries = this.related_manga
        .filter(value => value.relation_type_formatted === type)
        .map(m => {
          if (fetchPosters) this.getPoster(m);
          return m.node;
        });
      groups.push({ name: type, entries });
    }
    if (fetchPosters) this.postersFetched = true;
    return groups;
  }
}
