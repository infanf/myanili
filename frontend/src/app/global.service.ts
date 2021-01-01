import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  private isBusySubject = new BehaviorSubject<boolean>(true);

  constructor() {}

  get isBusy() {
    return this.isBusySubject.asObservable();
  }

  busy() {
    this.isBusySubject.next(true);
  }

  notbusy() {
    this.isBusySubject.next(false);
  }
}
