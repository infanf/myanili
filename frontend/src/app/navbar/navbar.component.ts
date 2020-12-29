import { Component, OnInit } from '@angular/core';

import { MalService } from '../mal.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  constructor(public malService: MalService) {}

  ngOnInit(): void {}
}
