import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Jikan4Anime, Jikan4Producer } from '@models/jikan';
import { GlobalService } from '@services/global.service';
import { MalService } from '@services/mal.service';

@Component({
  selector: 'myanili-producer',
  templateUrl: './producer.component.html',
  styleUrls: ['./producer.component.scss'],
  standalone: false,
})
export class ProducerComponent {
  id = 0;
  producer?: Jikan4Producer;
  animes: Jikan4Anime[] = [];
  title = 'Loading...';

  constructor(
    private route: ActivatedRoute,
    private glob: GlobalService,
    private mal: MalService,
  ) {
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
          let page = 2;
          while (this.animes.length < this.producer.count) {
            const animes = await this.mal.getJikanData<Jikan4Anime[]>(
              `anime?producer=${this.id}&page=${page}`,
            );
            if (!animes.length) break;
            this.animes.push(...animes);
            page++;
          }
          this.glob.notbusy();
          this.glob.setTitle(this.producer.titles[0].title);
        } catch (e) {
          this.glob.notbusy();
        }
      }
    });
  }
}
