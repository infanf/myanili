import { Component, Input } from '@angular/core';
import { IconComponent } from '@icon/icon.component';

@Component({
  selector: 'app-icon-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss'],
})
export class ProgressIconComponent extends IconComponent {
  @Input() percent = 0;
  @Input() size = 16;
}
