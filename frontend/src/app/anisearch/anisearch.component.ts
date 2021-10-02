import { Component, Input, OnInit } from '@angular/core';
import { AnisearchAnimeList } from '@models/anisearch';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AnisearchService } from '../anisearch.service';

@Component({
  selector: 'app-anisearch',
  templateUrl: './anisearch.component.html',
  styleUrls: ['./anisearch.component.scss'],
})
export class AnisearchComponent implements OnInit {
  @Input() query = '';
  results?: AnisearchAnimeList;

  constructor(public modal: NgbActiveModal, private anisearch: AnisearchService) {}

  async ngOnInit() {
    this.results = await this.anisearch.getAnimes(this.query);
  }
}
