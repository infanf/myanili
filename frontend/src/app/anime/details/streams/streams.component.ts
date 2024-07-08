import { Component, Input, OnInit } from '@angular/core';
import { LegacyStream } from '@services/anime/livechart.service';

@Component({
  selector: 'myanili-anime-streams',
  templateUrl: './streams.component.html',
  styles: [
    `
      .streams > a:hover {
        background-color: rgba(var(--bs-secondary-rgb), 0.1);
        outline: 0.75rem solid rgba(var(--bs-secondary-rgb), 0.1);
      }
    `,
  ],
})
export class StreamsComponent implements OnInit {
  @Input() streams: LegacyStream[] = [];
  ngOnInit() {
    this.streams.sort((a, b) => {
      if (a.availableInViewerRegion && !b.availableInViewerRegion) {
        return -1;
      } else if (!a.availableInViewerRegion && b.availableInViewerRegion) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
