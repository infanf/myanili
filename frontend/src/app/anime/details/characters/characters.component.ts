import { Component, Input, OnInit } from '@angular/core';
import { AnimeCharacter } from '@models/anime';
import { Jikan4AnimeCharacter } from '@models/jikan';
import { AnimeService } from '@services/anime/anime.service';

@Component({
  selector: 'myanili-anime-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss'],
  standalone: false,
})
export class AnimeCharactersComponent implements OnInit {
  @Input() id!: number;
  characters: Jikan4AnimeCharacter[] = [];
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
