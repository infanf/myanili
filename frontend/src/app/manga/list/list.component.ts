import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListManga, MangaNode, ReadStatus } from '@models/mal-manga';
import { GlobalService } from 'src/app/global.service';
import { SettingsService } from 'src/app/settings/settings.service';

import { MangaService } from '../manga.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class MangaListComponent implements OnInit {
  @Input() status?: ReadStatus;
  mangas: ListManga[] = [];

  lang = 'en';

  constructor(
    private mangaService: MangaService,
    private route: ActivatedRoute,
    private settings: SettingsService,
    private glob: GlobalService,
  ) {
    this.settings.language.subscribe(lang => (this.lang = lang));
  }

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const newStatus = params.get('status') as ReadStatus;
      if (newStatus !== this.status) {
        this.status = newStatus;
        this.mangas = [];
        this.glob.setTitle(`Readlist – ${newStatus}`);
        this.glob.busy();
        this.mangas = await this.mangaService.list(this.status);
        this.glob.notbusy();
      }
    });
  }

  getAuthor(manga: MangaNode): string[] {
    return (
      manga.authors?.map(
        author => `${author.node.last_name} ${author.node.first_name} (${author.role})`,
      ) || []
    );
  }
}
