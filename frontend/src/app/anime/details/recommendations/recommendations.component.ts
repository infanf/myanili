import { Component, Input } from '@angular/core';
import { AnimeRecommendations } from '@models/anime';

@Component({
  selector: 'myanili-anime-recommendations',
  templateUrl: './recommendations.component.html',
})
export class AnimeRecommendationsComponent {
  @Input() recommendations: AnimeRecommendations = [];
}
