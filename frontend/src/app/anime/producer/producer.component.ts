import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnilistMediaRef, AnilistStudioDetail } from '@models/anilist';
import { AnilistService } from '@services/anilist.service';
import { GlobalService } from '@services/global.service';

@Component({
  selector: 'myanili-producer',
  templateUrl: './producer.component.html',
  styleUrls: ['./producer.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ProducerComponent {
  name = '';
  producer?: AnilistStudioDetail;
  animes: AnilistMediaRef[] = [];
  title = 'Loading...';

  constructor(
    private route: ActivatedRoute,
    private glob: GlobalService,
    private anilist: AnilistService,
  ) {
    this.route.paramMap.subscribe(async params => {
      const newName = params.get('id') || '';
      if (newName !== this.name) {
        this.name = newName;
        delete this.producer;
        this.animes = [];
        this.glob.busy();
        try {
          this.producer = await this.anilist.findStudioByName(this.name);
          if (!this.producer) throw new Error('Studio not found');
          this.title = this.producer.name;
          this.animes = await this.anilist.getStudioMedia(this.producer.id);
          this.glob.notbusy();
          this.glob.setTitle(this.title);
        } catch (e) {
          this.title = 'Studio not found';
          this.glob.notbusy();
        }
      }
    });
  }
}
