import { Component, Input, OnInit } from '@angular/core';
import { Jikan4MangaCharacter } from '@models/jikan';
import { MangaService } from '@services/manga/manga.service';

@Component({
  selector: 'myanili-manga-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss'],
  standalone: false,
})
export class MangaCharactersComponent implements OnInit {
  @Input() id!: number;
  characters: Jikan4MangaCharacter[] = [];
  constructor(private mangaService: MangaService) {}

  ngOnInit() {
    this.mangaService.getCharacters(this.id).then(characters => {
      this.characters = characters;
    });
  }
}
