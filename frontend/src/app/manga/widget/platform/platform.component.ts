import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'myanili-platform',
  templateUrl: './platform.component.html',
})
export class PlatformComponent implements OnInit {
  @Input() provider?: string;
  @Input() publisher?: string;
  publisherFinal?: string;

  ngOnInit() {
    if (this.provider !== 'book') {
      return;
    }
    if (!this.publisher) {
      return;
    }
    this.publisher = this.publisher
      .toLowerCase()
      .replace(/manga\s*$/, '')
      .replace(/\s/g, '');
    const src = `/assets/publisher/${this.publisher}.svg`;
    fetch(src)
      .then(res => {
        if (res.ok) {
          this.publisherFinal = this.publisher;
        }
      })
      .catch();
  }
}
