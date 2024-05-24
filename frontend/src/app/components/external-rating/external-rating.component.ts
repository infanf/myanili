import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ExtRating } from '@models/components';
import { ScoreDisplay, SettingsService } from '@services/settings.service';

@Component({
  selector: 'myanili-external-rating',
  templateUrl: './external-rating.component.html',
})
export class ExternalRatingComponent {
  @Input() rating?: { provider: string; rating: ExtRating };
  scoreDisplay: ScoreDisplay = 'default';
  constructor(private settings: SettingsService, private numberPipe: DecimalPipe) {
    this.settings.scoreDisplay$.asObservable().subscribe(scoreDisplay => {
      this.scoreDisplay = scoreDisplay;
    });
  }

  get score() {
    switch (this.scoreDisplay) {
      case '10':
        return this.numberPipe.transform((this.rating?.rating.norm || 0) / 10, '1.0-2');
      case '100':
        return `${this.numberPipe.transform(this.rating?.rating.norm || 0, '1.0-1')} %`;
      default:
        return `${this.numberPipe.transform(this.rating?.rating.nom, '1.0-2')} ${
          this.rating?.rating.unit || ''
        }`.trim();
    }
  }
}
