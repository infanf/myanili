import { Component, Input, OnInit } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-fandom',
  templateUrl: './fandom.component.html',
  styleUrls: ['../icon.component.scss'],
  standalone: false,
})
export class FandomIconComponent extends IconComponent implements OnInit {
  name = 'fandom';
  @Input() url?: string;
  favicon: string | false = false;

  ngOnInit() {
    if (!this.url || !this.url.includes('.')) {
      return;
    }
    const url = new URL(this.url);
    this.favicon = `//${url.hostname}/favicon.ico`;
  }

  setDefault() {
    this.favicon = '/favicon.ico';
  }
}
