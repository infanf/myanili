import { Component, Input } from '@angular/core';

@Component({
  selector: 'myanili-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  @Input() header!: string;
}
