import { Component, OnInit } from '@angular/core';
import { LivechartService } from '@services/anime/livechart.service';
import { GlobalService } from '@services/global.service';

@Component({
  selector: 'myanili-livechart-login',
  templateUrl: './livechart-login.component.html',
  standalone: false,
})
export class LivechartLoginComponent implements OnInit {
  livechartLoggedIn?: string;
  livechartData?: { username: string; password: string; saveLogin: boolean };

  constructor(
    private livechart: LivechartService,
    private glob: GlobalService,
  ) {
    // Listen for MAL logoff event to also log off from this service
    window.addEventListener('myanili-mal-logoff', () => {
      this.livechartLogoff();
    });
  }

  ngOnInit() {
    this.livechart.user.subscribe(user => {
      this.livechartLoggedIn = user;
    });
  }

  async livechartConnect() {
    if (!this.livechartData) {
      this.livechartData = {
        username: '',
        password: '',
        saveLogin: false,
      };
      return;
    }
    this.glob.busy();
    await this.livechart.login(this.livechartData?.username, this.livechartData?.password);
    this.glob.notbusy();
  }

  async livechartLogoff() {
    this.livechart.logoff();
  }
}
