import { Component, Input, OnInit } from '@angular/core';
import { Jikan4PersonMangas } from '@models/jikan';
import { MalService } from '@services/mal.service';

@Component({
  selector: 'myanili-person-manga',
  templateUrl: './manga.component.html',
})
export class PersonMangaComponent implements OnInit {
  @Input() malId!: number;
  mangas: Jikan4PersonMangas = [];

  constructor(private mal: MalService) {}

  async ngOnInit() {
    const data = await this.mal.getJikanData<Jikan4PersonMangas>(`people/${this.malId}/manga`);
    this.mangas = data.sort((a, b) => (a.manga.title < b.manga.title ? -1 : 1));
  }
}
