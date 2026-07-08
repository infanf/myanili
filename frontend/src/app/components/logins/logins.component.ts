import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'myanili-logins',
  templateUrl: './logins.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class LoginsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
