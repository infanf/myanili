import { Component } from '@angular/core';
import { Changelog, GlobalService } from '@services/global.service';

@Component({
  selector: 'myanili-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss'],
})
export class ChangelogComponent {
  changelog!: Changelog;
  showall = false;
  limit = 5;

  constructor(private glob: GlobalService) {
    this.changelog = this.glob.changelog;
  }

  get changes() {
    return this.showall ? this.changelog.changes : this.changelog.changes.slice(0, this.limit);
  }
}
