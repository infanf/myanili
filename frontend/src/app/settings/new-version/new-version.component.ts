import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Changelog } from 'src/changelog';

@Component({
  selector: 'myanili-new-version',
  templateUrl: './new-version.component.html',
  standalone: false,
})
export class NewVersionComponent {
  version = '';
  changelog!: Changelog;

  constructor(public modal: NgbActiveModal) {}
}
