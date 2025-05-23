import { Component } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { DialogueService } from '@services/dialogue.service';
import { GlobalService } from '@services/global.service';
import { MalService } from '@services/mal.service';

@Component({
  selector: 'myanili-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent {
  today = new Date();
  hideNavbar = false;
  constructor(
    public malService: MalService,
    private swUpdate: SwUpdate,
    private glob: GlobalService,
    private dialogue: DialogueService,
  ) {
    this.setupUpdates();
    this.malService.maintenace().then(isMaintenance => {
      if (isMaintenance) {
        this.dialogue.open(
          'MyAnimeList is currently under maintenance (or not available due to other reasons). Please check back later.',
          'MAL Maintenance',
        );
      }
    });
    this.malService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
    this.glob.isBusy.subscribe(busy => (this.busy = busy));
    this.glob.loadingPercent.subscribe(perc => (this.loadingPercent = perc));
    this.glob.hideNavbar.subscribe(hide => (this.hideNavbar = hide));
  }
  loggedIn?: string | false = 'loading';
  busy = true;
  loadingPercent = 0;

  setupUpdates() {
    this.swUpdate.versionUpdates.subscribe((event: VersionEvent) => {
      if (event.type !== 'VERSION_READY') {
        return;
      }
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
    this.swUpdate.checkForUpdate().catch(e => {
      console.log(e.message);
    });
  }
}
