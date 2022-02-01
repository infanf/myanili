import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'myanili-person-staff',
  templateUrl: './staff.component.html',
})
export class PersonStaffComponent implements OnInit {
  @Input() malId!: number;

  constructor() {}

  ngOnInit(): void {}
}
