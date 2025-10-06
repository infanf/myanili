import { Component, OnInit } from '@angular/core';
import { MalUser } from '@models/user';
import { DialogueService } from '@services/dialogue.service';
import { GlobalService } from '@services/global.service';
import { MalService } from '@services/mal.service';

@Component({
  selector: 'myanili-mal-login',
  templateUrl: './mal-login.component.html',
  standalone: false,
})
export class MalLoginComponent implements OnInit {
  malLoggedIn?: MalUser;
  malLoading = false;

  constructor(
    private mal: MalService,
    private glob: GlobalService,
    private dialogue: DialogueService,
  ) {}

  ngOnInit() {
    this.mal.user.subscribe(user => {
      this.malLoggedIn = user;
    });
  }

  async malConnect() {
    this.malLoading = true;
    try {
      await this.mal.login();
    } finally {
      this.malLoading = false;
    }
  }

  async malLogoff() {
    this.glob.busy();
    const malLogoff = await this.dialogue.confirm(
      'Are you sure you want to log off from MyAnimeList?\nAll your other accounts will be logged off as well.',
      'Log off from MyAnimeList',
    );
    if (malLogoff) {
      await this.mal.get('logoff');
      await this.mal.checkLogin();
      // Emit event to notify other services to log off
      window.dispatchEvent(new CustomEvent('myanili-mal-logoff'));
    }
    this.glob.notbusy();
  }
}
