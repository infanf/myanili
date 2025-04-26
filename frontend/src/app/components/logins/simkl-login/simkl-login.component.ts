import { Component, OnInit } from '@angular/core';
import { SimklService, SimklUser } from '@services/anime/simkl.service';
import { GlobalService } from '@services/global.service';

@Component({
  selector: 'myanili-simkl-login',
  templateUrl: './simkl-login.component.html',
  standalone: false,
})
export class SimklLoginComponent implements OnInit {
  simklLoggedIn?: SimklUser;

  constructor(
    private simkl: SimklService,
    private glob: GlobalService,
  ) {
    // Listen for MAL logoff event to also log off from this service
    window.addEventListener('myanili-mal-logoff', () => {
      this.simklLogoff();
    });
  }

  ngOnInit() {
    this.simkl.user.subscribe(user => {
      this.simklLoggedIn = user;
    });
  }

  async simklConnect() {
    this.glob.busy();
    await this.simkl.login();
    this.glob.notbusy();
  }

  async simklLogoff() {
    this.simkl.logoff();
  }
}
