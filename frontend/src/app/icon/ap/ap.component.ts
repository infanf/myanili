import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '@icon/icon.component';

@Component({
  selector: 'myanili-icon-ap',
  templateUrl: './ap.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ApComponent extends IconComponent {
  name = 'ap';
}
