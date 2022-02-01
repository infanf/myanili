import { Component, Input, OnInit } from '@angular/core';
import { Jikan4CharacterMangaRoles } from '@models/jikan';
import { MalService } from 'src/app/mal.service';

@Component({
  selector: 'myanili-character-manga',
  templateUrl: './manga.component.html',
})
export class CharacterMangaComponent implements OnInit {
  @Input() malId!: number;
  roles: Jikan4CharacterMangaRoles = { data: [] };

  constructor(private mal: MalService) {}

  async ngOnInit() {
    this.roles = await this.mal.getJikanData<Jikan4CharacterMangaRoles>(
      `characters/${this.malId}/manga`,
    );
  }
}
