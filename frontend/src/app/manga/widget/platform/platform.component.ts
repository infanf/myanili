import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-platform',
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.scss'],
})
export class PlatformComponent implements OnInit {
  @Input() provider?: string;

  constructor() {}

  ngOnInit(): void {}
}
