import { Component, Input } from '@angular/core';

@Component({
  selector: 'myanili-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
})
export class IconComponent {
  @Input() name!: string;
  @Input() size: string | number = 16;
}
