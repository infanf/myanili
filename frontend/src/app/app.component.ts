import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

import { GlobalService } from './global.service';
import { MalService } from './mal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    public malService: MalService,
    private swUpdate: SwUpdate,
    private glob: GlobalService,
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
