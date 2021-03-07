import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AnilistService } from 'src/app/anilist.service';
import { AnimeService } from 'src/app/anime/anime.service';
import { GlobalService } from 'src/app/global.service';
import { KitsuService } from 'src/app/kitsu.service';
import { MangaService } from 'src/app/manga/manga.service';

@Component({
  selector: 'app-navbar-quickadd',
  templateUrl: './quickadd.component.html',
  styleUrls: ['./quickadd.component.scss'],
})
export class QuickaddComponent {
  constructor(
    private anime: AnimeService,
    private manga: MangaService,
    private _router: Router,
    private glob: GlobalService,
    private kitsu: KitsuService,
    private anilist: AnilistService,
  ) {}

  async quickadd() {
    const externalUrl = prompt('Please enter media url from MAL, AniList or Kitsu:');
    if (!externalUrl) return;
    this.glob.busy();
    if (externalUrl.match(/myanimelist.net/)) {
      await this.addFromMal(externalUrl);
    } else if (externalUrl.match(/anilist.co/)) {
      await this.addFromAnilist(externalUrl);
    } else if (externalUrl.match(/kitsu.io/)) {
      await this.addFromKitsu(externalUrl);
    }
    this.glob.notbusy();
  }

  async addFromMal(url: string) {
    const regex = /myanimelist.net\/([a-z]+)\/(\d+)/;
    const result = regex.exec(url);
    if (result?.length !== 3) return;
    const [all, type, idStr] = result;
    const id = Number(idStr);
    if (!all || !id) return;
    if (type === 'anime') {
      const anime = await this.anime.getAnime(id);
      if (!anime.my_list_status) {
        await this.anime.updateAnime({ malId: id }, { status: 'plan_to_watch' });
      }
      this._router.navigate(['anime', 'details', id]);
    } else if (type === 'manga') {
      const manga = await this.manga.getManga(id);
      if (!manga.my_list_status) {
        await this.manga.updateManga(id, { status: 'plan_to_read' });
      }
      this._router.navigate(['manga', 'details', id]);
    }
  }

  async addFromAnilist(url: string) {
    const regex = /anilist.co\/([a-z]+)\/(\d+)/;
    const result = regex.exec(url);
    if (result?.length !== 3) return;
    const [all, type, idStr] = result;
    const id = Number(idStr);
    if (!all || !id) return;
    if (type === 'anime') {
      const malId = await this.anilist.getMalId(id, 'ANIME');
      if (!malId) return;
      const anime = await this.anime.getAnime(malId);
      if (!anime.my_list_status) {
        await this.anime.updateAnime({ malId, anilistId: id }, { status: 'plan_to_watch' });
      }
      this._router.navigate(['anime', 'details', malId]);
    } else if (type === 'manga') {
      const malId = await this.anilist.getMalId(id, 'MANGA');
      if (!malId) return;
      const manga = await this.manga.getManga(malId);
      if (!manga.my_list_status) {
        await this.manga.updateManga(malId, { status: 'plan_to_read' });
      }
      this._router.navigate(['manga', 'details', malId]);
    }
  }

  async addFromKitsu(url: string) {
    const regex = /kitsu.io\/([a-z]+)\/(\d+|[\w\-]+)/;
    const result = regex.exec(url);
    if (result?.length !== 3) return;
    const [all, type, idStr] = result;
    if (!all || !idStr || (type !== 'anime' && type !== 'manga')) return;
    let id;
    if (!idStr.match(/^\d+$/)) {
      id = await this.kitsu.getIdFromSlug(idStr, type);
    } else {
      id = Number(idStr);
    }
    if (!id) return;
    const malId = await this.kitsu.getExternalId(id, type, 'myanimelist');
    if (!malId) return;
    if (type === 'anime') {
      const anime = await this.anime.getAnime(malId);
      if (!anime.my_list_status) {
        await this.anime.updateAnime({ malId }, { status: 'plan_to_watch' });
      }
      this._router.navigate(['anime', 'details', malId]);
    } else if (type === 'manga') {
      const manga = await this.manga.getManga(malId);
      if (!manga.my_list_status) {
        await this.manga.updateManga(malId, { status: 'plan_to_read' });
      }
      this._router.navigate(['manga', 'details', malId]);
    }
  }
}
