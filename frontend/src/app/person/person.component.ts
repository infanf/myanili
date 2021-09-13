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
        this.person = await this.mal.getJikanData<JikanPerson>('person/' + this.id);
        this.person.about = (this.person.about || '').replace(/\\n/g, '').trim();
        this.glob.notbusy();
        this.glob.setTitle(this.person.name);
      }
    });
  }
}
