import { Component, Input, OnInit } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'app-icon-fandom',
  templateUrl: './fandom.component.html',
  styleUrls: ['../icon.component.scss'],
})
export class FandomIconComponent extends IconComponent implements OnInit {
  name = 'fandom';
  @Input() url?: string;
  favicon: string | false = false;

  ngOnInit() {
    if (!this.url || !this.url.includes('.')) {
      return;
    }
    const url = `//${this.url}/favicon.ico`;
    this.favicon = url;
  }
}
