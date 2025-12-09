---
date: 2025-12-09T17:21:00+01:00
researcher: Christopher Schreiner
git_commit: 62b9979f3ceb38c24a2c1dbac59933fd1818b344
branch: native
repository: native
topic: "Migrating MyAniLi Angular App to Google Play with Backend Independence"
tags: [research, codebase, angular, mobile, google-play, capacitor, pwa, backend-independence, oauth, offline-first]
status: complete
last_updated: 2025-12-09
last_updated_by: Christopher Schreiner
---

# Research: Migrating MyAniLi Angular App to Google Play with Backend Independence

**Date**: 2025-12-09T17:21:00+01:00
**Researcher**: Christopher Schreiner
**Git Commit**: 62b9979f3ceb38c24a2c1dbac59933fd1818b344
**Branch**: native
**Repository**: native

## Research Question

How can I migrate the MyAniLi Angular app to be deployed on Google Play Store while becoming independent from the backend component by moving all its functionality directly to the app itself?

## Summary

MyAniLi is an Angular 21-based Progressive Web App (PWA) that integrates with MyAnimeList and multiple anime/manga tracking services (AniList, Kitsu, Trakt, etc.). The current architecture uses a PHP Lumen backend primarily as an **OAuth proxy** and **session manager**. The backend has minimal server-side state (only CSV logs and JSON mappings) and does not use a traditional database.

**Recommended Migration Path**: **Ionic Capacitor** with local SQLite/IndexedDB storage and native OAuth implementations.

### Key Findings:

1. **Backend Role**: The backend serves as an OAuth proxy for multiple services and handles MAL API requests with cookie-based authentication. It does NOT store user data in a database.

2. **Migration Options**:
   - **Capacitor** (Recommended): Low migration effort, wraps existing Angular app, extensive plugin ecosystem
   - **NativeScript**: True native performance but requires app rebuild
   - **PWA + TWA**: Minimal effort but limited native capabilities

3. **Backend Independence Strategy**:
   - Implement native OAuth flows using platform-specific OAuth libraries or custom URL schemes
   - Store tokens securely in iOS Keychain / Android Keystore
   - Make direct API calls to MyAnimeList and other services from the mobile app
   - Use local SQLite or IndexedDB for data persistence
   - Implement offline-first architecture with sync queue

4. **Technical Feasibility**: HIGH - The backend's stateless design and lack of custom business logic make migration straightforward.

## Detailed Findings

### Current Architecture

#### Frontend: Angular 21 PWA

**Location**: `/home/cschreiner/projects/private/myanili/native/frontend`

**Key Characteristics**:
- Angular 21 (latest version) with full PWA support
- Service Worker for offline app shell caching
- IndexedDB caching via `CacheService` for API responses
- localStorage for user preferences and OAuth tokens
- RxJS BehaviorSubjects for state management (no Redux/NgRx)
- Direct API communication with AniList, Kitsu, and other services

**Dependencies**:
- `@angular/pwa` v21.0.1
- `@angular/service-worker` v21.0.2
- `@urql/core` v6.0.1 (GraphQL client for AniList)
- `ngx-device-detector` v10.1.0
- `crypto-js` v4.1.1 (for Kitsu credential encryption)

**Backend Communication Pattern** ([frontend/src/app/services/mal.service.ts:28-67](frontend/src/app/services/mal.service.ts#L28-L67)):
```typescript
// Uses native fetch() with cookie credentials
async get<T>(path: string, params?: any) {
  const response = await fetch(url, {
    credentials: 'include'  // Sends cookies
  });
}

// Backend URL: http://localhost:4280/mal/ (dev)
//              https://mal.myani.li/mal/ (prod)
```

#### Backend: PHP Lumen Micro-Framework

**Location**: `/home/cschreiner/projects/private/myanili/native/backend`

**Framework**: Laravel Lumen 11.0 (PHP 8.1+)

**Core Functionality**:

1. **OAuth Proxy** - Handles OAuth flows for 7 services:
   - MyAnimeList (with PKCE)
   - AniList
   - Trakt.tv
   - SIMKL
   - Annict
   - Shikimori
   - AniSearch (with PKCE S256)

2. **MAL API Wrapper** - Proxies requests to MyAnimeList API:
   - User lists (anime/manga)
   - Search endpoints
   - CRUD operations on list entries
   - Seasonal anime
   - User profile

3. **Web Scraping** - Scrapes sites without APIs:
   - AniSearch (search, ratings, relations)
   - Baka-Updates/MangaUpdates (ratings, search)

4. **API Proxies**:
   - MangaUpdates API (`/baka/v1/**`)
   - MangaDex API (`/mangadex/**`)
   - TMDB API (poster images)

**Data Storage** (Minimal):
- **No database** - Eloquent ORM disabled
- `/users.csv` - User activity log (username;last_login)
- `/resources/songs.json` - Spotify URL mappings for anime
- `/resources/trakt-shows.json` - MAL ID → Trakt ID mappings
- `/resources/trakt-movies.json` - MAL ID → Trakt ID mappings
- Cookie-based OAuth token storage (client-side)

### Backend Dependencies Analysis

#### Critical Backend Dependencies

**1. OAuth Proxy Flows** ([backend/routes/mal.php:10-55](backend/routes/mal.php#L10-L55))

All OAuth implementations follow this pattern:
1. Generate PKCE code verifier (where required)
2. Redirect to service authorization URL
3. Handle callback with authorization code
4. Exchange code for access/refresh tokens
5. Store tokens in cookies
6. Send success message to parent window via `postMessage`

**Services with OAuth flows**:
- MyAnimeList: PKCE (plain), 30-day refresh tokens
- AniList: Standard OAuth 2.0
- Trakt: Standard OAuth 2.0
- SIMKL: Custom OAuth implementation (1-year tokens, no refresh)
- Annict: OAuth with 'read write' scope
- Shikimori: OAuth (requires User-Agent header)
- AniSearch: PKCE S256, supports token revocation

**2. Cookie-Based Session Management**

Tokens stored in HTTP cookies:
- `MAL_ACCESS_TOKEN`, `MAL_REFRESH_TOKEN`
- `ANILIST_ACCESS_TOKEN`, `ANILIST_REFRESH_TOKEN`
- Similar for all other services

**3. MAL API Requests** ([backend/app/Providers/MalServiceProvider.php:34-377](backend/app/Providers/MalServiceProvider.php#L34-L377))

Backend wraps MAL API v2 with:
- Automatic token refresh when expired
- Field selection optimization
- Response pagination for seasonal anime
- User-Agent: "MyAniLi"

**4. Web Scraping Endpoints**

AniSearch and Baka-Updates require server-side HTML parsing using PHP's DOMDocument.

#### Non-Critical Dependencies

1. **User Activity Logging** (`/users.csv`) - Can be replaced with mobile analytics
2. **Spotify Mappings** - Optional feature
3. **Trakt Mappings** - Can be bundled as JSON files in mobile app

#### Already Independent

The frontend already makes **direct API calls** to:
- AniList GraphQL API ([frontend/src/app/services/anilist.service.ts:35](frontend/src/app/services/anilist.service.ts#L35))
- Kitsu REST API ([frontend/src/app/services/kitsu.service.ts:24](frontend/src/app/services/kitsu.service.ts#L24))
- Jikan API (with backend fallback)
- Other services after OAuth completion

### Migration Options

#### Option 1: Ionic Capacitor (RECOMMENDED)

**Overview**: Wraps existing Angular 21 app in a native container with WebView rendering.

**Implementation Steps**:
```bash
cd frontend
ng add @capacitor/angular
npm i @capacitor/ios @capacitor/android
npx cap add android
npx cap add ios
ng build --prod
npx cap sync
npx cap open android
```

**Pros**:
- Minimal code changes (can reuse 90-95% of existing Angular app)
- Leverages web development skills
- Extensive plugin ecosystem (200+ official/community plugins)
- Single codebase for web + mobile
- Works seamlessly with Angular 21
- Strong community support in 2025

**Cons**:
- WebView performance overhead (not ideal for graphics-intensive apps)
- Not truly native UI
- ~240MB RAM consumption

**Native Features Available**:
- Push Notifications: `@capacitor/push-notifications`
- Local Storage: `@capacitor-community/sqlite` with encryption
- Camera: `@capacitor/camera`
- Geolocation: `@capacitor/geolocation`
- Secure Storage: `@capacitor/preferences` or native Keychain/Keystore
- OAuth: `@capacitor/browser` for native browser flows

**Time to Market**: 1-2 weeks (fastest)

**Resources**:
- [Using Capacitor with Angular](https://capacitorjs.com/solution/angular)
- [Capacitor Documentation](https://capacitorjs.com/docs)

#### Option 2: NativeScript

**Overview**: Compiles Angular to truly native apps without WebView.

**Implementation**: Requires rebuilding app with `@nativescript/angular` (version 20.0.0 supports Angular 19, Angular 21 compatibility expected).

**Pros**:
- Truly native performance
- Native UI components
- Direct access to all native APIs
- Better for graphics-heavy applications

**Cons**:
- Steeper learning curve
- Cannot reuse existing web app directly (requires rebuild)
- Smaller community than Capacitor
- No web deployment
- More platform-specific code required

**Time to Market**: 4-8 weeks (rebuild required)

**Resources**:
- [NativeScript Official Site](https://nativescript.org/)
- [NativeScript with Angular](https://old.nativescript.org/nativescript-is-how-you-build-native-mobile-apps-with-angular/)

#### Option 3: PWA + Trusted Web Activity (TWA)

**Overview**: Publish existing PWA to Google Play Store using Bubblewrap.

**Implementation**:
```bash
npm i -g @bubblewrap/cli
mkdir my-pwa && cd my-pwa
bubblewrap init --manifest=https://myani.li/manifest.json
bubblewrap build
```

**Pros**:
- Zero code changes (uses existing PWA)
- Automatic updates without app store approval
- Smallest app size
- Maintains web deployment

**Cons**:
- Most limited native capabilities (Web APIs only)
- Dependent on browser feature support
- Requires strong network connectivity
- Must meet Google Play quality standards (Lighthouse score ≥80)

**Time to Market**: 1 week (minimal setup)

**Resources**:
- [Adding PWA to Google Play (Official Google Codelab)](https://developers.google.com/codelabs/pwa-in-play)
- [Bubblewrap GitHub Repository](https://github.com/GoogleChromeLabs/bubblewrap)

### Backend Independence Implementation Strategy

#### Phase 1: OAuth Implementation (Critical)

**Challenge**: Replace server-side OAuth proxy with native mobile OAuth flows.

**Solution for Capacitor**:

1. **Install OAuth Plugin**:
   ```bash
   npm install @capacitor/browser
   ```

2. **Implement PKCE Flow** (for MAL and AniSearch):
   ```typescript
   import { Browser } from '@capacitor/browser';
   import { Capacitor } from '@capacitor/core';

   // Generate PKCE code verifier
   const codeVerifier = generateCodeVerifier(); // Use crypto API
   const codeChallenge = await generateCodeChallenge(codeVerifier);

   // Build authorization URL
   const authUrl = `https://myanimelist.net/v1/oauth2/authorize?` +
     `response_type=code&client_id=${clientId}&` +
     `code_challenge=${codeChallenge}&` +
     `redirect_uri=myapp://callback`;

   // Open in-app browser
   await Browser.open({ url: authUrl });

   // Handle callback via App URL scheme
   App.addListener('appUrlOpen', async (event: URLOpenListenerEvent) => {
     const code = extractCodeFromUrl(event.url);
     const tokens = await exchangeCodeForTokens(code, codeVerifier);
     await securelyStoreTokens(tokens);
   });
   ```

3. **Configure Custom URL Schemes** (`android/app/src/main/AndroidManifest.xml`):
   ```xml
   <intent-filter>
     <action android:name="android.intent.action.VIEW" />
     <category android:name="android.intent.category.DEFAULT" />
     <category android:name="android.intent.category.BROWSABLE" />
     <data android:scheme="myapp" />
   </intent-filter>
   ```

4. **Secure Token Storage**:
   ```typescript
   import { SecureStoragePlugin } from '@capacitor-community/secure-storage-plugin';

   // iOS Keychain / Android Keystore
   await SecureStoragePlugin.set({
     key: 'mal_access_token',
     value: accessToken
   });
   ```

**Required OAuth Client Registrations**:

Each service requires registering a new mobile app with redirect URIs:
- MAL: `myapp://mal-callback`
- AniList: `myapp://anilist-callback`
- Trakt: `myapp://trakt-callback`
- SIMKL: `myapp://simkl-callback`
- Annict: `myapp://annict-callback`
- Shikimori: `myapp://shikimori-callback`
- AniSearch: `myapp://anisearch-callback`

**Effort Estimate**: 2-3 weeks (most complex part of migration)

#### Phase 2: Local Data Storage

**Option A: SQLite with Encryption (Recommended for Mobile)**

```bash
npm install @capacitor-community/sqlite
npx cap sync
```

**Features**:
- Unlimited storage capacity
- SQL queries for complex data operations
- SQLCipher encryption (iOS/Android)
- Cross-platform (iOS, Android, Web with sql.js)

**Schema Design**:
```sql
-- User lists
CREATE TABLE anime_list (
  id INTEGER PRIMARY KEY,
  mal_id INTEGER UNIQUE,
  title TEXT,
  status TEXT,
  score INTEGER,
  episodes_watched INTEGER,
  total_episodes INTEGER,
  comments TEXT,
  updated_at TIMESTAMP,
  synced BOOLEAN DEFAULT 0
);

CREATE TABLE manga_list (
  id INTEGER PRIMARY KEY,
  mal_id INTEGER UNIQUE,
  title TEXT,
  status TEXT,
  score INTEGER,
  chapters_read INTEGER,
  total_chapters INTEGER,
  comments TEXT,
  updated_at TIMESTAMP,
  synced BOOLEAN DEFAULT 0
);

-- Cache for anime/manga metadata
CREATE TABLE anime_cache (
  mal_id INTEGER PRIMARY KEY,
  data TEXT, -- JSON blob
  cached_at TIMESTAMP
);

-- Sync queue for offline changes
CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT, -- 'update', 'delete', 'add'
  entity_type TEXT, -- 'anime', 'manga'
  entity_id INTEGER,
  payload TEXT, -- JSON
  created_at TIMESTAMP
);
```

**Option B: IndexedDB with Dexie.js (Cross-Platform)**

```bash
npm install dexie
```

```typescript
import Dexie from 'dexie';

export class AppDatabase extends Dexie {
  animeList: Dexie.Table<AnimeListEntry, number>;
  mangaList: Dexie.Table<MangaListEntry, number>;
  animeCache: Dexie.Table<CachedAnime, number>;
  syncQueue: Dexie.Table<SyncQueueItem, number>;

  constructor() {
    super('MyAniLiDatabase');
    this.version(1).stores({
      animeList: '++id, mal_id, status, updated_at',
      mangaList: '++id, mal_id, status, updated_at',
      animeCache: 'mal_id, cached_at',
      syncQueue: '++id, created_at, synced'
    });
  }
}
```

**Option C: RxDB (Recommended for Offline-First)**

```bash
npm install rxdb rxjs
```

**Benefits**:
- Built on IndexedDB/SQLite
- Reactive programming with RxJS (perfect for Angular)
- Automatic conflict resolution
- Real-time synchronization
- Event-driven architecture

```typescript
import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

const db = await createRxDatabase({
  name: 'myanilidb',
  storage: getRxStorageDexie(),
  multiInstance: true
});

await db.addCollections({
  anime: {
    schema: animeSchema,
    migrationStrategies: {}
  }
});

// Reactive queries
db.anime.find({
  selector: { status: 'watching' }
}).$.subscribe(animes => {
  // Auto-updates when data changes
});
```

**Storage Recommendation**: **RxDB** for best offline-first experience with Angular's reactive architecture.

#### Phase 3: Direct API Integration

**Update MAL Service** to call MAL API directly:

```typescript
// frontend/src/app/services/mal.service.ts

private async getAccessToken(): Promise<string> {
  let token = await SecureStoragePlugin.get({ key: 'mal_access_token' });

  // Check if expired and refresh if needed
  const expiresAt = await SecureStoragePlugin.get({ key: 'mal_token_expires' });
  if (Date.now() >= parseInt(expiresAt.value)) {
    token = await this.refreshToken();
  }

  return token.value;
}

async myList(status?: string): Promise<ListAnime[]> {
  const token = await this.getAccessToken();

  const response = await fetch(
    `https://api.myanimelist.net/v2/users/@me/animelist?` +
    `status=${status}&limit=50&fields=list_status`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'MyAniLi'
      }
    }
  );

  const data = await response.json();

  // Cache to local database
  await this.db.animeList.bulkPut(data.data);

  return data.data;
}
```

**Handle Token Refresh**:

```typescript
private async refreshToken(): Promise<string> {
  const refreshToken = await SecureStoragePlugin.get({
    key: 'mal_refresh_token'
  });

  const response = await fetch('https://myanimelist.net/v1/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: environment.malClientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken.value
    })
  });

  const tokens = await response.json();

  await SecureStoragePlugin.set({
    key: 'mal_access_token',
    value: tokens.access_token
  });
  await SecureStoragePlugin.set({
    key: 'mal_refresh_token',
    value: tokens.refresh_token
  });
  await SecureStoragePlugin.set({
    key: 'mal_token_expires',
    value: String(Date.now() + tokens.expires_in * 1000)
  });

  return tokens.access_token;
}
```

#### Phase 4: Offline-First Architecture

**Implement Sync Queue Pattern**:

```typescript
export class SyncService {
  constructor(private db: AppDatabase, private malService: MalService) {}

  async updateAnime(animeId: number, updates: Partial<AnimeListEntry>) {
    // Update local database immediately (optimistic UI)
    await this.db.animeList.update(animeId, {
      ...updates,
      synced: false,
      updated_at: new Date()
    });

    // Add to sync queue
    await this.db.syncQueue.add({
      action: 'update',
      entity_type: 'anime',
      entity_id: animeId,
      payload: JSON.stringify(updates),
      created_at: new Date(),
      synced: false
    });

    // Try to sync immediately if online
    if (navigator.onLine) {
      await this.processSyncQueue();
    }
  }

  async processSyncQueue() {
    const queue = await this.db.syncQueue
      .where('synced').equals(false)
      .toArray();

    for (const item of queue) {
      try {
        if (item.action === 'update') {
          await this.malService.updateAnime(
            item.entity_id,
            JSON.parse(item.payload)
          );

          // Mark as synced
          await this.db.syncQueue.update(item.id, { synced: true });
          await this.db.animeList.update(item.entity_id, { synced: true });
        }
      } catch (error) {
        console.error('Sync failed for item', item.id, error);
        // Keep in queue for retry
      }
    }
  }
}
```

**Listen for Network Changes**:

```typescript
import { Network } from '@capacitor/network';

Network.addListener('networkStatusChange', status => {
  if (status.connected) {
    this.syncService.processSyncQueue();
  }
});
```

#### Phase 5: Handle Web Scraping

**Challenge**: AniSearch and Baka-Updates web scraping done server-side.

**Options**:

1. **Keep minimal backend** for web scraping endpoints only
2. **Use CORS proxy** (not recommended for production)
3. **Drop web scraping features** (use official APIs where available)
4. **Implement native web scraping** using WebView:
   ```typescript
   // Limited capability - may break with website changes
   const html = await fetch(url).then(r => r.text());
   const parser = new DOMParser();
   const doc = parser.parseFromString(html, 'text/html');
   ```

**Recommendation**: Keep lightweight backend endpoint for web scraping only, or eliminate these features in favor of services with official APIs.

#### Phase 6: Bundle Static Data

**Trakt Mappings**: Bundle JSON files with app assets.

```bash
# Copy JSON files to mobile app assets
cp backend/resources/trakt-*.json frontend/src/assets/data/

# Load in app
const traktShows = await fetch('assets/data/trakt-shows.json')
  .then(r => r.json());
```

### Migration Roadmap

#### Week 1-2: Setup & OAuth Implementation
- [ ] Add Capacitor to existing Angular project
- [ ] Configure Android/iOS projects
- [ ] Register mobile apps with all OAuth providers (MAL, AniList, etc.)
- [ ] Implement PKCE OAuth flows for MAL and AniSearch
- [ ] Implement standard OAuth flows for other services
- [ ] Set up secure token storage (Keychain/Keystore)
- [ ] Test authentication on Android/iOS devices

#### Week 3-4: Local Storage & Data Migration
- [ ] Choose storage solution (RxDB recommended)
- [ ] Design database schema
- [ ] Implement data models
- [ ] Migrate IndexedDB caching to new schema
- [ ] Build sync queue system
- [ ] Test offline data persistence

#### Week 5-6: Direct API Integration
- [ ] Update MAL service to call API directly
- [ ] Implement token refresh logic
- [ ] Update AniList service (already direct, verify compatibility)
- [ ] Update Kitsu service (already direct, verify compatibility)
- [ ] Update all other service integrations
- [ ] Add request retry logic and error handling

#### Week 7-8: Offline-First & Sync
- [ ] Implement optimistic UI updates
- [ ] Build background sync service
- [ ] Add network status listeners
- [ ] Test offline editing and sync
- [ ] Handle conflict resolution
- [ ] Bundle static JSON data (Trakt mappings)

#### Week 9-10: Testing & Optimization
- [ ] Test on multiple Android devices/versions
- [ ] Test OAuth flows end-to-end
- [ ] Test offline scenarios
- [ ] Performance optimization
- [ ] Memory profiling
- [ ] Battery usage optimization

#### Week 11-12: Store Preparation & Launch
- [ ] Create app store assets (screenshots, descriptions)
- [ ] Set up Google Play Console
- [ ] Generate signed APK/AAB
- [ ] Internal testing
- [ ] Beta testing
- [ ] Production release

**Total Estimated Timeline**: 12 weeks for full migration

### Code References

**Backend Files**:
- OAuth Routes: `backend/routes/mal.php`, `backend/routes/anilist.php`, `backend/routes/trakt.php`, etc.
- MAL Service: `backend/app/Providers/MalServiceProvider.php:34-377`
- AniSearch Scraping: `backend/app/Providers/AnisearchServiceProvider.php:41-212`
- Baka Scraping: `backend/app/Providers/BakaServiceProvider.php:19-105`

**Frontend Files**:
- MAL Service: `frontend/src/app/services/mal.service.ts:28-129`
- AniList Service: `frontend/src/app/services/anilist.service.ts:35-45`
- Kitsu Service: `frontend/src/app/services/kitsu.service.ts:24-217`
- Cache Service: `frontend/src/app/services/cache.service.ts:89-146`
- Settings Service: `frontend/src/app/services/settings.service.ts:25-41`
- App Component: `frontend/src/app/app.component.ts:58-82`
- PWA Config: `frontend/ngsw-config.json`
- Web Manifest: `frontend/src/manifest.webmanifest`

## Architecture Documentation

### Current Data Flow

```
User Action (List Update)
  ↓
Angular Component
  ↓
AnimeService.update()
  ↓
MalService.post('/anime/{id}', data) [credentials: 'include']
  ↓
Backend: routes/mal.php (checks MAL_ACCESS_TOKEN cookie)
  ↓
Backend: MalServiceProvider.put() with Bearer token
  ↓
MyAnimeList API v2
  ↓
Response → Backend → Frontend
  ↓
CacheService.setAnime() → IndexedDB
  ↓
Component updates UI
```

### Proposed Mobile Data Flow (Backend-Independent)

```
User Action (List Update)
  ↓
Angular Component
  ↓
AnimeService.update()
  ↓
Local Database Update (RxDB/SQLite) [Optimistic UI]
  ↓
Add to Sync Queue
  ↓
Component updates UI immediately (offline-first)
  ↓
[Background] SyncService.processSyncQueue()
  ↓
Get token from SecureStorage (Keychain/Keystore)
  ↓
Direct API call to MyAnimeList API v2 with Bearer token
  ↓
On success: Mark queue item as synced
On failure: Keep in queue for retry
  ↓
Network listener triggers retry when online
```

### OAuth Flow Comparison

**Current (Backend Proxy)**:
```
Mobile App → window.open(backend/mal/auth)
  ↓
Backend redirects → MAL Authorization
  ↓
User approves → MAL callback → Backend
  ↓
Backend exchanges code for tokens
  ↓
Backend sets cookies (MAL_ACCESS_TOKEN, MAL_REFRESH_TOKEN)
  ↓
Backend sends postMessage to parent window
  ↓
Mobile App receives message → calls /mal/me with cookies
```

**Proposed (Native)**:
```
Mobile App → Browser.open(MAL Authorization URL with PKCE)
  ↓
User approves → MAL callback → myapp://mal-callback?code=XXX
  ↓
App.addListener('appUrlOpen') receives code
  ↓
App exchanges code + verifier for tokens (direct to MAL API)
  ↓
Store tokens in SecureStorage (Keychain/Keystore)
  ↓
App calls MAL API directly with Bearer token
```

## Related Research

- None found in `thoughts/shared/research/`

## Open Questions

1. **Web Scraping Strategy**: Should we maintain a minimal backend for AniSearch/Baka scraping, or eliminate these features?

2. **OAuth Client Credentials**: How should we securely store client IDs/secrets in the mobile app? Options:
   - Hardcode in app (common practice, but exposed via decompilation)
   - Use backend proxy for token exchange only (keeps secrets secure)
   - Use OAuth PKCE without client secret (MAL and AniSearch support this)

3. **Testing Infrastructure**: Do we need to set up automated testing for OAuth flows and offline sync?

4. **Analytics Migration**: How should we replace the backend's `users.csv` logging?
   - Google Analytics for Firebase
   - Custom analytics service
   - No analytics

5. **Versioning Strategy**: How to handle breaking changes between web PWA and mobile app versions?

6. **TMDB API Key**: Should we embed the TMDB API key in the mobile app or keep a backend proxy endpoint?

## Recommendations

### Immediate Next Steps

1. **Prototype with Capacitor**:
   - Run `ng add @capacitor/angular` in frontend directory
   - Build a proof-of-concept with MAL OAuth flow
   - Test on Android emulator/device
   - Validate approach before full commitment

2. **Register Mobile OAuth Apps**:
   - MyAnimeList: https://myanimelist.net/apiconfig
   - AniList: https://anilist.co/settings/developer
   - Configure redirect URIs: `myapp://service-callback`

3. **Choose Storage Solution**:
   - Start with **RxDB** for best Angular integration
   - Implement simple anime list storage
   - Test offline-first patterns

4. **Plan for Hybrid Approach** (if needed):
   - Keep minimal backend for web scraping only
   - Move all OAuth and API calls to mobile app
   - Reduces infrastructure costs and complexity

### Long-Term Considerations

1. **iOS App Store**: If planning iOS deployment, allocate additional time for:
   - Apple Developer Program enrollment ($99/year)
   - iOS-specific testing and optimization
   - App Store review process (stricter than Google Play)

2. **Maintenance**: Mobile apps require:
   - Regular updates for OS compatibility
   - Monitoring for OAuth changes (provider API updates)
   - Handling deprecated APIs

3. **Backend Sunset**: If fully migrating to mobile-only:
   - Plan deprecation timeline for web version
   - Migrate existing web users to mobile app
   - Archive backend codebase

4. **Multi-Platform Parity**: Ensure feature parity between:
   - Android app
   - iOS app (if applicable)
   - Web PWA (if maintaining)

## Conclusion

Migrating MyAniLi from a web-based PWA with backend to a fully independent Google Play Store app is **highly feasible** due to the backend's stateless architecture and minimal server-side logic. The recommended approach is:

1. **Use Ionic Capacitor** for wrapping the Angular 21 app
2. **Implement native OAuth flows** using PKCE and custom URL schemes
3. **Use RxDB** for offline-first local storage with reactive sync
4. **Make direct API calls** to MyAnimeList and other services
5. **Consider hybrid approach** (keep minimal backend for web scraping only)

**Estimated Timeline**: 12 weeks for full production-ready migration
**Effort Level**: Moderate - primarily OAuth implementation complexity
**Risk Level**: Low - stateless backend reduces migration complexity significantly

The migration will result in a more robust, scalable application with improved offline capabilities and reduced infrastructure costs.
