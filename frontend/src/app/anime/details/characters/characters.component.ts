import { Component, Input, OnInit } from '@angular/core';
import { MainService } from '@models/components';
import { MediaCharacter } from '@models/media';

import { AnimeService } from '../../anime.service';

@Component({
  selector: 'app-anime-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss'],
})
export class AnimeCharactersComponent implements OnInit {
  @Input() id!: number;
  @Input() service: MainService = 'mal';
  characters: MediaCharacter[] = [];
  constructor(private animeService: AnimeService) {}

  async ngOnInit() {
    this.characters = await this.animeService.getCharacters(this.id, this.service);
  }

  getVoiceActor(character: MediaCharacter):
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
