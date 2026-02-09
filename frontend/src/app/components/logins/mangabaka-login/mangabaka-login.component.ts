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
  mangabakaLoading = false;
  needsReauth = false;

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
    this.mangabaka.needsReauth.subscribe(needsReauth => {
      this.needsReauth = needsReauth;
    });
  }

  getProfileUrl(): string {
    if (this.mangabakaLoggedIn?.profile) {
      return this.mangabakaLoggedIn.profile;
    }
    return 'https://mangabaka.org/my/settings';
  }

  async mangabakaConnect() {
    this.mangabakaLoading = true;
    try {
      this.glob.busy();
      await this.mangabaka.login();
      this.glob.notbusy();
    } finally {
      this.mangabakaLoading = false;
    }
  }

  async mangabakaLogoff() {
    this.mangabaka.logout();
  }
}
