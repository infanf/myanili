import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'myanili-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class IconComponent {
  @Input() name!: string;
  @Input() size: string | number = 16;
}
