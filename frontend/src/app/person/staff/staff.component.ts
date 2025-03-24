import { Component, Input, OnInit } from '@angular/core';
import { Jikan4PersonAnimes } from '@models/jikan';
import { MalService } from '@services/mal.service';

@Component({
  selector: 'myanili-person-staff',
  templateUrl: './staff.component.html',
  standalone: false,
})
export class PersonStaffComponent implements OnInit {
  @Input() malId!: number;
  credits: Jikan4PersonAnimes = [];

  constructor(private mal: MalService) {}

  async ngOnInit() {
    const data = await this.mal.getJikanData<Jikan4PersonAnimes>(`people/${this.malId}/anime`);
    if (data?.length) {
      this.credits = data.sort((a, b) => (a.anime.title < b.anime.title ? -1 : 1));
    }
  }
}
