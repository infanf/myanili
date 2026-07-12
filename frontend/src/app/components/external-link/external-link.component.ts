import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ExtRating } from '@models/components';

/** Compact chip for a link to an external database: icon (projected), optional rating. */
@Component({
  selector: 'myanili-external-link',
  templateUrl: './external-link.component.html',
  styleUrls: ['./external-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ExternalLinkComponent {
  @Input() href!: string;
  @Input() label!: string;
  @Input() rating?: { provider: string; rating: ExtRating };
  @Input() muted = false;
}
