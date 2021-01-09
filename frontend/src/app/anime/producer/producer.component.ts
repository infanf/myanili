import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JikanProducer } from '@models/jikan';
import { environment } from 'src/environments/environment';

import { GlobalService } from '../../global.service';

@Component({
  selector: 'app-producer',
  templateUrl: './producer.component.html',
  styleUrls: ['./producer.component.scss'],
})
export class ProducerComponent {
  id = 0;
  producer?: JikanProducer;

  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private glob: GlobalService,
  ) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.producer;
        this.glob.busy();
        this.httpClient
          .get<JikanProducer>(environment.jikanUrl + 'producer/' + this.id)
          .subscribe(producer => {
            this.producer = producer;
            this.glob.notbusy();
          });
      }
    });
  }
}
