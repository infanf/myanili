import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JikanPerson } from '@models/jikan';
import { environment } from 'src/environments/environment';

import { GlobalService } from '../global.service';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss'],
})
export class PersonComponent {
  id = 0;
  person?: JikanPerson;
  activeTab = 1;

  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private glob: GlobalService,
  ) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.person;
        this.glob.busy();
        this.httpClient
          .get<JikanPerson>(environment.jikanUrl + 'person/' + this.id)
          .subscribe(person => {
            this.person = person;
            this.person.about = (this.person.about || '').replace(/\\n/g, '').trim();
            this.glob.notbusy();
            this.glob.setTitle(person.name);
          });
      }
    });
  }
}
