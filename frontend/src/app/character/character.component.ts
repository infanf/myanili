import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JikanCharacter } from '@models/jikan';
import { environment } from 'src/environments/environment';

import { GlobalService } from '../global.service';

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
})
export class CharacterComponent {
  id = 0;
  character?: JikanCharacter;
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
        delete this.character;
        this.glob.busy();
        this.httpClient
          .get<JikanCharacter>(environment.jikanUrl + 'character/' + this.id)
          .subscribe(character => {
            this.character = character;
            this.character.about = this.character.about.replace(/\\n/g, '').trim();
            this.glob.notbusy();
          });
      }
    });
  }
}
