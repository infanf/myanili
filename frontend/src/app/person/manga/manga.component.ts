import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AnilistStaffMediaRole } from '@models/anilist';
import { AnilistService } from '@services/anilist.service';

@Component({
  selector: 'myanili-person-manga',
  templateUrl: './manga.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PersonMangaComponent implements OnInit {
  @Input() personId!: number;
  mangas: AnilistStaffMediaRole[] = [];

  constructor(private anilist: AnilistService) {}

  async ngOnInit() {
    const data = await this.anilist.getPersonMediaRoles(this.personId, 'MANGA');
    this.mangas = data.sort((a, b) => (a.media.title < b.media.title ? -1 : 1));
  }
}
