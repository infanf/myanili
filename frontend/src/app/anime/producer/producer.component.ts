import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JikanProducer } from '@models/jikan';
import { MalService } from 'src/app/mal.service';

import { GlobalService } from '../../global.service';

@Component({
  selector: 'app-producer',
  templateUrl: './producer.component.html',
  styleUrls: ['./producer.component.scss'],
})
export class ProducerComponent {
  id = 0;
  producer?: JikanProducer;

  constructor(private route: ActivatedRoute, private glob: GlobalService, private mal: MalService) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.producer;
        this.glob.busy();
        try {
          this.producer = await this.mal.getJikanData<JikanProducer>('producer/' + this.id);
          this.glob.notbusy();
          this.glob.setTitle(this.producer.meta.name);
        } catch (e) {
          this.glob.notbusy();
          this.producer = {
            anime: [],
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
