import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'myanili-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class HeaderComponent {
  @Input() header!: string;
}
