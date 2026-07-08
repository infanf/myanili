import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AnilistWorkStaff } from '@models/anilist';
import { AnimeService } from '@services/anime/anime.service';

@Component({
  selector: 'myanili-anime-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class StaffComponent implements OnInit {
  @Input() id!: number;
  persons: AnilistWorkStaff[] = [];
  constructor(private animeService: AnimeService) {}

  async ngOnInit() {
    this.persons = await this.animeService.getStaff(this.id);
  }
}
