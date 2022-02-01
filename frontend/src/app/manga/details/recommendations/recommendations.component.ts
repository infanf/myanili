import { Component, Input } from '@angular/core';
import { MangaRecommendations } from '@models/manga';

@Component({
  selector: 'myanili-manga-recommendations',
  templateUrl: './recommendations.component.html',
})
export class MangaRecommendationsComponent {
  @Input() recommendations: MangaRecommendations = [];
}
