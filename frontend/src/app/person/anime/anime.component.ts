import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AnilistStaffVoiceRole } from '@models/anilist';
import { AnilistService } from '@services/anilist.service';

@Component({
  selector: 'myanili-person-anime',
  styleUrls: ['./anime.component.scss'],
  templateUrl: './anime.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PersonAnimeComponent implements OnInit {
  @Input() personId!: number;
  animes: AnilistStaffVoiceRole[] = [];

  constructor(private anilist: AnilistService) {}

  async ngOnInit() {
    const data = await this.anilist.getPersonVoiceRoles(this.personId);
    this.animes = data.sort((a, b) => (a.media.title < b.media.title ? -1 : 1));
  }
}
