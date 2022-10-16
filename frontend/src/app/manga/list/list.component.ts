import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListManga, ReadStatus } from '@models/manga';
import { GlobalService } from 'src/app/global.service';
import { SettingsService } from 'src/app/settings/settings.service';

import { MangaService } from '../manga.service';

@Component({
  selector: 'myanili-list',
  templateUrl: './list.component.html',
})
export class MangaListComponent implements OnInit {
  @Input() status?: ReadStatus;
  mangas: ListManga[] = [];
  nextMangas: ListManga[] = [];
  loadedAll = false;
  loading = false;

  layout = 'list';
  lang = 'en';

  constructor(
    private mangaService: MangaService,
    private route: ActivatedRoute,
    private settings: SettingsService,
    private glob: GlobalService,
  ) {
    this.settings.language.subscribe(lang => (this.lang = lang));
    this.settings.layout.subscribe(layout => (this.layout = layout));
  }

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const newStatus = params.get('status') as ReadStatus;
      if (newStatus !== this.status) {
        this.status = newStatus;
        this.mangas = [];
        this.glob.setTitle(`Bookshelf – ${newStatus.replace(/_/g, ' ')}`);
        this.glob.busy();
        this.loadedAll = false;
        this.nextMangas = await this.mangaService.list(this.status, { limit: 50 });
        this.loadMore();
        this.glob.notbusy();
      }
    });
  }

  async handleScroll(event: { target: Element; visible: boolean }) {
    if (!event.visible) return;
    let maxTries = 50;
    while (this.loading && maxTries-- > 0) {
      await this.glob.sleep(100);
    }
    this.loadMore();
  }

  async loadMore() {
    if (this.nextMangas.length < 20) this.loadedAll = true;
    this.mangas.push(...this.nextMangas);
    this.nextMangas = [];
    if (this.loadedAll || this.loading) return;
    this.loading = true;
    this.nextMangas = await this.mangaService.list(this.status, {
      limit: 20,
      offset: this.mangas.length,
    });
    this.loading = false;
  }
}
