import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JikanPerson } from '@models/jikan';

import { GlobalService } from '../global.service';
import { MalService } from '../mal.service';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss'],
})
export class PersonComponent {
  id = 0;
  person?: JikanPerson;
  activeTab = 1;

  constructor(private route: ActivatedRoute, private glob: GlobalService, private mal: MalService) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.person;
        this.glob.busy();
        try {
          this.person = await this.mal.getJikanData<JikanPerson>('person/' + this.id);
          this.person.about = (this.person.about || '').replace(/\\n/g, '').trim();
          this.glob.notbusy();
          this.glob.setTitle(this.person.name);
        } catch (e) {
          this.glob.notbusy();
          this.person = {
            name: 'Failed to load person',
            about: 'Please try again later',
            image_url: '',
            url: '',
            mal_id: newId,
            alternate_names: [],
            member_favorites: 0,
            voice_acting_roles: [],
            anime_staff_positions: [],
            published_manga: [],
            request_cache_expiry: 0,
            request_cached: false,
            request_hash: '',
          };
        }
      }
    });
  }
}
