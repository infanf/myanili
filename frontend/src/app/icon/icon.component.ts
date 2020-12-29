import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
})
export class IconComponent implements OnInit {
  @Input() name!: string;
  @Input() size: string | number = 16;

  constructor() {}

  ngOnInit(): void {}
}
