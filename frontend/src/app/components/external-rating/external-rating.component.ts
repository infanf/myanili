import { Component, Input } from '@angular/core';
import { ExtRating } from '@models/components';

@Component({
  selector: 'myanili-external-rating',
  templateUrl: './external-rating.component.html',
})
export class ExternalRatingComponent {
  @Input() rating?: { provider: string; rating: ExtRating };
}
