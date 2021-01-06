import { Component, Input } from '@angular/core';
import { AnimeRecommendations } from '@models/anime';

@Component({
  selector: 'app-anime-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss'],
})
export class AnimeRecommendationsComponent {
  @Input() recommendations: AnimeRecommendations = [];
}
