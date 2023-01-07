import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JikanMagazine } from '@models/jikan';
import { GlobalService } from '@services/global.service';
import { MalService } from '@services/mal.service';

@Component({
  selector: 'myanili-magazine',
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
        try {
          this.magazine = await this.mal.getJikanData<JikanMagazine>('magazine/' + this.id);
          this.glob.notbusy();
          this.glob.setTitle(this.magazine.meta.name);
        } catch (e) {
          this.glob.notbusy();
          this.magazine = {
            manga: [],
            request_hash: '',
            request_cached: false,
            request_cache_expiry: 0,
            meta: {
              mal_id: 0,
              name: 'Failed to load magazine',
              type: '',
              url: '',
            },
          };
        }
      }
    });
  }
}
