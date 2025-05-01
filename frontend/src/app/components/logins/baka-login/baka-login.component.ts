import { Component, OnInit } from '@angular/core';
import { BakaUser } from '@models/baka';
import { GlobalService } from '@services/global.service';
import { MangaupdatesService } from '@services/manga/mangaupdates.service';

@Component({
  selector: 'myanili-baka-login',
  templateUrl: './baka-login.component.html',
  standalone: false,
})
export class BakaLoginComponent implements OnInit {
  bakaLoggedIn?: BakaUser;
  bakaData?: { username: string; password: string; saveLogin: boolean };

  constructor(
    private baka: MangaupdatesService,
    private glob: GlobalService,
  ) {
    // Listen for MAL logoff event to also log off from this service
    window.addEventListener('myanili-mal-logoff', () => {
      this.bakaLogoff();
    });
  }

  ngOnInit() {
    this.baka.user.subscribe(user => {
      this.bakaLoggedIn = user;
    });
  }

  async bakaConnect() {
    if (!this.bakaData) {
      this.bakaData = {
        username: '',
        password: '',
        saveLogin: false,
      };
      return;
    }
    this.glob.busy();
    await this.baka.login(this.bakaData?.username, this.bakaData?.password);
    this.glob.notbusy();
  }

  async bakaLogoff() {
    this.baka.logoff();
  }
}
