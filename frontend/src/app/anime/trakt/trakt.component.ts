import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Show, TraktService } from '../trakt.service';

@Component({
  selector: 'app-trakt',
  templateUrl: './trakt.component.html',
  styleUrls: ['./trakt.component.scss'],
})
export class TraktComponent implements OnInit {
  @Input() title?: string;
  shows: Show[] = [];

  constructor(public modal: NgbActiveModal, private trakt: TraktService) {}

  async ngOnInit() {
    if (this.title) this.shows = await this.trakt.search(this.title);
  }
}
