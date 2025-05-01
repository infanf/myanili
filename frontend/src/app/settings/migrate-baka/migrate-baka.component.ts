import { Component } from '@angular/core';
import { MangaExtension } from '@models/manga';
import { MalService } from '@services/mal.service';
import { MangaService } from '@services/manga/manga.service';
import { MangaupdatesService } from '@services/manga/mangaupdates.service';
import { Base64 } from 'js-base64';

@Component({
  selector: 'myanili-migrate-baka',
  templateUrl: './migrate-baka.component.html',
  standalone: false,
})
export class MigrateBakaComponent {
  icon = 'repeat';
  text = '';
  migrating = false;
  loggedInBaka = false;
  loggedInMal = false;
  constructor(
    private baka: MangaupdatesService,
    private mal: MalService,
    private manga: MangaService,
  ) {
    this.baka.user.subscribe(bakaUser => {
      this.loggedInBaka = Boolean(bakaUser);
    });
    this.mal.user.subscribe(malUser => {
      this.loggedInMal = Boolean(malUser);
    });
  }

  async migrate() {
    if (this.migrating) {
      return;
    }
    this.migrating = true;
    this.icon = 'loading';
    this.text = 'Migrating';
    const malMangas = await this.mal.myMangaList();
    let idx = 0;
    for (const manga of malMangas) {
      this.text = `Migrating ${++idx} / ${malMangas.length}`;
      const chapters = manga.list_status.num_chapters_read;
      const volumes = manga.list_status.num_volumes_read;
      const rating = manga.list_status.score;
      const list = this.baka.statusFromMal(manga.list_status.status);
      if (!list) {
        continue;
      }
      let extension = {} as Partial<MangaExtension>;
      try {
        extension = JSON.parse(
          Base64.decode(manga.list_status.comments) || '{}',
        ) as Partial<MangaExtension>;
      } catch (e) {}
      if (extension.bakaMigrated) continue;
      const bakaId = extension.bakaId
        ? await this.baka.getId(extension.bakaId)
        : await this.baka.getIdFromTitle(manga.node.title, manga.node.start_date);
      if (!bakaId) continue;
      const data = {
        chapters,
        volumes,
        rating,
        list,
      };
      await this.baka.updateSeries(bakaId, data);

      if (bakaId !== extension.bakaId || !extension.bakaMigrated) {
        extension.bakaId = bakaId;
        extension.bakaMigrated = true;
        const comments = Base64.encode(JSON.stringify(extension));
        await this.manga.updateManga(
          { malId: manga.node.id },
          { comments, status: manga.list_status.status || 'plan_to_read' },
        );
      }
    }
    this.migrating = false;
    this.text = '';
    this.icon = 'repeat';
  }

  get loggedIn(): boolean {
    return this.loggedInBaka && this.loggedInMal;
  }
}
