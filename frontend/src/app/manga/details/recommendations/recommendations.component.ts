import { Component, Input } from '@angular/core';
import { MangaRecommendations } from '@models/mal-manga';

@Component({
  selector: 'app-manga-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss'],
})
export class MangaRecommendationsComponent {
  @Input() recommendations: MangaRecommendations = [];
}
