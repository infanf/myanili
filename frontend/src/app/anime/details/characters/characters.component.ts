import { Component, Input, OnInit } from '@angular/core';
import { AnimeCharacter } from '@models/anime';

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
}
