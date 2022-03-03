import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'myanili-about',
  templateUrl: './about.component.html',
})
export class AboutComponent {
  phone = window.atob('KzQ5IDE3NSA2Mzk1MDE0');
  constructor(public modal: NgbActiveModal) {}
}
