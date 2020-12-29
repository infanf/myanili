import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MalService {
  private backendUrl = 'http://localhost:4280/';

  private isLoggedIn = new BehaviorSubject<string | false>(false);

  constructor(private httpClient: HttpClient) {}

  private async get(path: string) {
    return new Promise((res, rej) => {
      this.httpClient.get(`${this.backendUrl}${path}`).subscribe(value => {
        res(value);
      });
    });
  }

  async myList() {
    return this.get('users/@me/animelist');
  }
  async refreshTokens() {}

  get loggedIn() {
    return this.isLoggedIn.asObservable();
  }
}
