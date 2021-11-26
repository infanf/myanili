import { Component } from '@angular/core';
import { ExternalComponent } from '@external/external.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AnnictService } from '../../anime/annict.service';

@Component({
  selector: 'app-annict',
  templateUrl: '../external.component.html',
})
export class AnnictComponent extends ExternalComponent {
  constructor(public modal: NgbActiveModal, private annict: AnnictService) {
    super(modal);
  }

  async ngOnInit() {
    this.annict.getId(1, '');
  }
}
