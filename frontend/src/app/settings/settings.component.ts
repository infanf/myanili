import { Component, OnInit } from '@angular/core';
import { MalUser } from '@models/user';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { TraktService } from '../anime/trakt.service';
import { GlobalService } from '../global.service';
import { MalService } from '../mal.service';

import { Language, SettingsService } from './settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  lang: Language = 'default';
  malLoggedIn?: MalUser;
  traktLoggedIn?: string;
  inlist = 'false';
  constructor(
    private settings: SettingsService,
    private glob: GlobalService,
    private mal: MalService,
    private trakt: TraktService,
    public modal: NgbActiveModal,
  ) {
    this.settings.language.subscribe(lang => {
      this.lang = lang;
    });
    this.mal.user.subscribe(user => {
      this.malLoggedIn = user;
    });
    this.trakt.user.subscribe(user => {
      this.traktLoggedIn = user;
    });
    this.settings.onlyInList.subscribe(inList => {
      this.inlist = JSON.stringify(inList);
    });
  }

  async ngOnInit() {
    setTimeout(() => this.glob.notbusy(), 100);
  }

  changeLang() {
    this.settings.setLanguage(this.lang);
  }

  changeInList() {
    this.settings.setInList(Boolean(JSON.parse(this.inlist)));
  }

  async malLogoff() {
    this.glob.busy();
    if (confirm(`Log out account ${this.malLoggedIn?.name}?`)) {
      await this.mal.get('/logoff');
      await this.mal.checkLogin();
      this.traktLogoff();
    }
    this.glob.notbusy();
  }

  async traktConnect() {
    this.glob.busy();
    await this.trakt.login();
    this.glob.notbusy();
  }

  async traktLogoff() {
    this.trakt.logoff();
  }
}
