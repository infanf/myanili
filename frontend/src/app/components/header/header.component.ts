import { Component, Input } from '@angular/core';

@Component({
  selector: 'myanili-header',
  templateUrl: './header.component.html',
  standalone: false,
})
export class HeaderComponent {
  @Input() header!: string;
}
