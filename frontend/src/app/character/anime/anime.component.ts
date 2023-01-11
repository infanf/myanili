import { Component, Input, OnInit } from '@angular/core';
import { Jikan4CharacterAnimeRoles } from '@models/jikan';
import { MalService } from '@services/mal.service';

@Component({
  selector: 'myanili-character-anime',
  templateUrl: './anime.component.html',
})
export class CharacterAnimeComponent implements OnInit {
  @Input() malId!: number;
  roles: Jikan4CharacterAnimeRoles = [];

  constructor(private mal: MalService) {}

  async ngOnInit() {
    this.roles = await this.mal.getJikanData<Jikan4CharacterAnimeRoles>(
      `characters/${this.malId}/anime`,
    );
  }
}
