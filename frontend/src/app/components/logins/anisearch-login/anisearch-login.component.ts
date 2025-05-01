import { Component, OnInit } from '@angular/core';
import { AnisearchService, AnisearchUser } from '@services/anisearch.service';
import { GlobalService } from '@services/global.service';

@Component({
  selector: 'myanili-anisearch-login',
  templateUrl: './anisearch-login.component.html',
  standalone: false,
})
export class AnisearchLoginComponent implements OnInit {
  anisearchLoggedIn?: AnisearchUser;

  constructor(
    private anisearch: AnisearchService,
    private glob: GlobalService,
  ) {
    // Listen for MAL logoff event to also log off from this service
    window.addEventListener('myanili-mal-logoff', () => {
      this.anisearchLogoff();
    });
  }

  ngOnInit() {
    this.anisearch.user.subscribe(user => {
      this.anisearchLoggedIn = user;
    });
  }

  async anisearchConnect() {
    this.glob.busy();
    await this.anisearch.login();
    this.glob.notbusy();
  }

  async anisearchLogoff() {
    this.anisearch.logoff();
  }
}
