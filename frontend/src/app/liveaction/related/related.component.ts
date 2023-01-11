import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AnisearchRelated, AnisearchService } from '@services/anisearch.service';

@Component({
  selector: 'myanili-liveaction-related',
  templateUrl: './related.component.html',
})
export class LiveactionRelatedComponent implements OnInit, OnChanges {
  @Input() anisearchId!: number;
  @Input() type: 'anime' | 'manga' = 'anime';
  related_liveaction: AnisearchRelated[] = [];

  constructor(private anisearch: AnisearchService) {}

  ngOnInit(): void {
    if (!this.anisearchId) return;
    this.anisearch.getRelated(this.anisearchId, this.type).then(related => {
      this.related_liveaction = related.filter(r => r.type === 'movie');
    });
  }

  ngOnChanges() {
    this.ngOnInit();
  }

  open(url: string) {
    window.open(url, '_blank');
  }
}
