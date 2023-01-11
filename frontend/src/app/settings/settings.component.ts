import { Component, OnInit } from '@angular/core';
import { DialogueService } from '@components/dialogue/dialogue.service';
import { AnilistUser } from '@models/anilist';
import { BakaUser } from '@models/baka';
import { KitsuUser } from '@models/kitsu';
import { MalUser } from '@models/user';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AnilistService } from '@services/anilist.service';
import { AnnictService } from '@services/anime/annict.service';
import { SimklService, SimklUser } from '@services/anime/simkl.service';
import { TraktService } from '@services/anime/trakt.service';
import { GlobalService } from '@services/global.service';
import { KitsuService } from '@services/kitsu.service';
import { MalService } from '@services/mal.service';
import { MangaupdatesService } from '@services/manga/mangaupdates.service';
import { Language, SettingsService } from '@services/settings.service';

@Component({
  selector: 'myanili-settings',
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  lang: Language = 'default';
  malLoggedIn?: MalUser;
  traktLoggedIn?: string;
  annictLoggedIn?: string;
  simklLoggedIn?: SimklUser;
  anilistLoggedIn?: AnilistUser;
  kitsuLoggedIn?: KitsuUser;
  kitsuData?: { username: string; password: string; saveLogin: boolean };
  bakaLoggedIn?: BakaUser;
  bakaData?: { username: string; password: string; saveLogin: boolean };
  inlist = 'false';
  layout = 'list';
  nsfw = 'true';
  version = '0.0.0';
  constructor(
    private settings: SettingsService,
    private glob: GlobalService,
    private mal: MalService,
    private trakt: TraktService,
    private anilist: AnilistService,
    private kitsu: KitsuService,
    private simkl: SimklService,
    private annict: AnnictService,
    private baka: MangaupdatesService,
    public modal: NgbActiveModal,
    private dialogue: DialogueService,
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
    this.baka.user.subscribe(user => {
      this.bakaLoggedIn = user;
    });
    this.settings.onlyInList.subscribe(inList => {
      this.inlist = JSON.stringify(inList);
    });
    this.settings.layout.subscribe(layout => {
      this.layout = layout || 'list';
    });
    this.settings.nsfw.subscribe(nsfw => {
      this.nsfw = JSON.stringify(nsfw);
    });
    this.version = this.glob.version;
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

  changeNsfw() {
    this.settings.setNsfw(Boolean(JSON.parse(this.nsfw)));
  }

  changeLayout() {
    this.settings.setLayout(this.layout);
  }

  malConnect() {
    this.mal.login();
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
      this.traktLogoff();
      this.simklLogoff();
      this.annictLogoff();
      this.anilistLogoff();
      this.kitsuLogoff();
      this.bakaLogoff();
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
