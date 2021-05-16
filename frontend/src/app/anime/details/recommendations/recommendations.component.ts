import { Component, Input } from '@angular/core';
import { MediaRecommendations } from '@models/media';

@Component({
  selector: 'app-anime-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss'],
})
export class AnimeRecommendationsComponent {
  @Input() recommendations: MediaRecommendations = [];
}
