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
    window.document.onscroll = () => {
      const currentPositon = window.pageYOffset;
      if (currentPositon > 60 && currentPositon > this.lastPosition) {
        this.bottom = 3.5;
      } else {
        this.bottom = 0;
      }
      this.lastPosition = currentPositon;
    };
  }
  module?: 'anime' | 'manga';
  lastPosition = 0;
  bottom = 0;
}
