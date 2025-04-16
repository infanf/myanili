import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'myanili-streaming',
  templateUrl: './streaming.component.html',
  styleUrls: ['./streaming.component.scss'],
  standalone: false,
})
export class StreamingComponent implements OnInit {
  @Input() provider?: string;
  @Input() country?: string;
  @Input() variant?: 'icon' | 'full';
  constructor() {}

  ngOnInit(): void {}
}
