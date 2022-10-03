import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Jikan4Anime, Jikan4Producer } from '@models/jikan';
import { MalService } from 'src/app/mal.service';

import { GlobalService } from '../../global.service';

@Component({
  selector: 'myanili-producer',
  templateUrl: './producer.component.html',
  styleUrls: ['./producer.component.scss'],
})
export class ProducerComponent {
  id = 0;
  producer?: Jikan4Producer;
  animes: Jikan4Anime[] = [];
  title = 'Loading...';

  constructor(private route: ActivatedRoute, private glob: GlobalService, private mal: MalService) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.producer;
        this.glob.busy();
        try {
          this.producer = await this.mal.getJikanData<Jikan4Producer>(`producers/${this.id}/full`);
          this.title =
            this.producer.titles.find(title => title.type === 'Default')?.title ||
            'Studio not found';
          this.animes = await this.mal.getJikanData<Jikan4Anime[]>(`anime?producer=${this.id}`);
          this.glob.notbusy();
          this.glob.setTitle(this.producer.titles[0].title);
        } catch (e) {
          this.glob.notbusy();
        }
      }
    });
  }
}
