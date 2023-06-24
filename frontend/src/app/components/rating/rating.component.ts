import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'myanili-rating',
  templateUrl: './rating.component.html',
})
export class RatingComponent {
  @Input() rating?: number;
  @Output() ratingChange: EventEmitter<number> = new EventEmitter<number>();
  @Input() size = 24;
}
