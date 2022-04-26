import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'myanili-poster-rating',
  templateUrl: './poster-rating.component.html',
  styleUrls: ['./poster-rating.component.scss'],
})
export class PosterRatingComponent implements OnInit {
  @Input() poster?: string;
  @Input() meanRating?: number;
  @Input() rating?: number;

  constructor() {}

  ngOnInit(): void {}
}
