import { Component, Input, OnInit } from '@angular/core';
import { LivechartService, LiveChartVideo } from '@services/anime/livechart.service';

@Component({
  selector: 'myanili-videos',
  templateUrl: './videos.component.html',
  standalone: false,
})
export class VideosComponent implements OnInit {
  @Input() id!: number;
  videos: LiveChartVideo[] = [];
  loading = true;
  error = false;
  activeVideoIds: Set<number> = new Set();

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

  toggleVideo(index: number): void {
    if (this.activeVideoIds.has(index)) {
      this.activeVideoIds.delete(index);
    } else {
      this.activeVideoIds.add(index);
    }
  }

  isVideoActive(index: number): boolean {
    return this.activeVideoIds.has(index);
  }
}
