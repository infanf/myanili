import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnilistStaffDetail } from '@models/anilist';
import { AnilistService } from '@services/anilist.service';
import { GlobalService } from '@services/global.service';

@Component({
  selector: 'myanili-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PersonComponent {
  id = 0;
  person?: AnilistStaffDetail;
  activeTab = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private glob: GlobalService,
    private anilist: AnilistService,
  ) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.person;
        this.glob.busy();
        try {
          const person = await this.anilist.getPerson(this.id);
          if (!person) throw new Error('Person not found');
          this.person = person;
          this.glob.notbusy();
          this.glob.setTitle(this.person.name.full);
        } catch (e) {
          this.glob.notbusy();
          this.person = {
            id: newId,
            name: { full: 'Failed to load person' },
            description: 'Please try again later',
          };
        }
      }
    });
  }

  get birthday(): string | undefined {
    const date = this.person?.dateOfBirth;
    if (!date?.month || !date.day) return undefined;
    const parts = [String(date.month).padStart(2, '0'), String(date.day).padStart(2, '0')];
    if (date.year) parts.push(String(date.year));
    return parts.join('/');
  }

  onDescriptionClick(event: MouseEvent) {
    const anchor = (event.target as HTMLElement).closest('a');
    if (!anchor) return;
    event.preventDefault();
    if (anchor.origin === location.origin) {
      this.router.navigateByUrl(anchor.pathname);
    } else {
      window.open(anchor.href, '_blank', 'noopener');
    }
  }
}
