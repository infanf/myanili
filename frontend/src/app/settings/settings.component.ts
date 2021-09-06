import { Component, OnInit } from '@angular/core';
import { AnilistUser } from '@models/anilist';
import { KitsuUser } from '@models/kitsu';
import { MalUser } from '@models/user';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AnilistService } from '../anilist.service';
import { AnnictService } from '../anime/annict.service';
import { SimklService } from '../anime/simkl.service';
import { TraktService } from '../anime/trakt.service';
import { GlobalService } from '../global.service';
import { KitsuService } from '../kitsu.service';
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
  annictLoggedIn?: string;
  simklLoggedIn?: number | string;
  anilistLoggedIn?: AnilistUser;
  kitsuLoggedIn?: KitsuUser;
  kitsuData?: { username: string; password: string };
  inlist = 'false';
  layout = 'list';
  constructor(
    private settings: SettingsService,
    private glob: GlobalService,
    private mal: MalService,
    private trakt: TraktService,
    private anilist: AnilistService,
    private kitsu: KitsuService,
    private simkl: SimklService,
    private annict: AnnictService,
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
    this.simkl.user.subscribe(user => {
      this.simklLoggedIn = user;
    });
    this.anilist.user.subscribe(user => {
      this.anilistLoggedIn = user;
    });
    this.kitsu.user.subscribe(user => {
      this.kitsuLoggedIn = user;
    });
    this.annict.user.subscribe(user => {
      this.annictLoggedIn = user;
    });
    this.settings.onlyInList.subscribe(inList => {
      this.inlist = JSON.stringify(inList);
    });
    this.settings.layout.subscribe(layout => {
      this.layout = layout || 'list';
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

  changeLayout() {
    this.settings.setLayout(this.layout);
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

  async simklConnect() {
    this.glob.busy();
    await this.simkl.login();
    this.glob.notbusy();
  }

  async simklLogoff() {
    this.simkl.logoff();
  }

  async annictConnect() {
    this.glob.busy();
    await this.annict.login();
    this.glob.notbusy();
  }

  async annictLogoff() {
    this.annict.logoff();
  }

  async anilistConnect() {
    this.glob.busy();
    await this.anilist.login();
    this.glob.notbusy();
  }

  async anilistLogoff() {
    this.anilist.logoff();
  }

  async kitsuConnect() {
    if (!this.kitsuData) {
      this.kitsuData = {
        username: '',
        password: '',
      };
      return;
    }
    if (!this.kitsuData.username || !this.kitsuData.password) return;
    this.glob.busy();
    await this.kitsu.login(this.kitsuData?.username, this.kitsuData?.password);
    this.glob.notbusy();
  }

  async kitsuLogoff() {
    this.kitsu.logoff();
  }
}
