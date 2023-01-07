import { Component, Input, OnInit } from '@angular/core';
import { Jikan4CharacterVoiceActors } from '@models/jikan';
import { MalService } from '@services/mal.service';

@Component({
  selector: 'myanili-character-voices',
  templateUrl: './voices.component.html',
})
export class CharacterVoicesComponent implements OnInit {
  @Input() malId!: number;
  actors: Jikan4CharacterVoiceActors = [];

  constructor(private mal: MalService) {}

  async ngOnInit() {
    this.actors = await this.mal.getJikanData<Jikan4CharacterVoiceActors>(
      `characters/${this.malId}/voices`,
    );
  }
}
