import { Component } from '@angular/core';
import { MalUser } from '@models/user';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MalService } from '@services/mal.service';
import { NavbarService } from '@services/navbar.service';
import { SettingsComponent } from 'src/app/settings/settings.component';

@Component({
  selector: 'myanili-navbar-top',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.scss'],
})
export class NavbarTopComponent {
  constructor(
    public malService: MalService,
    private modal: NgbModal,
    private navbarService: NavbarService,
  ) {
    this.malService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
    this.malService.user.subscribe(user => {
      this.user = user;
    });
    this.navbarService.module.subscribe(module => {
      this.module = module;
    });
  }
  loggedIn: string | false = 'loading';
  user?: MalUser;
  module?: 'anime' | 'manga';

  showSettings() {
    this.modal.open(SettingsComponent);
  }
}
