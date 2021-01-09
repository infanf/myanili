import { Component, Input, OnInit } from '@angular/core';
import { AnimeStaff } from '@models/anime';

import { AnimeService } from '../../anime.service';

@Component({
  selector: 'app-anime-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss'],
})
export class StaffComponent implements OnInit {
  @Input() id!: number;
  persons: AnimeStaff[] = [];
  constructor(private animeService: AnimeService) {}

  async ngOnInit() {
    this.persons = await this.animeService.getStaff(this.id);
  }
}
