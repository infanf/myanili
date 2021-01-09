import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JikanMagazine } from '@models/jikan';
import { GlobalService } from 'src/app/global.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-magazine',
  templateUrl: './magazine.component.html',
  styleUrls: ['./magazine.component.scss'],
})
export class MagazineComponent {
  id = 0;
  magazine?: JikanMagazine;

  constructor(
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private glob: GlobalService,
  ) {
    this.route.paramMap.subscribe(async params => {
      const newId = Number(params.get('id'));
      if (newId !== this.id) {
        this.id = newId;
        delete this.magazine;
        this.glob.busy();
        this.httpClient
          .get<JikanMagazine>(environment.jikanUrl + 'magazine/' + this.id)
          .subscribe(magazine => {
            this.magazine = magazine;
            this.glob.notbusy();
          });
      }
    });
  }
}
