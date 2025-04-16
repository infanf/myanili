import { Component, Input } from '@angular/core';
import { IconComponent } from '@icon/icon.component';

@Component({
  selector: 'myanili-icon-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss'],
  standalone: false,
})
export class ProgressIconComponent extends IconComponent {
  @Input() percent = 0;
  @Input() size = 16;
}
