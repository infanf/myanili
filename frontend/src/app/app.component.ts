import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

import { MalService } from './mal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public malService: MalService, private swUpdate: SwUpdate) {
    this.malService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
    this.setupUpdates();
  }
  loggedIn?: string | false = 'loading';

  setupUpdates() {
    this.swUpdate.available.subscribe(u => {
      this.swUpdate.activateUpdate().then(e => {
        const message = 'Application has been updated.\nConfirm to reload now.';
        if (confirm(message)) {
          location.reload();
        }
      });
    });
    this.swUpdate.checkForUpdate();
  }
}
