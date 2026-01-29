import { Component, OnInit } from '@angular/core';
import { MangaBakaUser } from '@models/mangabaka';
import { GlobalService } from '@services/global.service';
import { MangabakaService } from '@services/manga/mangabaka.service';

@Component({
  selector: 'myanili-mangabaka-login',
  templateUrl: './mangabaka-login.component.html',
  standalone: false,
})
export class MangabakaLoginComponent implements OnInit {
  mangabakaLoggedIn?: MangaBakaUser;
  mangabakaData?: { token: string };
  mangabakaLoading = false;

  constructor(
    private mangabaka: MangabakaService,
    private glob: GlobalService,
  ) {
    // Listen for MAL logoff event to also log off from this service
    window.addEventListener('myanili-mal-logoff', () => {
      this.mangabakaLogoff();
    });
  }

  ngOnInit() {
    this.mangabaka.user.subscribe(user => {
      this.mangabakaLoggedIn = user;
    });
  }

  getProfileUrl(): string {
    // PAT authentication doesn't provide username, so link to settings page
    return 'https://mangabaka.org/my/settings';
  }

  async mangabakaConnect() {
    if (!this.mangabakaData) {
      this.mangabakaData = {
        token: '',
      };
      return;
    }
    this.mangabakaLoading = true;
    try {
      this.glob.busy();
      await this.mangabaka.setApiKey(this.mangabakaData.token);
      this.glob.notbusy();
    } finally {
      this.mangabakaLoading = false;
    }
  }

  async mangabakaLogoff() {
    this.mangabaka.logout();
  }
}
