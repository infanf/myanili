import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'myanili-person-manga',
  templateUrl: './manga.component.html',
})
export class PersonMangaComponent implements OnInit {
  @Input() malId!: number;

  constructor() {}

  ngOnInit(): void {}
}
