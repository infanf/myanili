import { Component, Input, OnInit } from '@angular/core';
import { Jikan4Staff } from '@models/jikan';
import { AnimeService } from '@services/anime/anime.service';

@Component({
  selector: 'myanili-anime-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss'],
  standalone: false,
})
export class StaffComponent implements OnInit {
  @Input() id!: number;
  persons: Jikan4Staff[] = [];
  constructor(private animeService: AnimeService) {}

  async ngOnInit() {
    this.persons = await this.animeService.getStaff(this.id);
  }
}
