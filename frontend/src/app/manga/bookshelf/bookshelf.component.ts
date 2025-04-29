import { Component, Input, OnInit } from '@angular/core';
import { Weekday } from '@models/components';
import { ListManga, MyMangaUpdate, ReadStatus } from '@models/manga';
import { DialogueService } from '@services/dialogue.service';
import { GlobalService } from '@services/global.service';
import { MangaService } from '@services/manga/manga.service';
import { MangadexService } from '@services/manga/mangadex.service';
import { SettingsService } from '@services/settings.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'myanili-bookshelf-wrapper',
  templateUrl: './bookshelf-wrapper.component.html',
  styles: [],
  standalone: false,
})
export class BookshelfWrapperComponent implements OnInit {
  mangas: ListManga[] = [];

  constructor(
    private mangaservice: MangaService,
    private glob: GlobalService,
  ) {
    this.glob.setTitle('Bookshelf');
  }

  async ngOnInit() {
    this.glob.busy();
    this.mangas = (await this.mangaservice.list('reading', { limit: 1000 })).filter(
      manga => !manga.my_extension?.hideShelf,
    );
    this.glob.notbusy();
  }

  get reading(): ListManga[] {
    return this.mangas.filter(manga => !manga.my_extension?.ongoing).sort(defaultSort);
  }

  get ongoing(): ListManga[] {
    return this.mangas.filter(manga => manga.my_extension?.ongoing).sort(defaultSort);
  }

  get simulpub(): ListManga[] {
    const now = new Date();
    const weekday = (now.getHours() < 8 ? (now.getDay() + 6) % 7 : now.getDay()) as Weekday;
    return this.mangas
      .filter(manga => manga.my_extension?.simulpub?.includes(weekday))
      .sort(defaultSort);
  }
}

function defaultSort(a: ListManga, b: ListManga) {
  const textA = a.my_extension?.displayName || a.node.title;
  const textB = b.my_extension?.displayName || b.node.title;
  return textA < textB ? -1 : textA > textB ? 1 : 0;
}

@Component({
  selector: '[myanili-bookshelf]',
  templateUrl: './bookshelf.component.html',
  standalone: false,
})
export class BookshelfComponent {
  @Input() mangas: ListManga[] = [];

  constructor(
    private mangaservice: MangaService,
    private mangadex: MangadexService,
    public settings: SettingsService,
    private glob: GlobalService,
    private dialogue: DialogueService,
  ) {}

  async plusOneVolume(manga: ListManga) {
    if (!manga || manga.busy) return;
    manga.busy = true;
    const currentVolume = manga.list_status?.num_volumes_read || 0;
    const currentChapter = manga.list_status?.num_chapters_read || 0;
    const data = {
      num_volumes_read: currentVolume + 1,
      status: manga.list_status.status,
    } as Partial<MyMangaUpdate> & { status: ReadStatus };
    const mdId = manga.my_extension?.mdId;
    data.num_volumes_read = currentVolume + 1;
    if (mdId) {
      const chapters = await this.mangadex.getChapter(mdId, currentVolume + 1);
      if (chapters?.last) {
        data.num_chapters_read = Math.floor(Math.max(chapters.last, currentChapter));
      }
    }
    if (manga.node.num_chapters && manga.node.num_volumes && !data.num_chapters_read) {
      data.num_chapters_read = Math.max(
        manga.list_status?.num_chapters_read || 0,
        Math.floor(((currentVolume + 1) / manga.node.num_volumes) * manga.node.num_chapters),
      );
    }
    if (currentVolume + 1 === manga.node.num_volumes) {
      this.glob.busy();
      data.status = 'completed';
      data.finish_date = manga.list_status.finish_date || DateTime.local().toISODate() || undefined;
      if (manga.node.num_chapters) data.num_chapters_read = manga.node.num_chapters;
      if (!manga.list_status?.score) {
        const myScore = await this.dialogue.rating(manga.node.title);
        if (myScore > 0 && myScore <= 10) data.score = myScore;
      }
    }
    const statusResponse = await this.mangaservice.updateManga(
      {
        malId: manga.node.id,
        anilistId: manga.my_extension?.anilistId,
        kitsuId: manga.my_extension?.kitsuId,
        anisearchId: manga.my_extension?.anisearchId,
        bakaId: manga.my_extension?.bakaId,
      },
      data,
    );
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
    const currentVolume = manga.list_status?.num_volumes_read || 0;
    const data = {
      num_chapters_read: currentChapter + 1,
      status: manga.list_status.status,
    } as Partial<MyMangaUpdate> & { status: ReadStatus };
    const mdId = manga.my_extension?.mdId;
    data.num_chapters_read = currentChapter + 1;
    if (mdId) {
      const volume = await this.mangadex.getVolume(mdId, currentChapter + 1);
      if (volume?.last) {
        data.num_volumes_read = Math.max(volume.volume, currentVolume);
      }
    }
    if (currentChapter + 1 === manga.node.num_chapters) {
      this.glob.busy();
      data.status = 'completed';
      data.finish_date = manga.list_status.finish_date || DateTime.local().toISODate() || undefined;
      if (manga.node.num_volumes) data.num_volumes_read = manga.node.num_volumes;
      if (!manga.list_status?.score) {
        const myScore = await this.dialogue.rating(manga.node.title);
        if (myScore > 0 && myScore <= 10) data.score = myScore;
      }
    }
    const statusResponse = await this.mangaservice.updateManga(
      {
        malId: manga.node.id,
        anilistId: manga.my_extension?.anilistId,
        kitsuId: manga.my_extension?.kitsuId,
        anisearchId: manga.my_extension?.anisearchId,
        bakaId: manga.my_extension?.bakaId,
      },
      data,
    );
    manga.list_status.num_chapters_read = statusResponse.num_chapters_read;
    manga.list_status.num_volumes_read = statusResponse.num_volumes_read;
    manga.busy = false;
    if (statusResponse.status === 'completed') {
      this.mangas = this.mangas.filter(m => m.list_status.status !== 'completed');
    }
    this.glob.notbusy();
  }
}
