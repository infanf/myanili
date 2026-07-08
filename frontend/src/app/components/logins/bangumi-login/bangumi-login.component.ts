import { Component, OnInit } from '@angular/core';
import { BangumiService } from '@services/anime/bangumi.service';
import { GlobalService } from '@services/global.service';

interface BangumiUser {
  id: number;
  username: string;
  nickname: string;
}

@Component({
  selector: 'myanili-bangumi-login',
  templateUrl: './bangumi-login.component.html',
  standalone: false,
})
export class BangumiLoginComponent implements OnInit {
  bangumiLoggedIn?: BangumiUser;
  bangumiLoading = false;

  constructor(
    private bangumi: BangumiService,
    private glob: GlobalService,
  ) {
    window.addEventListener('myanili-mal-logoff', () => {
      this.bangumiLogoff();
    });
  }

  ngOnInit() {
    this.bangumi.user.subscribe(user => {
      this.bangumiLoggedIn = user as BangumiUser | undefined;
    });
  }

  getProfileUrl(): string {
    if (this.bangumiLoggedIn?.username) {
      return `https://bgm.tv/user/${this.bangumiLoggedIn.username}`;
    }
    return 'https://bgm.tv';
  }

  async bangumiConnect() {
    this.bangumiLoading = true;
    try {
      this.glob.busy();
      await this.bangumi.login();
      this.glob.notbusy();
    } finally {
      this.bangumiLoading = false;
    }
  }

  async bangumiLogoff() {
    this.bangumi.logout();
  }
}
