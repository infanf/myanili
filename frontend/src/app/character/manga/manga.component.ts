import { Component, Input, OnInit } from '@angular/core';
import { Jikan4CharacterMangaRoles } from '@models/jikan';
import { MalService } from '@services/mal.service';

@Component({
  selector: 'myanili-character-manga',
  templateUrl: './manga.component.html',
  standalone: false,
})
export class CharacterMangaComponent implements OnInit {
  @Input() malId!: number;
  roles: Jikan4CharacterMangaRoles = [];

  constructor(private mal: MalService) {}

  async ngOnInit() {
    this.roles = await this.mal.getJikanData<Jikan4CharacterMangaRoles>(
      `characters/${this.malId}/manga`,
    );
  }
}
