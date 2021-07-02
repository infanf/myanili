import { Component, Input } from '@angular/core';
import { MainService } from '@models/components';
import { RelatedMedia } from '@models/media';
import { SettingsService } from 'src/app/settings/settings.service';

@Component({
  selector: 'app-anime-related',
  templateUrl: './related.component.html',
  styleUrls: ['./related.component.scss'],
})
export class AnimeRelatedComponent {
  @Input() related: RelatedMedia[] = [];
  service: MainService = 'mal';

  constructor(private settings: SettingsService) {
    this.settings.mainService.subscribe(service => {
      this.service = service;
    });
  }

  getRelatedMedia() {
    if (!this.related?.length) return [];
    const types = this.related
      .map(an => an.relation_type_formatted)
      .filter((value, index, self) => self.indexOf(value) === index);
    const relatedMedia = [];
    for (const type of types) {
      const related = this.related.filter(value => value.relation_type_formatted === type);
      relatedMedia.push({ name: type, entries: related });
    }
    return relatedMedia;
  }
}
