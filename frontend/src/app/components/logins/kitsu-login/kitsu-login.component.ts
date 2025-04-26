import { Component, OnInit } from '@angular/core';
import { KitsuUser } from '@models/kitsu';
import { GlobalService } from '@services/global.service';
import { KitsuService } from '@services/kitsu.service';

@Component({
  selector: 'myanili-kitsu-login',
  templateUrl: './kitsu-login.component.html',
  standalone: false,
})
export class KitsuLoginComponent implements OnInit {
  kitsuLoggedIn?: KitsuUser;
  kitsuData?: { username: string; password: string; saveLogin: boolean };

  constructor(
    private kitsu: KitsuService,
    private glob: GlobalService,
  ) {
    // Listen for MAL logoff event to also log off from this service
    window.addEventListener('myanili-mal-logoff', () => {
      this.kitsuLogoff();
    });
  }

  ngOnInit() {
    this.kitsu.user.subscribe(user => {
      this.kitsuLoggedIn = user;
    });
  }

  async kitsuConnect() {
    if (!this.kitsuData) {
      this.kitsuData = {
        username: '',
        password: '',
        saveLogin: false,
      };
      return;
    }
    if (!this.kitsuData.username || !this.kitsuData.password) return;
    this.glob.busy();
    await this.kitsu.login(
      this.kitsuData?.username,
      this.kitsuData?.password,
      this.kitsuData?.saveLogin,
    );
    this.glob.notbusy();
  }

  async kitsuLogoff() {
    this.kitsu.logoff();
  }
}
