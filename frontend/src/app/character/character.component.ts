import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JikanCharacter } from '@models/jikan';

import { GlobalService } from '../global.service';
import { MalService } from '../mal.service';

@Component({
  selector: 'myanili-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
})
export class CharacterComponent {
  id = 0;
  character?: JikanCharacter;
  activeTab = 1;

  constructor(private route: ActivatedRoute, private glob: GlobalService, private mal: MalService) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.character;
        this.glob.busy();
        try {
          this.character = await this.mal.getJikanData<JikanCharacter>('character/' + this.id);
          this.character.about = this.character.about.replace(/\\n/g, '').trim();
          this.glob.notbusy();
          this.glob.setTitle(this.character.name);
        } catch (e) {
          this.glob.notbusy();
          this.character = {
            name: 'Failed to load character',
            about: 'Please try again later.',
            nicknames: [],
            voice_actors: [],
            animeography: [],
            mangaography: [],
            image_url: '',
            url: '',
            mal_id: newId,
            member_favorites: 0,
            request_cache_expiry: 0,
            request_cached: false,
            request_hash: '',
          };
        }
      }
    });
  }
}
