import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class KurozoraService {
  private kurozora = require('@api/kurozora') as typeof import('@api/kurozora').default;

  constructor() {}

  async login(username: string, password: string) {
    const response = await this.kurozora.postSignIn({
      email: username,
      password,
      device_model: 'MyAniLi',
      platform_version: '1',
      device_vendor: 'infanf',
      platform: 'web',
    });
    console.log(response);
  }
}
