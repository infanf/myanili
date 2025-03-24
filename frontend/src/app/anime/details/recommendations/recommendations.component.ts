import { Component, Input, OnInit } from '@angular/core';
import { AnimeRecommendations, MyAnimeStatus, WatchStatus } from '@models/anime';
import { AnilistService } from '@services/anilist.service';

@Component({
  selector: 'myanili-anime-recommendations',
  templateUrl: './recommendations.component.html',
  standalone: false,
})
export class AnimeRecommendationsComponent implements OnInit {
  @Input() recommendations: AnimeRecommendations = [];
  constructor(private anilist: AnilistService) {}
  async ngOnInit() {
    const animes = this.recommendations.map(rec => rec.node);
    const malIds = animes.map(a => a.id);
    const mapping = await this.anilist.getStatusMapping(malIds, 'ANIME');
    this.recommendations.forEach(rec => {
      rec.node.my_list_status = {
        status: mapping?.mapping[rec.node.id]?.status as WatchStatus,
        num_episodes_watched: mapping?.mapping[rec.node.id]?.progress || 0,
      } as MyAnimeStatus;
    });
  }
}
