import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MalUser } from '@models/user';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { MalService } from '../mal.service';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'myanili-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  constructor(public malService: MalService, private modal: NgbModal, private router: Router) {
    this.malService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
    this.malService.user.subscribe(user => {
      this.user = user;
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const path = event.urlAfterRedirects;
        this.setModule(path);
      }
    });
  }
  loggedIn: string | false = 'loading';
  user?: MalUser;
  module?: 'anime' | 'manga';

  showSettings() {
    this.modal.open(SettingsComponent);
  }

  setModule(path: string) {
    if (path.includes('anime')) {
      this.module = 'anime';
    } else if (path.includes('manga')) {
      this.module = 'manga';
    } else {
      delete this.module;
    }
  }
}
