import { Component, Input, OnInit } from '@angular/core';
import { MangaRecommendations, MyMangaStatus, ReadStatus } from '@models/manga';
import { AnilistService } from '@services/anilist.service';

@Component({
  selector: 'myanili-manga-recommendations',
  templateUrl: './recommendations.component.html',
  standalone: false,
})
export class MangaRecommendationsComponent implements OnInit {
  @Input() recommendations: MangaRecommendations = [];
  constructor(private anilist: AnilistService) {}
  async ngOnInit() {
    const animes = this.recommendations.map(rec => rec.node);
    const malIds = animes.map(a => a.id);
    const mapping = await this.anilist.getStatusMapping(malIds, 'MANGA');
    this.recommendations.forEach(rec => {
      rec.node.my_list_status = {
        status: mapping?.mapping[rec.node.id]?.status as ReadStatus,
        num_chapters_read: mapping?.mapping[rec.node.id]?.progress || 0,
      } as MyMangaStatus;
    });
  }
}
