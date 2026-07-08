import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AnilistWorkCharacter } from '@models/anilist';
import { MangaService } from '@services/manga/manga.service';

@Component({
  selector: 'myanili-manga-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class MangaCharactersComponent implements OnInit {
  @Input() id!: number;
  characters: AnilistWorkCharacter[] = [];
  constructor(private mangaService: MangaService) {}

  ngOnInit() {
    this.mangaService.getCharacters(this.id).then(characters => {
      this.characters = characters;
    });
  }
}
