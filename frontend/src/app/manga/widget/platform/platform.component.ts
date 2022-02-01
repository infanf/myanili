import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'myanili-platform',
  templateUrl: './platform.component.html',
})
export class PlatformComponent implements OnInit {
  @Input() provider?: string;

  constructor() {}

  ngOnInit(): void {}
}
