import { Component, Input, OnInit } from '@angular/core';
import { Jikan4CharacterRoles } from '@models/jikan';
import { MalService } from 'src/app/mal.service';

@Component({
  selector: 'myanili-character-anime',
  templateUrl: './anime.component.html',
})
export class AnimeComponent implements OnInit {
  @Input() malId!: number;
  roles: Jikan4CharacterRoles = { data: [] };

  constructor(private mal: MalService) {}

  async ngOnInit() {
    this.roles = await this.mal.getJikanData<Jikan4CharacterRoles>(
      `characters/${this.malId}/anime`,
    );
  }
}
