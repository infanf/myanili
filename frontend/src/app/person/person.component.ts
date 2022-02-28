import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Jikan4Person } from '@models/jikan';

import { GlobalService } from '../global.service';
import { MalService } from '../mal.service';

@Component({
  selector: 'myanili-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss'],
})
export class PersonComponent {
  id = 0;
  person?: Jikan4Person;
  activeTab = 1;

  constructor(private route: ActivatedRoute, private glob: GlobalService, private mal: MalService) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.person;
        this.glob.busy();
        try {
          this.person = await this.mal.getJikanData<Jikan4Person>('people/' + this.id);
          this.person.data.about = (this.person.data.about || '').replace(/\\n/g, '').trim();
          this.glob.notbusy();
          this.glob.setTitle(this.person.data.name);
        } catch (e) {
          this.glob.notbusy();
          this.person = {
            data: {
              name: 'Failed to load person',
              about: 'Please try again later',
              url: '',
              mal_id: newId,
              alternate_names: [],
              favorites: 0,
            },
          };
        }
      }
    });
  }
}
