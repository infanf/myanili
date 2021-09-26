import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MainService } from '@models/components';
import { JikanCharacter } from '@models/jikan';

import { GlobalService } from '../global.service';
import { MalService } from '../mal.service';

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
})
export class CharacterComponent {
  @Input() id = 0;
  @Input() service: MainService = 'mal';
  character?: JikanCharacter;
  activeTab = 1;

  constructor(private route: ActivatedRoute, private glob: GlobalService, private mal: MalService) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.character;
        this.glob.busy();
        this.character = await this.mal.getJikanData<JikanCharacter>('character/' + this.id);
        this.character.about = this.character.about.replace(/\\n/g, '').trim();
        this.glob.notbusy();
        this.glob.setTitle(this.character.name);
      }
    });
  }
}
