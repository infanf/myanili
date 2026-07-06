import { Component, Input, OnInit } from '@angular/core';
import { AnilistCharacterVoiceActor } from '@models/anilist';
import { AnilistService } from '@services/anilist.service';

@Component({
  selector: 'myanili-character-voices',
  templateUrl: './voices.component.html',
  standalone: false,
})
export class CharacterVoicesComponent implements OnInit {
  @Input() characterId!: number;
  actors: AnilistCharacterVoiceActor[] = [];

  constructor(private anilist: AnilistService) {}

  async ngOnInit() {
    this.actors = await this.anilist.getCharacterVoiceActors(this.characterId);
  }
}
