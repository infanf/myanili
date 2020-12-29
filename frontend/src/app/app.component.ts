import { Component } from '@angular/core';

import { MalService } from './mal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public malService: MalService) {}

  async authorize() {
    window.location.href = 'http://localhost:4280/auth';
  }
}
