import { Component } from '@angular/core';

import { MalService } from './mal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public malService: MalService) {
    this.malService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
  }
  loggedIn?: string | false = 'loading';
}
