import { Component, Input } from '@angular/core';
import { MangaRecommendations } from '@models/manga';

@Component({
  selector: 'app-manga-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss'],
})
export class MangaRecommendationsComponent {
  @Input() recommendations: MangaRecommendations = [];
}
