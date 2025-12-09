# MyAniLi Capacitor Android Migration Implementation Plan

## Overview

Migrate the MyAniLi Angular 21 PWA to Google Play Store using Ionic Capacitor while maintaining full backend independence for the mobile app. The web PWA will continue using the existing backend architecture, while the Android app will implement native OAuth flows and direct API integrations.

**Date**: 2025-12-09
**Related Research**: `thoughts/shared/research/2025-12-09-angular-to-google-play-migration.md`

## Current State Analysis

### Architecture
- **Frontend**: Angular 21 PWA with service worker
- **Backend**: PHP Lumen (OAuth proxy + MAL API wrapper)
- **Data Storage**:
  - IndexedDB for caching (anime, manga, fetch, fetchRaw stores)
  - localStorage for tokens, settings, and user data
- **OAuth Pattern**: `window.open()` + `postMessage` with backend proxy for 7 services:
  - MyAnimeList (cookie-based, `credentials: 'include'`)
  - AniList, Shikimori, Trakt, SIMKL, Annict, AniSearch (localStorage tokens)

### Key Dependencies
- **Backend-Dependent**:
  - All OAuth flows (backend/service/auth endpoints)
  - MAL API calls (backend proxies requests with cookies)
  - Token refresh for some services (backend/service/token endpoints)
- **Already Independent**:
  - AniList GraphQL API (direct calls with Bearer token)
  - Kitsu REST API (direct calls with OAuth password grant)
  - Jikan API (direct calls, backend as fallback)

### Key Discoveries
- MAL service uses cookie-based auth (`credentials: 'include'`) - requires most changes
- All other services use localStorage for token storage (no encryption)
- No platform detection exists - pure web app
- CacheService uses IndexedDB with 3600s TTL for fetch caching
- SettingsService uses localStorage for all app preferences
- All services use BehaviorSubject pattern for user state management

## Desired End State

### Web App (PWA)
- **No changes** to existing authentication flows
- Continue using backend OAuth proxy
- Maintain cookie-based session management
- Deploy at existing URL

### Android App (Capacitor)
- **Fully independent** from backend
- Native OAuth flows with PKCE (where supported)
- Secure token storage (Android Keystore)
- Direct API calls to all services
- Offline-first with local database
- Deploy to Google Play Store

### Platform Detection
- Automatic detection of web vs. mobile environment
- Service implementations switch based on platform
- Transparent to components - same service interfaces

## What We're NOT Doing

- iOS app development (can be added later)
- Rewriting the entire app (90%+ code reuse)
- Changing web app authentication (backward compatible)
- Migrating existing users' data (each platform independent)
- Backend deprecation (remains for web app)
- Web scraping features in mobile (AniSearch/Baka-Updates scraping)
- TMDB poster proxy in mobile (use direct API with embedded key)

## Implementation Approach

### Strategy
1. **Add Capacitor** to existing Angular project without breaking web build
2. **Create platform detection layer** to identify web vs. mobile
3. **Implement mobile OAuth services** that mirror existing service interfaces
4. **Refactor existing services** to delegate to platform-specific implementations
5. **Add secure storage** for mobile tokens
6. **Maintain backward compatibility** for web PWA

### Architecture Pattern
```
Component
   ↓
Service (Platform-Agnostic Interface)
   ↓
Platform Detection
   ↓
├─ Web Implementation (existing)
│  └─ Backend OAuth Proxy
└─ Mobile Implementation (new)
   └─ Native OAuth + Direct API
```

---

## Phase 1: Capacitor Setup & Infrastructure

### Overview
Set up Ionic Capacitor, configure Android project, and establish platform detection without breaking existing web app.

### Changes Required

#### 1. Install Capacitor Dependencies
**File**: `frontend/package.json`
**Changes**: Add Capacitor core packages

```json
{
  "dependencies": {
    "@capacitor/core": "^6.0.0",
    "@capacitor/android": "^6.0.0",
    "@capacitor/app": "^6.0.0",
    "@capacitor/browser": "^6.0.0",
    "@capacitor/network": "^6.0.0",
    "@capacitor-community/sqlite": "^6.0.0",
    "@capacitor/preferences": "^6.0.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.0.0"
  }
}
```

#### 2. Initialize Capacitor
**Command**:
```bash
cd frontend
npm install
npx cap init
# App name: MyAniLi
# App ID: com.myani.li
# Web dir: dist/myanili-frontend/browser
npx cap add android
```

#### 3. Capacitor Configuration
**File**: `frontend/capacitor.config.ts` (created by init)
**Changes**: Configure web directory and plugins

```typescript
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.myani.li',
  appName: 'MyAniLi',
  webDir: 'dist/myanili-frontend/browser',
  server: {
    androidScheme: 'https',
    cleartext: true // Allow localhost for development
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
```

#### 4. Android Manifest Configuration
**File**: `frontend/android/app/src/main/AndroidManifest.xml`
**Changes**: Add intent filters for OAuth callbacks

```xml
<!-- Inside <activity android:name=".MainActivity"> -->
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="myanilist" />
</intent-filter>
```

#### 5. Build Script Updates
**File**: `frontend/package.json`
**Changes**: Add mobile build scripts

```json
{
  "scripts": {
    "build:android": "ng build -c production && npx cap sync android && npx cap open android",
    "sync:android": "npx cap sync android"
  }
}
```

#### 6. Create Platform Detection Service
**File**: `frontend/src/app/services/platform.service.ts` (new)
**Changes**: Detect web vs. mobile platform

```typescript
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

export type Platform = 'web' | 'android' | 'ios';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  private _platform: Platform;

  constructor() {
    this._platform = this.detectPlatform();
  }

  private detectPlatform(): Platform {
    const platform = Capacitor.getPlatform();

    if (platform === 'android') return 'android';
    if (platform === 'ios') return 'ios';
    return 'web';
  }

  get platform(): Platform {
    return this._platform;
  }

  get isWeb(): boolean {
    return this._platform === 'web';
  }

  get isMobile(): boolean {
    return this._platform === 'android' || this._platform === 'ios';
  }

  get isAndroid(): boolean {
    return this._platform === 'android';
  }

  get isIOS(): boolean {
    return this._platform === 'ios';
  }
}
```

### Success Criteria

#### Automated Verification:
- [ ] Dependencies install successfully: `cd frontend && npm install`
- [ ] TypeScript compilation succeeds: `npm run build`
- [ ] Capacitor sync completes: `npx cap sync android`
- [ ] Android project opens in Android Studio: `npx cap open android`
- [ ] Web app still builds and runs: `npm run dev`

#### Manual Verification:
- [ ] Android app launches in emulator/device
- [ ] Platform detection returns 'android' on mobile
- [ ] Platform detection returns 'web' in browser
- [ ] No errors in browser console for web app
- [ ] Web app functionality unchanged

---

## Phase 2: Mobile Token Storage & Security

### Overview
Implement secure token storage for mobile using Android Keystore, while maintaining localStorage for web.

### Changes Required

#### 1. Create Secure Storage Service
**File**: `frontend/src/app/services/secure-storage.service.ts` (new)
**Changes**: Platform-aware secure storage

```typescript
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root',
})
export class SecureStorageService {
  constructor(private platformService: PlatformService) {}

  async set(key: string, value: string): Promise<void> {
    if (this.platformService.isMobile) {
      // Use Capacitor Preferences (backed by Keystore on Android)
      await Preferences.set({ key, value });
    } else {
      // Use localStorage for web
      localStorage.setItem(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.platformService.isMobile) {
      const result = await Preferences.get({ key });
      return result.value;
    } else {
      return localStorage.getItem(key);
    }
  }

  async remove(key: string): Promise<void> {
    if (this.platformService.isMobile) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  }

  async clear(): Promise<void> {
    if (this.platformService.isMobile) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  }

  async keys(): Promise<string[]> {
    if (this.platformService.isMobile) {
      const result = await Preferences.keys();
      return result.keys;
    } else {
      return Object.keys(localStorage);
    }
  }
}
```

#### 2. Create Token Management Service
**File**: `frontend/src/app/services/token.service.ts` (new)
**Changes**: Centralized token management with encryption

```typescript
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
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compilation succeeds: `npm run build`
- [ ] No import errors for Capacitor Preferences
- [ ] Services can be injected in components

#### Manual Verification:
- [ ] Tokens save and retrieve correctly on mobile
- [ ] localStorage still works on web
- [ ] Token persistence survives app restart
- [ ] Tokens cleared on logout
- [ ] Platform detection correctly routes storage calls

---

## Phase 3: Mobile OAuth Implementation - AniList

### Overview
Implement native OAuth for AniList as a reference implementation, then replicate for other services.

### Changes Required

#### 1. Register Mobile OAuth App
**Action**: Register at https://anilist.co/settings/developer
**Redirect URI**: `myanilist://anilist-callback`

#### 2. Create Mobile OAuth Service
**File**: `frontend/src/app/services/mobile/anilist-mobile-oauth.service.ts` (new)
**Changes**: Native OAuth implementation

```typescript
import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { TokenService } from '../token.service';
import { AnilistUser } from '@models/anilist';
import { Client, cacheExchange, fetchExchange, gql } from '@urql/core';

@Injectable({
  providedIn: 'root',
})
export class AnilistMobileOAuthService {
  private client!: Client;
  private clientId = '18928'; // Mobile app client ID (register new)
  private redirectUri = 'myanilist://anilist-callback';
  private loginResolve?: (user: AnilistUser | undefined) => void;

  constructor(private tokenService: TokenService) {
    this.setupUrlListener();
    this.initializeClient();
  }

  private setupUrlListener() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      if (event.url.startsWith(this.redirectUri)) {
        this.handleCallback(event.url);
      }
    });
  }

  private async initializeClient() {
    const tokens = await this.tokenService.getTokens('anilist');

    this.client = new Client({
      url: 'https://graphql.anilist.co',
      preferGetMethod: false,
      fetchOptions: () => {
        return {
          headers: {
            Authorization: `Bearer ${tokens?.accessToken || ''}`,
          },
        };
      },
      exchanges: [cacheExchange, fetchExchange],
    });
  }

  async login(): Promise<AnilistUser | undefined> {
    return new Promise(async (resolve) => {
      this.loginResolve = resolve;

      const authUrl = `https://anilist.co/api/v2/oauth/authorize?` +
        `client_id=${this.clientId}&` +
        `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
        `response_type=token`;

      await Browser.open({ url: authUrl });
    });
  }

  private async handleCallback(url: string) {
    await Browser.close();

    // AniList uses implicit flow (token in URL fragment)
    const fragment = url.split('#')[1];
    if (!fragment) {
      this.loginResolve?.(undefined);
      return;
    }

    const params = new URLSearchParams(fragment);
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');

    if (!accessToken) {
      this.loginResolve?.(undefined);
      return;
    }

    const expiresAt = expiresIn
      ? Date.now() + parseInt(expiresIn) * 1000
      : undefined;

    await this.tokenService.saveTokens('anilist', {
      accessToken,
      expiresAt,
      clientId: this.clientId,
    });

    await this.initializeClient();
    const user = await this.checkLogin();
    this.loginResolve?.(user);
  }

  async checkLogin(): Promise<AnilistUser | undefined> {
    const QUERY = gql`
      {
        Viewer {
          id
          name
          avatar {
            large
            medium
          }
        }
      }
    `;

    const result = await this.client
      .query<{ Viewer: AnilistUser }>(QUERY, {})
      .toPromise()
      .catch(() => undefined);

    return result?.data?.Viewer;
  }

  async logoff() {
    await this.tokenService.clearTokens('anilist');
    await this.initializeClient();
  }

  getClient(): Client {
    return this.client;
  }
}
```

#### 3. Refactor AniList Service to be Platform-Aware
**File**: `frontend/src/app/services/anilist.service.ts`
**Changes**: Delegate to platform-specific implementations

```typescript
import { Injectable } from '@angular/core';
import { AnilistNotification, AnilistSaveMedialistEntry, AnilistUser } from '@models/anilist';
import { ExtRating } from '@models/components';
import { DialogueService } from '@services/dialogue.service';
import { cacheExchange, Client, fetchExchange, gql } from '@urql/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { AnilistFeedService } from './anilist/feed.service';
import { AnilistLibraryService } from './anilist/library.service';
import { AnilistMediaService } from './anilist/media.service';
import { AnilistNotificationsService } from './anilist/notifications.service';
import { PlatformService } from './platform.service';
import { AnilistMobileOAuthService } from './mobile/anilist-mobile-oauth.service';

@Injectable({
  providedIn: 'root',
})
export class AnilistService {
  private clientId = '';
  private accessToken = '';
  private refreshToken = '';
  private userSubject = new BehaviorSubject<AnilistUser | undefined>(undefined);
  private anilistMedia: AnilistMediaService;
  private anilistNotifications: AnilistNotificationsService;
  private anilistLibrary: AnilistLibraryService;
  private anilistFeed: AnilistFeedService;
  private client!: Client;
  private mobileOAuth?: AnilistMobileOAuthService;

  loggedIn = false;

  constructor(
    private dialogue: DialogueService,
    private platformService: PlatformService
  ) {
    if (this.platformService.isMobile) {
      // Mobile implementation will be injected
      // Constructor initialization handled in initializeMobile()
    } else {
      // Web implementation (existing code)
      this.initializeWeb();
    }
  }

  private initializeWeb() {
    this.clientId = String(localStorage.getItem('anilistClientId'));
    this.accessToken = String(localStorage.getItem('anilistAccessToken'));
    this.refreshToken = String(localStorage.getItem('anilistRefreshToken'));

    this.client = new Client({
      url: 'https://graphql.anilist.co',
      preferGetMethod: false,
      fetchOptions: () => {
        return {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        };
      },
      exchanges: [cacheExchange, fetchExchange],
    });

    if (this.accessToken) {
      this.checkLogin()
        .then(user => {
          this.userSubject.next(user);
        })
        .catch(e => {
          this.dialogue.alert(
            'Could not connect to AniList, please check your account settings.',
            'AniList Connection Error',
          );
          localStorage.removeItem('anilistAccessToken');
        });
    }

    this.anilistMedia = new AnilistMediaService(this.client);
    this.anilistNotifications = new AnilistNotificationsService(this.client);
    this.anilistLibrary = new AnilistLibraryService(this.client, this.user);
    this.anilistFeed = new AnilistFeedService(this.client);
  }

  async initializeMobile(mobileOAuth: AnilistMobileOAuthService) {
    this.mobileOAuth = mobileOAuth;
    this.client = mobileOAuth.getClient();

    const user = await mobileOAuth.checkLogin();
    if (user) {
      this.userSubject.next(user);
      this.loggedIn = true;
    }

    this.anilistMedia = new AnilistMediaService(this.client);
    this.anilistNotifications = new AnilistNotificationsService(this.client);
    this.anilistLibrary = new AnilistLibraryService(this.client, this.user);
    this.anilistFeed = new AnilistFeedService(this.client);
  }

  async login() {
    if (this.platformService.isMobile && this.mobileOAuth) {
      const user = await this.mobileOAuth.login();
      if (user) {
        this.userSubject.next(user);
        this.loggedIn = true;
      }
      return;
    }

    // Web implementation (existing)
    return new Promise(r => {
      const loginWindow = window.open(environment.backend + 'anilist/auth');
      window.addEventListener('message', async event => {
        if (event.data && event.data.anilist) {
          const data = event.data as { at: string; rt: string; ex: number; ci: string };
          this.accessToken = data.at;
          localStorage.setItem('anilistAccessToken', this.accessToken);
          this.refreshToken = data.rt;
          localStorage.setItem('anilistRefreshToken', this.refreshToken);
          this.clientId = data.ci;
          localStorage.setItem('anilistClientId', this.clientId);
          this.userSubject.next(await this.checkLogin());
        }
        loginWindow?.close();
        r(undefined);
      });
    });
  }

  get user() {
    return this.userSubject.asObservable();
  }

  async checkLogin(): Promise<AnilistUser | undefined> {
    if (this.platformService.isMobile && this.mobileOAuth) {
      return this.mobileOAuth.checkLogin();
    }

    // Web implementation (existing)
    const QUERY = gql`
      {
        Viewer {
          id
          name
          avatar {
            large
            medium
          }
        }
      }
    `;

    const result = await this.client
      .query<{ Viewer: AnilistUser }>(QUERY, {})
      .toPromise()
      .catch(error => {
        console.log({ error });
        return undefined;
      });
    const requestResult = result?.data?.Viewer;
    this.loggedIn = !!requestResult;
    return requestResult;
  }

  logoff() {
    if (this.platformService.isMobile && this.mobileOAuth) {
      this.mobileOAuth.logoff();
      this.userSubject.next(undefined);
      this.loggedIn = false;
      return;
    }

    // Web implementation (existing)
    this.clientId = '';
    this.accessToken = '';
    this.refreshToken = '';
    this.userSubject.next(undefined);
    this.loggedIn = false;
    localStorage.removeItem('anilistAccessToken');
    localStorage.removeItem('anilistRefreshToken');
    localStorage.removeItem('anilistClientId');
  }

  // ... rest of methods unchanged (getId, getMalId, updateEntry, etc.)
}
```

#### 4. Inject Mobile OAuth in App Component
**File**: `frontend/src/app/app.component.ts`
**Changes**: Initialize mobile services on startup

```typescript
export class AppComponent implements OnInit {
  constructor(
    private platformService: PlatformService,
    private anilistService: AnilistService,
    private anilistMobileOAuth: AnilistMobileOAuthService,
    // ... other services
  ) {}

  async ngOnInit() {
    if (this.platformService.isMobile) {
      // Initialize mobile OAuth for all services
      await this.anilistService.initializeMobile(this.anilistMobileOAuth);
    }

    // ... rest of init code
  }
}
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compilation succeeds: `npm run build`
- [ ] Android build succeeds: `npm run build:android`
- [ ] No console errors on app launch

#### Manual Verification:
- [ ] AniList login opens browser on mobile
- [ ] OAuth callback returns to app
- [ ] Tokens stored securely in Android Keystore
- [ ] User data loads after login
- [ ] Web login still works with backend proxy
- [ ] App survives restart with valid tokens
- [ ] Logout clears tokens on mobile

---

## Phase 4: Mobile OAuth Implementation - MAL (PKCE)

### Overview
Implement MyAnimeList OAuth with PKCE flow for mobile, replacing cookie-based backend proxy.

### Changes Required

#### 1. Register Mobile OAuth App
**Action**: Register at https://myanimelist.net/apiconfig
**Redirect URI**: `myanilist://mal-callback`
**App Type**: Web
**PKCE**: Required (plain challenge method)

#### 2. Create PKCE Utility
**File**: `frontend/src/app/services/mobile/pkce.util.ts` (new)
**Changes**: PKCE code generation

```typescript
export class PKCEUtil {
  static generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  static async generateCodeChallenge(verifier: string): Promise<string> {
    // MAL uses plain challenge method
    return verifier;
  }

  private static base64URLEncode(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}
```

#### 3. Create Mobile MAL Service
**File**: `frontend/src/app/services/mobile/mal-mobile-oauth.service.ts` (new)
**Changes**: Native OAuth with PKCE

```typescript
import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { TokenService } from '../token.service';
import { MalUser, UserResponse } from '@models/user';
import { ListAnime, WatchStatus } from '@models/anime';
import { ListManga, ReadStatus } from '@models/manga';
import { PKCEUtil } from './pkce.util';

@Injectable({
  providedIn: 'root',
})
export class MalMobileOAuthService {
  private clientId = 'YOUR_MOBILE_CLIENT_ID'; // Register new mobile app
  private redirectUri = 'myanilist://mal-callback';
  private loginResolve?: (user: MalUser | undefined) => void;
  private codeVerifier?: string;

  constructor(private tokenService: TokenService) {
    this.setupUrlListener();
  }

  private setupUrlListener() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      if (event.url.startsWith(this.redirectUri)) {
        this.handleCallback(event.url);
      }
    });
  }

  async login(): Promise<MalUser | undefined> {
    return new Promise(async (resolve) => {
      this.loginResolve = resolve;

      // Generate PKCE verifier and challenge
      this.codeVerifier = PKCEUtil.generateCodeVerifier();
      const codeChallenge = await PKCEUtil.generateCodeChallenge(this.codeVerifier);

      const authUrl = `https://myanimelist.net/v1/oauth2/authorize?` +
        `response_type=code&` +
        `client_id=${this.clientId}&` +
        `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=plain`;

      await Browser.open({ url: authUrl });
    });
  }

  private async handleCallback(url: string) {
    await Browser.close();

    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');

    if (!code || !this.codeVerifier) {
      this.loginResolve?.(undefined);
      return;
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(code, this.codeVerifier);

    if (!tokens) {
      this.loginResolve?.(undefined);
      return;
    }

    const user = await this.checkLogin();
    this.loginResolve?.(user);
  }

  private async exchangeCodeForTokens(
    code: string,
    codeVerifier: string
  ): Promise<boolean> {
    const response = await fetch('https://myanimelist.net/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) return false;

    const data = await response.json();

    await this.tokenService.saveTokens('mal', {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    });

    return true;
  }

  private async getAccessToken(): Promise<string | null> {
    const tokens = await this.tokenService.getTokens('mal');
    if (!tokens) return null;

    // Check if expired and refresh if needed
    if (tokens.expiresAt && Date.now() >= tokens.expiresAt) {
      const refreshed = await this.refreshTokens();
      if (!refreshed) return null;

      const newTokens = await this.tokenService.getTokens('mal');
      return newTokens?.accessToken || null;
    }

    return tokens.accessToken;
  }

  private async refreshTokens(): Promise<boolean> {
    const tokens = await this.tokenService.getTokens('mal');
    if (!tokens?.refreshToken) return false;

    const response = await fetch('https://myanimelist.net/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        grant_type: 'refresh_token',
        refresh_token: tokens.refreshToken,
      }),
    });

    if (!response.ok) return false;

    const data = await response.json();

    await this.tokenService.saveTokens('mal', {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    });

    return true;
  }

  async checkLogin(): Promise<MalUser | undefined> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return undefined;

    const response = await fetch('https://api.myanimelist.net/v2/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'MyAniLi',
      },
    });

    if (!response.ok) return undefined;

    return response.json();
  }

  async myList(
    status?: WatchStatus,
    options?: { limit?: number; offset?: number; sort?: string }
  ): Promise<ListAnime[]> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return [];

    const params = new URLSearchParams({
      limit: String(options?.limit || 50),
      offset: String(options?.offset || 0),
      sort: options?.sort || 'anime_start_date',
      fields: 'list_status,num_episodes,status,start_date,end_date',
    });

    if (status) {
      params.set('status', status);
    }

    const response = await fetch(
      `https://api.myanimelist.net/v2/users/@me/animelist?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'MyAniLi',
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.data || [];
  }

  async myMangaList(
    status?: ReadStatus,
    options?: { limit?: number; offset?: number }
  ): Promise<ListManga[]> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return [];

    const params = new URLSearchParams({
      limit: String(options?.limit || 50),
      offset: String(options?.offset || 0),
      fields: 'list_status,num_chapters,num_volumes,status,start_date,end_date',
    });

    if (status) {
      params.set('status', status);
    }

    const response = await fetch(
      `https://api.myanimelist.net/v2/users/@me/mangalist?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'MyAniLi',
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.data || [];
  }

  async updateAnime(id: number, updates: any): Promise<any> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return null;

    const response = await fetch(
      `https://api.myanimelist.net/v2/anime/${id}/my_list_status`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'MyAniLi',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(updates),
      }
    );

    if (!response.ok) return null;

    return response.json();
  }

  async logoff() {
    await this.tokenService.clearTokens('mal');
  }
}
```

#### 4. Refactor MAL Service
**File**: `frontend/src/app/services/mal.service.ts`
**Changes**: Platform-aware delegation (similar to AniList pattern)

```typescript
// Add platform detection and delegation logic
constructor(
  private cache: CacheService,
  private platformService: PlatformService
) {
  if (this.platformService.isMobile) {
    // Mobile initialization handled by app.component
  } else {
    // Existing web implementation
    const malUser = JSON.parse(localStorage.getItem('malUser') || 'false') as MalUser | false;
    if (malUser) {
      this.isLoggedIn.next(malUser.name);
      this.malUser.next(malUser);
    }
    this.checkLogin();
  }
}

async initializeMobile(mobileOAuth: MalMobileOAuthService) {
  this.mobileOAuth = mobileOAuth;
  const user = await mobileOAuth.checkLogin();
  if (user) {
    this.isLoggedIn.next(user.name);
    this.malUser.next(user);
  }
}

async login() {
  if (this.platformService.isMobile && this.mobileOAuth) {
    const user = await this.mobileOAuth.login();
    if (user) {
      this.isLoggedIn.next(user.name);
      this.malUser.next(user);
    }
    return;
  }

  // Existing web implementation
  return new Promise(r => {
    window.addEventListener('message', async event => {
      console.log(event);
      if (event.data?.mal) {
        await this.checkLogin();
      }
      loginWindow?.close();
    });
    const loginWindow = window.open(`${this.backendUrl}auth`);
  });
}

async myList(status?: WatchStatus, options?: { limit?: number; offset?: number; sort?: string }) {
  if (this.platformService.isMobile && this.mobileOAuth) {
    return this.mobileOAuth.myList(status, options);
  }

  // Existing web implementation
  const params = new URLSearchParams([
    ['limit', String(options?.limit || 50)],
    ['offset', String(options?.offset || 0)],
    ['sort', options?.sort || 'anime_start_date'],
  ]);
  if (status) return this.get<ListAnime[]>(`list/${status}`, params);
  return this.get<ListAnime[]>('list');
}

// Similar delegation pattern for myMangaList, checkLogin, etc.
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compilation succeeds: `npm run build`
- [ ] Android build succeeds: `npm run build:android`

#### Manual Verification:
- [ ] MAL login opens browser with PKCE flow on mobile
- [ ] OAuth callback exchanges code for tokens
- [ ] Tokens refresh automatically when expired
- [ ] User list loads from MAL API on mobile
- [ ] List updates sync to MAL on mobile
- [ ] Web implementation unchanged (cookies still work)
- [ ] App survives restart with valid MAL tokens

---

## Phase 5: Remaining OAuth Services Migration

### Overview
Implement mobile OAuth for remaining services: Shikimori, Trakt, SIMKL, Annict, AniSearch.

### Implementation Pattern

For each service:
1. Register new mobile OAuth app with redirect URI `myanilist://{service}-callback`
2. Create `{service}-mobile-oauth.service.ts` following AniList pattern
3. Refactor existing service to delegate based on platform
4. Add URL listener for callback handling
5. Implement token refresh logic (if supported)

### Services to Implement

#### 1. Shikimori
- **OAuth Flow**: Standard OAuth 2.0 with refresh tokens
- **Registration**: https://shikimori.one/oauth/applications
- **API**: https://shikimori.one/api/doc
- **Existing**: frontend/src/app/services/shikimori.service.ts:23-87

#### 2. Trakt
- **OAuth Flow**: Standard OAuth 2.0 with refresh tokens
- **Registration**: https://trakt.tv/oauth/applications
- **API**: https://trakt.docs.apiary.io/
- **Existing**: frontend/src/app/services/anime/trakt.service.ts:24-112

#### 3. SIMKL
- **OAuth Flow**: Custom OAuth (1-year tokens, no refresh)
- **Registration**: https://simkl.com/settings/developer
- **API**: https://simkl.docs.apiary.io/
- **Existing**: frontend/src/app/services/anime/simkl.service.ts:18-82

#### 4. Annict
- **OAuth Flow**: Standard OAuth 2.0 with 'read write' scope
- **Registration**: https://annict.com/oauth/applications
- **API**: https://developers.annict.com/
- **Existing**: frontend/src/app/services/anime/annict.service.ts:18-71

#### 5. AniSearch
- **OAuth Flow**: OAuth 2.0 with PKCE S256
- **Registration**: https://anisearch.com/developers
- **API**: https://anisearch-api.github.io/
- **Existing**: frontend/src/app/services/anisearch.service.ts:30-120
- **Note**: Supports token revocation

### Success Criteria

#### Automated Verification:
- [ ] All services compile without errors
- [ ] Android build succeeds with all OAuth services

#### Manual Verification:
- [ ] Each service login works on mobile
- [ ] Each service login works on web (unchanged)
- [ ] Token refresh works for services that support it
- [ ] Logout clears all service tokens
- [ ] Multiple services can be logged in simultaneously

---

## Phase 6: Offline-First Data Storage

### Overview
Implement local database for anime/manga lists with offline sync queue.

### Changes Required

#### 1. Install RxDB
**File**: `frontend/package.json`
**Changes**: Add RxDB dependencies

```json
{
  "dependencies": {
    "rxdb": "^15.0.0",
    "rxdb/plugins/dev-mode": "^15.0.0"
  }
}
```

#### 2. Create Database Schema
**File**: `frontend/src/app/services/database/schemas.ts` (new)
**Changes**: Define RxDB schemas

```typescript
import { RxJsonSchema } from 'rxdb';

export const animeListSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'number' },
    mal_id: { type: 'number' },
    title: { type: 'string' },
    status: { type: 'string' },
    score: { type: 'number' },
    episodes_watched: { type: 'number' },
    total_episodes: { type: 'number' },
    comments: { type: 'string' },
    updated_at: { type: 'number' },
    synced: { type: 'boolean' },
  },
  required: ['id', 'mal_id', 'title'],
  indexes: ['mal_id', 'status', 'updated_at'],
};

export const mangaListSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'number' },
    mal_id: { type: 'number' },
    title: { type: 'string' },
    status: { type: 'string' },
    score: { type: 'number' },
    chapters_read: { type: 'number' },
    total_chapters: { type: 'number' },
    comments: { type: 'string' },
    updated_at: { type: 'number' },
    synced: { type: 'boolean' },
  },
  required: ['id', 'mal_id', 'title'],
  indexes: ['mal_id', 'status', 'updated_at'],
};

export const syncQueueSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string' },
    action: { type: 'string' },
    entity_type: { type: 'string' },
    entity_id: { type: 'number' },
    payload: { type: 'string' },
    created_at: { type: 'number' },
    synced: { type: 'boolean' },
  },
  required: ['id', 'action', 'entity_type', 'entity_id'],
  indexes: ['synced', 'created_at'],
};
```

#### 3. Create Database Service
**File**: `frontend/src/app/services/database/database.service.ts` (new)
**Changes**: Initialize RxDB

```typescript
import { Injectable } from '@angular/core';
import { createRxDatabase, RxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { animeListSchema, mangaListSchema, syncQueueSchema } from './schemas';
import { PlatformService } from '../platform.service';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private db?: RxDatabase;

  constructor(private platformService: PlatformService) {}

  async initialize() {
    if (!this.platformService.isMobile) {
      // Web uses existing IndexedDB via CacheService
      return;
    }

    this.db = await createRxDatabase({
      name: 'myanilidb',
      storage: getRxStorageDexie(),
      multiInstance: true,
      ignoreDuplicate: true,
    });

    await this.db.addCollections({
      anime_list: {
        schema: animeListSchema,
      },
      manga_list: {
        schema: mangaListSchema,
      },
      sync_queue: {
        schema: syncQueueSchema,
      },
    });
  }

  get animeList() {
    return this.db?.collections.anime_list;
  }

  get mangaList() {
    return this.db?.collections.manga_list;
  }

  get syncQueue() {
    return this.db?.collections.sync_queue;
  }

  async destroy() {
    if (this.db) {
      await this.db.destroy();
    }
  }
}
```

#### 4. Create Sync Service
**File**: `frontend/src/app/services/sync.service.ts` (new)
**Changes**: Handle offline changes and sync

```typescript
import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { DatabaseService } from './database/database.service';
import { MalMobileOAuthService } from './mobile/mal-mobile-oauth.service';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private isSyncing = false;

  constructor(
    private db: DatabaseService,
    private malMobile: MalMobileOAuthService,
    private platformService: PlatformService
  ) {
    if (this.platformService.isMobile) {
      this.setupNetworkListener();
    }
  }

  private setupNetworkListener() {
    Network.addListener('networkStatusChange', status => {
      if (status.connected) {
        this.processSyncQueue();
      }
    });
  }

  async updateAnime(animeId: number, updates: any) {
    if (!this.platformService.isMobile) return;

    // Update local database immediately (optimistic UI)
    await this.db.animeList?.upsert({
      id: animeId,
      ...updates,
      updated_at: Date.now(),
      synced: false,
    });

    // Add to sync queue
    await this.db.syncQueue?.insert({
      id: `anime_${animeId}_${Date.now()}`,
      action: 'update',
      entity_type: 'anime',
      entity_id: animeId,
      payload: JSON.stringify(updates),
      created_at: Date.now(),
      synced: false,
    });

    // Try to sync immediately if online
    const status = await Network.getStatus();
    if (status.connected) {
      await this.processSyncQueue();
    }
  }

  async processSyncQueue() {
    if (this.isSyncing || !this.platformService.isMobile) return;

    this.isSyncing = true;

    try {
      const queue = await this.db.syncQueue
        ?.find({
          selector: { synced: false },
          sort: [{ created_at: 'asc' }],
        })
        .exec();

      if (!queue) return;

      for (const item of queue) {
        try {
          if (item.action === 'update' && item.entity_type === 'anime') {
            await this.malMobile.updateAnime(
              item.entity_id,
              JSON.parse(item.payload)
            );

            // Mark as synced
            await item.patch({ synced: true });

            // Update anime record
            const anime = await this.db.animeList?.findOne(item.entity_id).exec();
            if (anime) {
              await anime.patch({ synced: true });
            }
          }
        } catch (error) {
          console.error('Sync failed for item', item.id, error);
          // Keep in queue for retry
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  async getUnsynced(): Promise<number> {
    if (!this.platformService.isMobile) return 0;

    const count = await this.db.syncQueue
      ?.count({
        selector: { synced: false },
      })
      .exec();

    return count || 0;
  }
}
```

### Success Criteria

#### Automated Verification:
- [ ] RxDB initializes without errors
- [ ] Database schemas are valid
- [ ] TypeScript compilation succeeds

#### Manual Verification:
- [ ] Anime/manga data persists offline
- [ ] Changes made offline are queued
- [ ] Sync queue processes when online
- [ ] Optimistic UI updates work correctly
- [ ] No data loss after app restart
- [ ] Web app uses existing IndexedDB (no RxDB)

---

## Phase 7: Testing & Polish

### Overview
Comprehensive testing of all OAuth flows, offline sync, and platform-specific behaviors.

### Testing Checklist

#### OAuth Flows (Mobile)
- [ ] MAL: Login, token refresh, logout
- [ ] AniList: Login, implicit grant, logout
- [ ] Shikimori: Login, token refresh, logout
- [ ] Trakt: Login, token refresh, logout
- [ ] SIMKL: Login (1-year token), logout
- [ ] Annict: Login, logout
- [ ] AniSearch: Login with PKCE S256, logout

#### OAuth Flows (Web)
- [ ] All services still work with backend proxy
- [ ] No regressions in web authentication
- [ ] Cookies persist correctly

#### Offline Functionality (Mobile)
- [ ] App works offline with cached data
- [ ] Changes queue correctly when offline
- [ ] Sync processes when network returns
- [ ] No duplicate syncs occur
- [ ] Conflicts handled gracefully

#### Platform Detection
- [ ] Correct platform detected on Android
- [ ] Correct platform detected in browser
- [ ] Services route to correct implementation

#### Data Persistence
- [ ] Tokens survive app restart (mobile)
- [ ] User lists persist (mobile)
- [ ] Settings persist across platforms
- [ ] Cache works on both platforms

#### Edge Cases
- [ ] Token expiration handled gracefully
- [ ] Network errors don't crash app
- [ ] Invalid tokens clear and re-prompt login
- [ ] Multiple accounts can switch
- [ ] Logout clears all data correctly

### Performance Testing

#### Mobile App
- [ ] Cold start < 3 seconds
- [ ] OAuth flow < 10 seconds total
- [ ] List load < 2 seconds (cached)
- [ ] Memory usage < 250MB
- [ ] Battery drain acceptable

#### Web App
- [ ] No performance regressions
- [ ] Lighthouse score maintains ≥80

### Success Criteria

#### Automated Verification:
- [ ] All unit tests pass (if implemented)
- [ ] Linting passes: `npm run check`
- [ ] Build succeeds for both platforms

#### Manual Verification:
- [ ] All OAuth flows tested successfully
- [ ] Offline mode works reliably
- [ ] No console errors or warnings
- [ ] App feels responsive on mid-range devices
- [ ] Web app unchanged in functionality

---

## Phase 8: Google Play Store Preparation

### Overview
Prepare app metadata, generate signed APK, and submit to Google Play Store.

### Changes Required

#### 1. App Icons and Splash Screen
**Files**:
- `frontend/android/app/src/main/res/mipmap-*/ic_launcher.png`
- `frontend/android/app/src/main/res/drawable/splash.png`

**Changes**:
- Create app icons (48x48, 72x72, 96x96, 144x144, 192x192 dp)
- Create adaptive icon (use Image Asset Studio in Android Studio)
- Design splash screen (1080x1920 recommended)

#### 2. App Metadata
**File**: `frontend/android/app/build.gradle`
**Changes**: Update version and metadata

```gradle
android {
    defaultConfig {
        applicationId "com.myani.li"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

#### 3. Generate Signing Key
**Command**:
```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias myanilist -keyalg RSA -keysize 2048 -validity 10000
```

#### 4. Configure Signing
**File**: `frontend/android/app/build.gradle`
**Changes**: Add release signing config

```gradle
android {
    signingConfigs {
        release {
            storeFile file('path/to/my-release-key.keystore')
            storePassword 'STORE_PASSWORD'
            keyAlias 'myanilist'
            keyPassword 'KEY_PASSWORD'
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### 5. Generate Signed APK/AAB
**Commands**:
```bash
cd frontend/android
./gradlew bundleRelease  # For AAB (recommended)
# OR
./gradlew assembleRelease  # For APK
```

Output: `frontend/android/app/build/outputs/bundle/release/app-release.aab`

#### 6. Google Play Console Setup
**Steps**:
1. Create developer account at https://play.google.com/console
2. Create new app
3. Upload app icon, screenshots (phone, tablet, 7-inch tablet)
4. Write app description, short description
5. Set content rating questionnaire
6. Set target audience and content
7. Upload signed AAB
8. Submit for review

### Store Listing Assets

#### Screenshots Required
- Phone: 2-8 screenshots (16:9 or 9:16, max 3840px)
- 7-inch tablet: 1-8 screenshots (optional)
- 10-inch tablet: 1-8 screenshots (optional)

#### Feature Graphic
- Size: 1024x500 px
- Format: PNG or JPG

#### App Description (4000 char max)
```
MyAniLi - Your Ultimate Anime & Manga Tracking Companion

Track your anime and manga across multiple platforms with MyAniLi, the all-in-one tracking app that syncs with MyAnimeList, AniList, Kitsu, Trakt, and more!

Features:
• Multi-Platform Sync: Connect to MyAnimeList, AniList, Kitsu, Trakt, SIMKL, Annict, and AniSearch
• Offline Mode: Access your lists even without internet
• Automatic Sync: Changes sync across all your connected platforms
• Seasonal Anime: Discover new shows each season
• Advanced Search: Find anime and manga quickly
• Beautiful UI: Clean, modern interface optimized for mobile

... (expand with more features)
```

#### Short Description (80 char max)
```
Track anime & manga across MAL, AniList, Kitsu, Trakt & more!
```

### Success Criteria

#### Automated Verification:
- [ ] Signed APK/AAB builds successfully
- [ ] No ProGuard errors
- [ ] App size < 50MB

#### Manual Verification:
- [ ] Signed APK installs on device
- [ ] All features work in release build
- [ ] No crashes in release build
- [ ] App passes Google Play pre-launch report
- [ ] Store listing looks professional
- [ ] All screenshots accurate and high-quality

---

## Testing Strategy

### Unit Tests
- Platform detection service
- Token service encryption/decryption
- OAuth callback parsing
- Sync queue logic

### Integration Tests
- OAuth flow end-to-end (mobile)
- Backend proxy OAuth (web)
- Token refresh flows
- Offline sync queue processing

### Manual Testing Steps

#### Mobile OAuth Testing
1. Install app on Android device/emulator
2. Attempt login for each service
3. Verify browser opens correctly
4. Complete OAuth flow
5. Verify app receives callback
6. Confirm tokens stored securely
7. Restart app and verify session persists
8. Logout and verify tokens cleared

#### Offline Testing
1. Load user list while online
2. Enable airplane mode
3. Make changes to list
4. Verify changes appear immediately (optimistic UI)
5. Verify sync queue increments
6. Re-enable network
7. Verify sync queue processes
8. Confirm changes synced to server

#### Web Regression Testing
1. Open web app in browser
2. Test all OAuth flows (unchanged)
3. Verify backend proxy still works
4. Confirm no console errors
5. Test all existing features

### Performance Considerations

- **Mobile**: Target cold start < 3s, smooth 60fps scrolling
- **Web**: Maintain Lighthouse performance score ≥80
- **Battery**: Monitor background sync frequency
- **Memory**: Profile for leaks, target < 250MB usage
- **Network**: Implement retry logic with exponential backoff

---

## Migration Notes

### User Migration
- **Web users**: No migration needed, continue using existing app
- **Mobile users**: New install, must re-authenticate all services
- **No data migration**: Each platform maintains independent state

### Backend Changes
- **No changes required**: Backend remains for web deployment
- **Future**: Can optionally reduce backend resources as mobile adoption grows

### Rollback Plan
If migration fails:
1. Remove Capacitor packages: `npm uninstall @capacitor/*`
2. Remove platform detection code
3. Restore original service implementations
4. Re-deploy web app without mobile code

---

## References

- **Research**: `thoughts/shared/research/2025-12-09-angular-to-google-play-migration.md`
- **Capacitor Docs**: https://capacitorjs.com/docs
- **MAL API**: https://myanimelist.net/apiconfig/references/api/v2
- **AniList API**: https://anilist.gitbook.io/anilist-apiv2-docs
- **OAuth 2.0 PKCE**: https://oauth.net/2/pkce/
- **RxDB Docs**: https://rxdb.info/
- **Google Play Console**: https://play.google.com/console

---

## Estimated Timeline

- **Phase 1**: Capacitor Setup - 3-4 days
- **Phase 2**: Token Storage - 2-3 days
- **Phase 3**: AniList OAuth - 3-4 days
- **Phase 4**: MAL OAuth (PKCE) - 4-5 days
- **Phase 5**: Remaining Services - 10-12 days (2 days per service)
- **Phase 6**: Offline Storage - 5-6 days
- **Phase 7**: Testing & Polish - 5-7 days
- **Phase 8**: Store Prep - 3-4 days

**Total**: 35-45 days (7-9 weeks)

---

## Open Questions & Decisions Needed

### RESOLVED - Client Credentials Security
**Decision**: Use PKCE without client secret for MAL and AniSearch. For services requiring secrets, embed in app (standard practice for mobile).

### RESOLVED - Web Scraping Features
**Decision**: Exclude AniSearch/Baka-Updates scraping from mobile app. These require server-side HTML parsing.

### RESOLVED - Analytics Migration
**Decision**: Use Capacitor Analytics plugin or Firebase Analytics for mobile. Web keeps existing solution.

### RESOLVED - TMDB API Integration
**Decision**: Embed TMDB API key in mobile app (obfuscated via ProGuard). Standard practice for mobile apps.

### RESOLVED - Storage Solution
**Decision**: Use RxDB for mobile (offline-first), keep IndexedDB for web.
