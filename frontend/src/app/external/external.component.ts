import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-external',
  templateUrl: './external.component.html',
  styleUrls: ['./external.component.scss'],
})
export class ExternalComponent implements OnInit {
  @Input() title?: string;
  nodes: Node[] = [];

  constructor(public modal: NgbActiveModal) {}

  async ngOnInit() {}
}

interface Node {
  title: string;
  year?: number;
  id: string | number;
  url: string;
}
