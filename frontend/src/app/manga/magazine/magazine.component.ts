import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JikanMagazine } from '@models/jikan';
import { GlobalService } from 'src/app/global.service';
import { MalService } from 'src/app/mal.service';

@Component({
  selector: 'app-magazine',
  templateUrl: './magazine.component.html',
  styleUrls: ['./magazine.component.scss'],
})
export class MagazineComponent {
  id = 0;
  magazine?: JikanMagazine;

  constructor(private route: ActivatedRoute, private glob: GlobalService, private mal: MalService) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.magazine;
        this.glob.busy();
        this.magazine = await this.mal.getJikanData<JikanMagazine>('magazine/' + this.id);
        this.glob.notbusy();
        this.glob.setTitle(this.magazine.meta.name);
      }
    });
  }
}
