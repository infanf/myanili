import { Component } from '@angular/core';

import { NavbarService } from '../navbar.service';

@Component({
  selector: 'myanili-navbar-bottom',
  templateUrl: './bottom.component.html',
  styleUrls: ['./bottom.component.scss'],
})
export class NavbarBottomComponent {
  constructor(private navbarService: NavbarService) {
    this.navbarService.module.subscribe(module => {
      this.module = module;
    });
  }
  module?: 'anime' | 'manga';
}
