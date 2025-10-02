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
  traktLoading = false;

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
    this.traktLoading = true;
    try {
      this.glob.busy();
      await this.trakt.login();
      this.glob.notbusy();
    } finally {
      this.traktLoading = false;
    }
  }

  async traktLogoff() {
    this.trakt.logoff();
  }
}
