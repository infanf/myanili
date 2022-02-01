import { Component, Input, OnInit } from '@angular/core';
import { MalService } from 'src/app/mal.service';

@Component({
  selector: 'myanili-person-anime',
  templateUrl: './anime.component.html',
})
export class PersonAnimeComponent implements OnInit {
  @Input() malId!: number;

  constructor(private mal: MalService) {}

  async ngOnInit() {
    await this.mal.getJikanData(`people/${this.malId}/voices`);
  }
}
