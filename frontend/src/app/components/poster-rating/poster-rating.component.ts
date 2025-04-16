import { Component, Input } from '@angular/core';
import { SettingsService } from '@services/settings.service';

@Component({
  selector: 'myanili-poster-rating',
  templateUrl: './poster-rating.component.html',
  styleUrls: ['./poster-rating.component.scss'],
  standalone: false,
})
export class PosterRatingComponent {
  @Input() poster?: string;
  @Input() meanRating?: number;
  @Input() rating?: number;
  private scoreDisplay = 'default';

  constructor(private settings: SettingsService) {
    this.settings.scoreDisplay$.asObservable().subscribe(scoreDisplay => {
      this.scoreDisplay = scoreDisplay;
    });
  }

  get unit() {
    switch (this.scoreDisplay) {
      case '100':
        return ' %';
      default:
        return '';
    }
  }

  get meanScore() {
    return this.scoreDisplay === '100' ? this.meanRating : (this.meanRating || 0) / 10;
  }
}
