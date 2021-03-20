import { Component, Input } from '@angular/core';
import { ExtRating } from '@models/components';

@Component({
  selector: 'app-external-rating',
  templateUrl: './external-rating.component.html',
  styleUrls: ['./external-rating.component.scss'],
})
export class ExternalRatingComponent {
  @Input() rating?: { provider: string; rating: ExtRating };
}
