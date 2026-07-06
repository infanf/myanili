import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnilistCharacterDetail } from '@models/anilist';
import { AnilistService } from '@services/anilist.service';
import { GlobalService } from '@services/global.service';

@Component({
  selector: 'myanili-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CharacterComponent {
  id = 0;
  character?: AnilistCharacterDetail;
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
        delete this.character;
        this.glob.busy();
        try {
          const character = await this.anilist.getCharacter(this.id);
          if (!character) throw new Error('Character not found');
          this.character = character;
          this.glob.notbusy();
          this.glob.setTitle(this.character.name.full);
        } catch (e) {
          console.error(e);
          this.glob.notbusy();
          this.character = {
            id: newId,
            name: { full: 'Failed to load character' },
            description: 'Please try again later.',
          };
        }
      }
    });
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
