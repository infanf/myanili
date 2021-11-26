import { Component } from '@angular/core';
import { ExternalComponent } from '@external/external.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-bakamanga',
  templateUrl: '../external.component.html',
})
export class BakamangaComponent extends ExternalComponent {
  constructor(public modal: NgbActiveModal) {
    super(modal);
  }
}
