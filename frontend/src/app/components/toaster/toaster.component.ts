import { Component } from '@angular/core';
import { GlobalService } from '@services/global.service';

import { ToasterService } from './toaster.service';

@Component({
  selector: 'myanili-toaster',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss'],
  standalone: false,
})
export class ToasterComponent {
  hideNavbar = false;
  constructor(
    public service: ToasterService,
    private glob: GlobalService,
  ) {
    this.glob.hideNavbar.subscribe(hide => (this.hideNavbar = hide));
  }
}
