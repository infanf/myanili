import { Component, OnInit } from '@angular/core';
import { AnimescheduleService, AnimescheduleUser } from '@services/anime/animeschedule.service';
import { GlobalService } from '@services/global.service';

@Component({
  selector: 'myanili-animeschedule-login',
  templateUrl: './animeschedule-login.component.html',
  standalone: false,
})
export class AnimescheduleLoginComponent implements OnInit {
  animescheduleLoggedIn?: AnimescheduleUser;
  animescheduleLoading = false;

  constructor(
    private animeschedule: AnimescheduleService,
    private glob: GlobalService,
  ) {
    // Listen for MAL logoff event to also log off from this service
    window.addEventListener('myanili-mal-logoff', () => {
      this.animescheduleLogoff();
    });
  }

  ngOnInit() {
    this.animeschedule.user.subscribe(user => {
      this.animescheduleLoggedIn = user;
    });
  }

  async animescheduleConnect() {
    this.animescheduleLoading = true;
    try {
      this.glob.busy();
      await this.animeschedule.login();
      this.glob.notbusy();
    } finally {
      this.animescheduleLoading = false;
    }
  }

  async animescheduleLogoff() {
    this.animeschedule.logoff();
  }
}
