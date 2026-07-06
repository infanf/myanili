import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AnilistStaffMediaRole } from '@models/anilist';
import { AnilistService } from '@services/anilist.service';

@Component({
  selector: 'myanili-person-staff',
  templateUrl: './staff.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PersonStaffComponent implements OnInit {
  @Input() personId!: number;
  credits: AnilistStaffMediaRole[] = [];

  constructor(private anilist: AnilistService) {}

  async ngOnInit() {
    const data = await this.anilist.getPersonMediaRoles(this.personId, 'ANIME');
    if (data?.length) {
      this.credits = data.sort((a, b) => (a.media.title < b.media.title ? -1 : 1));
    }
  }
}
