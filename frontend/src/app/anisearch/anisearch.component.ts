import { Component, Input, OnInit } from '@angular/core';
import { AnisearchList } from '@models/anisearch';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AnisearchService } from '../anisearch.service';

@Component({
  selector: 'app-anisearch',
  templateUrl: './anisearch.component.html',
  styleUrls: ['./anisearch.component.scss'],
})
export class AnisearchComponent implements OnInit {
  @Input() query = '';
  @Input() type: 'anime' | 'manga' = 'anime';
  results?: AnisearchList;

  constructor(public modal: NgbActiveModal, private anisearch: AnisearchService) {}

  async ngOnInit() {
    this.results =
      this.type === 'anime'
        ? await this.anisearch.getAnimes(this.query)
        : await this.anisearch.getMangas(this.query);
  }
}
