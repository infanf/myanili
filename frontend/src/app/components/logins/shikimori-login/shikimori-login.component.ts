import { Component, OnInit } from '@angular/core';
import { ShikimoriUser } from '@models/shikimori';
import { GlobalService } from '@services/global.service';
import { ShikimoriService } from '@services/shikimori.service';

@Component({
  selector: 'myanili-shikimori-login',
  templateUrl: './shikimori-login.component.html',
  standalone: false,
})
export class ShikimoriLoginComponent implements OnInit {
  shikimoriLoggedIn?: ShikimoriUser;

  constructor(
    private shikimori: ShikimoriService,
    private glob: GlobalService,
  ) {
    // Listen for MAL logoff event to also log off from this service
    window.addEventListener('myanili-mal-logoff', () => {
      this.shikimoriLogoff();
    });
  }

  ngOnInit() {
    this.shikimori.user.subscribe(user => {
      this.shikimoriLoggedIn = user;
    });
  }

  async shikimoriConnect() {
    this.glob.busy();
    await this.shikimori.login();
    this.glob.notbusy();
  }

  async shikimoriLogoff() {
    this.shikimori.logoff();
  }
}
