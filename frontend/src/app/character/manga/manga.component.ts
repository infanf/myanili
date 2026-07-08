import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AnilistCharacterMediaRole } from '@models/anilist';
import { AnilistService } from '@services/anilist.service';

@Component({
  selector: 'myanili-character-manga',
  templateUrl: './manga.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CharacterMangaComponent implements OnInit {
  @Input() characterId!: number;
  roles: AnilistCharacterMediaRole[] = [];

  constructor(private anilist: AnilistService) {}

  async ngOnInit() {
    this.roles = await this.anilist.getCharacterMediaRoles(this.characterId, 'MANGA');
  }
}
