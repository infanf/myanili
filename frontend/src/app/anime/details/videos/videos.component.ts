import { Component, Input, OnInit } from '@angular/core';
import { LivechartService, LiveChartVideo } from '@services/anime/livechart.service';

@Component({
  selector: 'myanili-videos',
  templateUrl: './videos.component.html',
})
export class VideosComponent implements OnInit {
  @Input() id!: number;
  videos: LiveChartVideo[] = [];
  loading = true;
  error = false;

  constructor(private livechart: LivechartService) {}

  ngOnInit(): void {
    this.fetchVideos();
  }

  async fetchVideos(): Promise<void> {
    if (!this.id) {
      this.loading = false;
      return;
    }

    try {
      this.videos = await this.livechart.getVideos(this.id);
    } catch (err) {
      console.error('Error fetching videos:', err);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }
}
