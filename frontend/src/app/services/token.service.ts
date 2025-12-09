import { Injectable } from '@angular/core';
import { SecureStorageService } from './secure-storage.service';

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  clientId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor(private secureStorage: SecureStorageService) {}

  async saveTokens(service: string, tokens: TokenSet): Promise<void> {
    await this.secureStorage.set(`${service}_access_token`, tokens.accessToken);

    if (tokens.refreshToken) {
      await this.secureStorage.set(`${service}_refresh_token`, tokens.refreshToken);
    }

    if (tokens.expiresAt) {
      await this.secureStorage.set(`${service}_expires_at`, String(tokens.expiresAt));
    }

    if (tokens.clientId) {
      await this.secureStorage.set(`${service}_client_id`, tokens.clientId);
    }
  }

  async getTokens(service: string): Promise<TokenSet | null> {
    const accessToken = await this.secureStorage.get(`${service}_access_token`);

    if (!accessToken) return null;

    const refreshToken = await this.secureStorage.get(`${service}_refresh_token`);
    const expiresAtStr = await this.secureStorage.get(`${service}_expires_at`);
    const clientId = await this.secureStorage.get(`${service}_client_id`);

    return {
      accessToken,
      refreshToken: refreshToken || undefined,
      expiresAt: expiresAtStr ? parseInt(expiresAtStr) : undefined,
      clientId: clientId || undefined,
    };
  }

  async clearTokens(service: string): Promise<void> {
    await this.secureStorage.remove(`${service}_access_token`);
    await this.secureStorage.remove(`${service}_refresh_token`);
    await this.secureStorage.remove(`${service}_expires_at`);
    await this.secureStorage.remove(`${service}_client_id`);
  }

  async isTokenValid(service: string): Promise<boolean> {
    const tokens = await this.getTokens(service);

    if (!tokens) return false;
    if (!tokens.expiresAt) return true; // No expiration info, assume valid

    return Date.now() < tokens.expiresAt;
  }
}
