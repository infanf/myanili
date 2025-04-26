import { Component, OnInit } from '@angular/core';
import { AnnictService } from '@services/anime/annict.service';
import { GlobalService } from '@services/global.service';

@Component({
  selector: 'myanili-annict-login',
  templateUrl: './annict-login.component.html',
  standalone: false,
})
export class AnnictLoginComponent implements OnInit {
  annictLoggedIn?: string;

  constructor(
    private annict: AnnictService,
    private glob: GlobalService,
  ) {
    // Listen for MAL logoff event to also log off from this service
    window.addEventListener('myanili-mal-logoff', () => {
      this.annictLogoff();
    });
  }

  ngOnInit() {
    this.annict.user.subscribe(user => {
      this.annictLoggedIn = user;
    });
  }

  async annictConnect() {
    this.glob.busy();
    await this.annict.login();
    this.glob.notbusy();
  }

  async annictLogoff() {
    this.annict.logoff();
  }
}
