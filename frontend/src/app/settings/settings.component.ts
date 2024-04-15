import { Component, OnInit } from '@angular/core';
import { AnilistUser } from '@models/anilist';
import { BakaUser } from '@models/baka';
import { KitsuUser } from '@models/kitsu';
import { ShikimoriUser } from '@models/shikimori';
import { MalUser } from '@models/user';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AnilistService } from '@services/anilist.service';
import { AnnictService } from '@services/anime/annict.service';
import { LivechartService } from '@services/anime/livechart.service';
import { SimklService, SimklUser } from '@services/anime/simkl.service';
import { TraktService } from '@services/anime/trakt.service';
import { DialogueService } from '@services/dialogue.service';
import { GlobalService } from '@services/global.service';
import { KitsuService } from '@services/kitsu.service';
import { MalService } from '@services/mal.service';
import { MangaupdatesService } from '@services/manga/mangaupdates.service';
import { Language, SettingsService } from '@services/settings.service';
import { ShikimoriService } from '@services/shikimori.service';

@Component({
  selector: 'myanili-settings',
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private _lang: Language = 'default';
  malLoggedIn?: MalUser;
  traktLoggedIn?: string;
  annictLoggedIn?: string;
  shikimoriLoggedIn?: ShikimoriUser;
  simklLoggedIn?: SimklUser;
  anilistLoggedIn?: AnilistUser;
  kitsuLoggedIn?: KitsuUser;
  kitsuData?: { username: string; password: string; saveLogin: boolean };
  bakaLoggedIn?: BakaUser;
  bakaData?: { username: string; password: string; saveLogin: boolean };
  livechartLoggedIn?: string;
  livechartData?: { username: string; password: string; saveLogin: boolean };
  private _inlist: BooleanString = 'false';
  private _autoFilter: BooleanString = 'false';
  private _layout = 'list';
  private _nsfw: BooleanString = 'true';
  version = '0.0.0';
  constructor(
    private settings: SettingsService,
    private glob: GlobalService,
    private mal: MalService,
    private trakt: TraktService,
    private anilist: AnilistService,
    private kitsu: KitsuService,
    private shikimori: ShikimoriService,
    private simkl: SimklService,
    private annict: AnnictService,
    private baka: MangaupdatesService,
    private livechart: LivechartService,
    public modal: NgbActiveModal,
    private dialogue: DialogueService,
  ) {
    this.settings.language$.asObservable().subscribe(lang => {
      this._lang = lang;
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
    this.shikimori.user.subscribe(user => {
      this.shikimoriLoggedIn = user;
    });
    this.annict.user.subscribe(user => {
      this.annictLoggedIn = user;
    });
    this.baka.user.subscribe(user => {
      this.bakaLoggedIn = user;
    });
    this.livechart.user.subscribe(user => {
      this.livechartLoggedIn = user;
    });
    this.settings.inList$.asObservable().subscribe(inList => {
      this._inlist = JSON.stringify(inList) as BooleanString;
    });
    this.settings.layout$.asObservable().subscribe(layout => {
      this._layout = layout || 'list';
    });
    this.settings.nsfw$.asObservable().subscribe(nsfw => {
      this._nsfw = JSON.stringify(nsfw) as BooleanString;
    });
    this.settings.autoFilter$.asObservable().subscribe(autoFilter => {
      this._autoFilter = JSON.stringify(autoFilter) as BooleanString;
    });
    this.version = this.glob.version;
  }

  async ngOnInit() {
    setTimeout(() => this.glob.notbusy(), 100);
  }

  get lang() {
    return this._lang;
  }

  set lang(value: Language) {
    this.settings.language = value;
  }

  get inlist() {
    return this._inlist;
  }

  set inlist(value: string) {
    this.settings.inList = Boolean(JSON.parse(value) || 'false');
  }

  get nsfw() {
    return this._nsfw;
  }

  set nsfw(value: BooleanString) {
    this.settings.nsfw = Boolean(JSON.parse(value) || 'false');
  }

  get layout() {
    return this._layout;
  }

  set layout(value: string) {
    this.settings.layout = value;
  }

  get autoFilter() {
    return this._autoFilter;
  }

  set autoFilter(value: BooleanString) {
    this.settings.autoFilter = Boolean(JSON.parse(value) || 'false');
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

  async shikimoriConnect() {
    this.glob.busy();
    await this.shikimori.login();
    this.glob.notbusy();
  }

  async shikimoriLogoff() {
    this.shikimori.logoff();
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

  async livechartConnect() {
    if (!this.livechartData) {
      this.livechartData = {
        username: '',
        password: '',
        saveLogin: false,
      };
      return;
    }
    this.glob.busy();
    await this.livechart.login(this.livechartData?.username, this.livechartData?.password);
    this.glob.notbusy();
  }

  async livechartLogoff() {
    this.livechart.logoff();
  }
}

type BooleanString = 'true' | 'false';
