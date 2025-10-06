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
  anisearchLoading = false;

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
    this.anisearchLoading = true;
    try {
      this.glob.busy();
      await this.anisearch.login();
      this.glob.notbusy();
    } finally {
      this.anisearchLoading = false;
    }
  }

  async anisearchLogoff() {
    this.anisearch.logoff();
  }
}
