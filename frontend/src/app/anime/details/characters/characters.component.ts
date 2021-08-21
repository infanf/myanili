import { Component, Input, OnInit } from '@angular/core';
import { AnimeCharacter } from '@models/mal-anime';

import { AnimeService } from '../../anime.service';

@Component({
  selector: 'app-anime-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss'],
})
export class AnimeCharactersComponent implements OnInit {
  @Input() id!: number;
  characters: AnimeCharacter[] = [];
  constructor(private animeService: AnimeService) {}

  async ngOnInit() {
    this.characters = await this.animeService.getCharacters(this.id);
  }

  getVoiceActor(character: AnimeCharacter):
    | {
        mal_id: number;
        name: string;
        image_url?: string;
      }
    | undefined {
    const voiceActors = character.voice_actors.filter(actor => actor.language === 'Japanese');
    return voiceActors.length ? voiceActors[0] : undefined;
  }
}
