import { Component } from '@angular/core';
import { GlobalService } from '@services/global.service';

@Component({
  selector: 'myanili-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss'],
  standalone: false,
})
export class ChangelogComponent {
  showall = false;
  limit = 5;

  constructor(private glob: GlobalService) {}

  get changes() {
    return this.showall ? this.changelog.changes : this.changelog.changes.slice(0, this.limit);
  }

  get changelog() {
    return this.glob.changelog;
  }
}
