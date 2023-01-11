import { Component } from '@angular/core';
import { GlobalService } from '@services/global.service';
import { NavbarService } from '@services/navbar.service';

@Component({
  selector: 'myanili-navbar-bottom',
  templateUrl: './bottom.component.html',
  styleUrls: ['./bottom.component.scss'],
})
export class NavbarBottomComponent {
  module?: 'anime' | 'manga';
  lastPosition = 0;
  hide = false;

  constructor(private navbarService: NavbarService, private glob: GlobalService) {
    this.navbarService.module.subscribe(module => {
      this.module = module;
    });

    this.glob.hideNavbar.subscribe(hide => {
      this.hide = hide;
    });
  }
}
