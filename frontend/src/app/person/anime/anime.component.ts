import { Component, Input, OnInit } from '@angular/core';
import { Jikan4PersonRoles } from '@models/jikan';
import { MalService } from 'src/app/mal.service';

@Component({
  selector: 'myanili-person-anime',
  styleUrls: ['./anime.component.scss'],
  templateUrl: './anime.component.html',
})
export class PersonAnimeComponent implements OnInit {
  @Input() malId!: number;
  animes: Jikan4PersonRoles = { data: [] };

  constructor(private mal: MalService) {}

  async ngOnInit() {
    const { data } = await this.mal.getJikanData<Jikan4PersonRoles>(`people/${this.malId}/voices`);
    this.animes.data = data.sort((a, b) => (a.anime.title < b.anime.title ? -1 : 1));
  }
}
