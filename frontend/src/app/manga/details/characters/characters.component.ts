import { Component, Input, OnInit } from '@angular/core';
import { MangaCharacter } from '@models/mal-manga';

import { MangaService } from '../../manga.service';

@Component({
  selector: 'app-manga-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss'],
})
export class MangaCharactersComponent implements OnInit {
  @Input() id!: number;
  characters: MangaCharacter[] = [];
  constructor(private mangaService: MangaService) {}

  async ngOnInit() {
    this.characters = await this.mangaService.getCharacters(this.id);
  }
}
