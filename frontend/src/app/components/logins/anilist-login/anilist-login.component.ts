import { Component, OnInit } from '@angular/core';
import { AnilistUser } from '@models/anilist';
import { AnilistService } from '@services/anilist.service';
import { GlobalService } from '@services/global.service';

@Component({
  selector: 'myanili-anilist-login',
  templateUrl: './anilist-login.component.html',
  standalone: false,
})
export class AnilistLoginComponent implements OnInit {
  anilistLoggedIn?: AnilistUser;

  constructor(
    private anilist: AnilistService,
    private glob: GlobalService,
  ) {
    // Listen for MAL logoff event to also log off from this service
    window.addEventListener('myanili-mal-logoff', () => {
      this.anilistLogoff();
    });
  }

  ngOnInit() {
    this.anilist.user.subscribe(user => {
      this.anilistLoggedIn = user;
    });
  }

  async anilistConnect() {
    this.glob.busy();
    await this.anilist.login();
    this.glob.notbusy();
  }

  async anilistLogoff() {
    this.anilist.logoff();
  }
}
