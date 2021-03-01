import { Component, Input, OnInit } from '@angular/core';
import { ListManga, MyMangaUpdate } from '@models/manga';
import { GlobalService } from 'src/app/global.service';
import { SettingsService } from 'src/app/settings/settings.service';

import { MangaService } from '../manga.service';

@Component({
  selector: 'app-readlist-wrapper',
  templateUrl: './readlist-wrapper.component.html',
  styles: ['app-readlist {display: table-row-group;}'],
})
export class ReadlistWrapperComponent implements OnInit {
  mangas: ListManga[] = [];

  constructor(private mangaservice: MangaService, private glob: GlobalService) {}

  async ngOnInit() {
    this.glob.busy();
    this.mangas = await this.mangaservice.list('reading');
    this.glob.notbusy();
  }

  get reading(): ListManga[] {
    return this.mangas.filter(manga => !manga.my_extension?.ongoing);
  }

  get ongoing(): ListManga[] {
    return this.mangas
      .filter(manga => manga.my_extension?.ongoing)
      .sort((a, b) => {
        const textA = a.list_status.updated_at;
        const textB = b.list_status.updated_at;
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });
  }
}

@Component({
  selector: 'app-readlist',
  templateUrl: './readlist.component.html',
  styleUrls: ['./readlist.component.scss'],
})
export class ReadlistComponent {
  @Input() mangas: ListManga[] = [];

  lang = 'en';

  constructor(
    private mangaservice: MangaService,
    private settings: SettingsService,
    private glob: GlobalService,
  ) {
    this.settings.language.subscribe(lang => (this.lang = lang));
  }

  async plusOneVolume(manga: ListManga) {
    if (!manga || manga.busy) return;
    manga.busy = true;
    const currentVolume = manga.list_status?.num_volumes_read || 0;
    const data = {
      num_volumes_read: currentVolume + 1,
    } as Partial<MyMangaUpdate>;
    let completed = false;
    if (manga.node.num_chapters && manga.node.num_volumes) {
      data.num_chapters_read = Math.max(
        manga.list_status?.num_chapters_read || 0,
        Math.floor(((currentVolume + 1) / manga.node.num_volumes) * manga.node.num_chapters),
      );
    }
    if (currentVolume + 1 === manga.node.num_volumes) {
      this.glob.busy();
      data.status = 'completed';
      if (manga.node.num_chapters) data.num_chapters_read = manga.node.num_chapters;
      completed = true;
      if (!manga.list_status?.score) {
        const myScore = Math.round(Number(prompt('Your score (1-10)?')));
        if (myScore > 0 && myScore <= 10) data.score = myScore;
      }
    }
    const statusResponse = await this.mangaservice.updateManga(manga.node.id, data);
    manga.list_status.num_chapters_read = statusResponse.num_chapters_read;
    manga.list_status.num_volumes_read = statusResponse.num_volumes_read;
    manga.busy = false;
    if (statusResponse.status === 'completed') {
      this.mangas = this.mangas.filter(m => m.list_status.status !== 'completed');
    }
    this.glob.notbusy();
  }

  async plusOneChapter(manga: ListManga) {
    if (!manga || manga.busy) return;
    manga.busy = true;
    const currentChapter = manga.list_status?.num_chapters_read || 0;
    const data = {
      num_chapters_read: currentChapter + 1,
    } as Partial<MyMangaUpdate>;
    let completed = false;
    if (currentChapter + 1 === manga.node.num_chapters) {
      this.glob.busy();
      data.status = 'completed';
      if (manga.node.num_volumes) data.num_volumes_read = manga.node.num_volumes;
      completed = true;
      if (!manga.list_status?.score) {
        const myScore = Math.round(Number(prompt('Your score (1-10)?')));
        if (myScore > 0 && myScore <= 10) data.score = myScore;
      }
    }
    const statusResponse = await this.mangaservice.updateManga(manga.node.id, data);
    manga.list_status.num_chapters_read = statusResponse.num_chapters_read;
    manga.list_status.num_volumes_read = statusResponse.num_volumes_read;
    manga.busy = false;
    if (statusResponse.status === 'completed') {
      this.mangas = this.mangas.filter(m => m.list_status.status !== 'completed');
    }
    this.glob.notbusy();
  }
}
