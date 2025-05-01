import { Component, OnInit } from '@angular/core';
import { TraktService } from '@services/anime/trakt.service';
import { GlobalService } from '@services/global.service';

@Component({
  selector: 'myanili-trakt-login',
  templateUrl: './trakt-login.component.html',
  standalone: false,
})
export class TraktLoginComponent implements OnInit {
  traktLoggedIn?: string;

  constructor(
    private trakt: TraktService,
    private glob: GlobalService,
  ) {
    // Listen for MAL logoff event to also log off from this service
    window.addEventListener('myanili-mal-logoff', () => {
      this.traktLogoff();
    });
  }

  ngOnInit() {
    this.trakt.user.subscribe(user => {
      this.traktLoggedIn = user;
    });
  }

  async traktConnect() {
    this.glob.busy();
    await this.trakt.login();
    this.glob.notbusy();
  }

  async traktLogoff() {
    this.trakt.logoff();
  }
}
