import { Component, Input, OnInit } from '@angular/core';
import { AnnNews, AnnService } from '@services/ann.service';

@Component({
  selector: 'myanili-ann-news',
  templateUrl: './ann-news.component.html',
})
export class AnnNewsComponent implements OnInit {
  @Input() annId!: number;
  @Input() type!: 'anime' | 'manga';
  private news: AnnNews[] = [];
  constructor(private ann: AnnService) {}

  ngOnInit() {
    this.ann.getEntry(this.annId, this.type).then(media => {
      this.news = media?.news || [];
    });
  }

  get newsItems() {
    const news = [...this.news];
    news.reverse();
    return news;
  }
}
