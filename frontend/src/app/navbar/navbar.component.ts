import { Component, OnInit } from '@angular/core';
import { MalUser } from '@models/user';

import { MalService } from '../mal.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  constructor(public malService: MalService) {
    this.loggedIn = 'loading';
  }
  loggedIn: string | false = 'loading';
  user?: MalUser;

  ngOnInit(): void {
    this.malService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
    this.malService.user.subscribe(user => {
      this.user = user;
    });
  }
}
