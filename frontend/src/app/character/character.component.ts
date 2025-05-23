import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Jikan4Character } from '@models/jikan';
import { GlobalService } from '@services/global.service';
import { MalService } from '@services/mal.service';

@Component({
  selector: 'myanili-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
  standalone: false,
})
export class CharacterComponent {
  id = 0;
  character?: Jikan4Character;
  activeTab = 1;

  constructor(
    private route: ActivatedRoute,
    private glob: GlobalService,
    private mal: MalService,
  ) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.character;
        this.glob.busy();
        try {
          this.character = await this.mal.getJikanData<Jikan4Character>('characters/' + this.id);
          this.character.about = this.character.about?.replace(/\\n/g, '').trim();
          this.glob.notbusy();
          this.glob.setTitle(this.character.name);
        } catch (e) {
          console.error(e);
          this.glob.notbusy();
          this.character = {
            name: 'Failed to load character',
            about: 'Please try again later.',
            nicknames: [],
            url: '',
            mal_id: newId,
            favorites: 0,
          };
        }
      }
    });
  }
}
