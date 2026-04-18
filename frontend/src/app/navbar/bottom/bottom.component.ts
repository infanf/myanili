import { Component } from '@angular/core';
import { GlobalService } from '@services/global.service';
import { MalService } from '@services/mal.service';
import { NavbarService } from '@services/navbar.service';

@Component({
  selector: 'myanili-navbar-bottom',
  templateUrl: './bottom.component.html',
  styleUrls: ['./bottom.component.scss'],
  standalone: false,
})
export class NavbarBottomComponent {
  module?: 'anime' | 'manga';
  lastPosition = 0;
  hide = false;
  loggedIn: string | false = false;

  constructor(
    private navbarService: NavbarService,
    private glob: GlobalService,
    private malService: MalService,
  ) {
    this.navbarService.module.subscribe(module => {
      this.module = module;
    });
    this.glob.hideNavbar.subscribe(hide => {
      this.hide = hide;
    });
    this.malService.loggedIn.subscribe(loggedIn => {
      if (loggedIn !== '***loading***') this.loggedIn = loggedIn;
    });
  }
}
