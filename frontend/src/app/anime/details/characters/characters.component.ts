import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AnilistWorkCharacter } from '@models/anilist';
import { AnimeService } from '@services/anime/anime.service';

@Component({
  selector: 'myanili-anime-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AnimeCharactersComponent implements OnInit {
  @Input() id!: number;
  characters: AnilistWorkCharacter[] = [];
  constructor(private animeService: AnimeService) {}

  async ngOnInit() {
    this.characters = await this.animeService.getCharacters(this.id);
  }

  getVoiceActor(
    character: AnilistWorkCharacter,
  ): { id: number; name: string; image?: string } | undefined {
    const voiceActors = character.voiceActors.filter(actor => actor.language === 'Japanese');
    return voiceActors.length ? voiceActors[0] : undefined;
  }
}
