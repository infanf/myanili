import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'myanili-external',
  templateUrl: './external.component.html',
  styleUrls: ['./external.component.scss'],
})
export class ExternalComponent implements OnInit {
  @Input() title?: string;
  nodes: Node[] = [];
  searching = false;

  constructor(public modal: NgbActiveModal) {}

  async ngOnInit() {}
}

interface Node {
  id: string | number;
  title: string;
  year?: number;
  poster?: string;
  description?: string;
  genres?: string[];
  url: string;
}
