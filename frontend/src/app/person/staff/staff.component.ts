import { Component, Input, OnInit } from '@angular/core';
import { Jikan4PersonAnimes } from '@models/jikan';
import { MalService } from 'src/app/mal.service';

@Component({
  selector: 'myanili-person-staff',
  templateUrl: './staff.component.html',
})
export class PersonStaffComponent implements OnInit {
  @Input() malId!: number;
  credits: Jikan4PersonAnimes = { data: [] };

  constructor(private mal: MalService) {}

  async ngOnInit() {
    const { data } = await this.mal.getJikanData<Jikan4PersonAnimes>(`people/${this.malId}/anime`);
    if (data?.length) {
      this.credits.data = data.sort((a, b) => (a.anime.title < b.anime.title ? -1 : 1));
    }
  }
}
