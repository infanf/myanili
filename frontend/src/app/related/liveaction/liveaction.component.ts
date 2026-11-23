import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { RelatedLiveaction } from '@models/liveaction';

/** Live action adaptations, loaded by the details page via LiveactionService */
@Component({
  selector: 'myanili-liveaction-related',
  templateUrl: './liveaction.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class LiveactionRelatedComponent {
  @Input() related_liveaction: RelatedLiveaction[] = [];

  constructor(private router: Router) {}

  open(entry: RelatedLiveaction) {
    if (entry.route) {
      this.router.navigateByUrl(entry.route);
    } else if (entry.link) {
      window.open(entry.link, '_blank');
    }
  }
}
