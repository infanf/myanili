import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JikanListManga } from '@models/jikan';
import { ListManga, MangaNode, ReadStatus } from '@models/manga';
import { MalUser } from '@models/user';
import { GlobalService } from 'src/app/global.service';
import { MalService } from 'src/app/mal.service';
import { SettingsService } from 'src/app/settings/settings.service';
import { environment } from 'src/environments/environment';

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
    private mal: MalService,
    private httpClient: HttpClient,
  ) {
    this.route.paramMap.subscribe(params => {
      const newStatus = params.get('status') as ReadStatus;
      if (newStatus !== this.status) {
        this.status = newStatus;
        this.mangas = [];
        this.glob.busy();
        this.ngOnInit();
      }
    });
    this.settings.language.subscribe(lang => (this.lang = lang));
  }

  async ngOnInit() {
    this.mangas = await this.mangaService.list(this.status);
    await this.completeMissing();
    this.glob.notbusy();
  }

  getAuthor(manga: MangaNode): string[] {
    return (
      manga.authors?.map(
        author => `${author.node.last_name} ${author.node.first_name} (${author.role})`,
      ) || []
    );
  }

  async completeMissing() {
    const user = (await new Promise(r => this.mal.user.subscribe(r))) as MalUser | undefined;
    if (!user) return;

    let url = environment.jikanUrl + 'user/' + user.name + '/mangalist';
    if (this.status) url += '/' + this.status.replace('_', '');
    const list = (await new Promise(r =>
      this.httpClient.get<{ manga: JikanListManga[] }>(url).subscribe(r),
    )) as { manga: JikanListManga[] };
    await Promise.all(
      list.manga.map(async manga => {
        const existing = this.mangas.map(m => m.node.id);
        if (existing.includes(manga.mal_id)) return;
        const mangaExtended = await this.mangaService.getManga(manga.mal_id, false);
        const existingNow = this.mangas.map(m => m.node.id);
        if (
          existingNow.includes(manga.mal_id) ||
          mangaExtended.my_list_status?.status !== this.status
        ) {
          return;
        }
        this.mangas.push({
          node: {
            id: manga.mal_id,
            title: manga.title,
            alternative_titles: mangaExtended.alternative_titles,
            num_chapters: manga.total_chapters,
            num_volumes: manga.total_volumes,
            authors: mangaExtended.authors,
          },
          list_status: {
            status: mangaExtended.my_list_status?.status,
            comments: '',
            is_rereading: manga.is_rereading,
            num_chapters_read: manga.read_chapters,
            num_times_reread: 0,
            num_volumes_read: manga.read_volumes || 0,
            priority: 0,
            reread_value: 0,
            score: manga.score,
            tags: manga.tags || '',
            updated_at: new Date(),
          },
          my_extension: {
            ongoing: mangaExtended.my_extension?.ongoing,
          },
        });
      }),
    );
    this.mangas.sort((a, b) => {
      const textA = a.node.title.toUpperCase();
      const textB = b.node.title.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });
  }
}
