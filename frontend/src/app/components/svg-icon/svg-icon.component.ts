import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'myanili-svg-icon',
  templateUrl: './svg-icon.component.html',
  standalone: false,
})
export class MySvgIconComponent implements OnInit {
  @Input() src!: string;
  // tslint:disable-next-line: no-any
  @Input() svgStyle?: any;
  @Input() alt?: string;
  exists = false;

  ngOnInit() {
    this.src = this.src.toLowerCase().replace(/\s/g, '');
    fetch(this.src)
      .then(res => {
        this.exists = res.ok;
      })
      .catch(() => {
        this.exists = false;
      });
  }
}
