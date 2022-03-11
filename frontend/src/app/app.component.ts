import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { DialogueService } from '@components/dialogue/dialogue.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AboutComponent } from './about/about.component';
import { GlobalService } from './global.service';
import { MalService } from './mal.service';

@Component({
  selector: 'myanili-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  today = new Date();
  constructor(
    public malService: MalService,
    private swUpdate: SwUpdate,
    private glob: GlobalService,
    private modal: NgbModal,
    private dialogue: DialogueService,
  ) {
    this.malService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
    this.setupUpdates();
    this.glob.isBusy.subscribe(busy => (this.busy = busy));
    this.glob.loadingPercent.subscribe(perc => (this.loadingPercent = perc));
  }
  loggedIn?: string | false = 'loading';
  busy = true;
  loadingPercent = 0;

  setupUpdates() {
    this.swUpdate.available.subscribe(u => {
      this.swUpdate.activateUpdate().then(async e => {
        const message = 'Application has been updated.\nConfirm to reload now.';
        const reload = await this.dialogue.open(
          message,
          'Update available',
          [
            { label: 'Update later', value: false },
            { label: 'Reload now', value: true },
          ],
          false,
        );
        if (reload) {
          location.reload();
        }
      });
    });
    this.swUpdate.checkForUpdate();
  }

  showAbout() {
    this.modal.open(AboutComponent);
  }
}
