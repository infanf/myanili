import { Component, Input } from '@angular/core';

@Component({
  selector: 'myanili-double-card',
  templateUrl: './double-card.component.html',
  styleUrls: ['./double-card.component.scss'],
})
export class DoubleCardComponent {
  @Input() left: DoubleCardData = {};
  @Input() right?: DoubleCardData;
  constructor() {}
}

interface DoubleCardData {
  poster?: string;
  title?: string;
  subtitle?: string;
  link?: string;
}
