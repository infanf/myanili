---
date: 2026-03-18T00:00:00+01:00
researcher: cschreiner
git_commit: 93d146c6817b6da343dfecffefd825fdb758077a
branch: beta
repository: myanili/beta
topic: "Bangumi Integration – Linking Accounts and Fetching Ratings (Issue #113)"
tags: [research, codebase, bangumi, oauth, ratings, external-api, anime, manga]
status: complete
last_updated: 2026-03-18
last_updated_by: cschreiner
---

# Research: Bangumi Integration – Linking Accounts and Fetching Ratings

**Date**: 2026-03-18
**Researcher**: cschreiner
**Git Commit**: 93d146c6817b6da343dfecffefd825fdb758077a
**Branch**: beta
**Repository**: myanili/beta
**GitHub Issue**: https://github.com/infanf/myanili/issues/113

## Research Question

How should a Bangumi (bangumi.tv) integration be implemented in myanili/beta? This covers:
1. OAuth account linking
2. Fetching user ratings from Bangumi
3. Displaying Bangumi ratings alongside other platform ratings

## Summary

The codebase follows a highly consistent pattern for external platform integrations. Every OAuth platform has: a PHP `ServiceProvider` class, a backend route handler (in `web.php` or a dedicated route file), an Angular service, a login component, and an icon component. Ratings are normalised to an `ExtRating` interface (`norm` = 0–100 scale) and displayed via the shared `myanili-external-rating` component.

Bangumi uses a standard OAuth 2.0 Authorization Code flow (base URL `https://api.bgm.tv`). The most recent comparable integration is **MangaBaka** (merged PR #111), which is the best reference pattern. For community ratings (no auth required), `GET /v0/subjects/{id}` can be used directly; user-specific ratings require auth via `GET /v0/users/{username}/collections`.

---

## Detailed Findings

### 1. Backend OAuth Pattern

Every OAuth platform follows the same four-step structure:

**A) ServiceProvider** (`backend/app/Providers/{Platform}ServiceProvider.php`)
Defines `getOauthProvider()` using `League\OAuth2\Client\Provider\GenericProvider` and any API proxy methods.

Reference – MangaBaka provider (`backend/app/Providers/MangabakaServiceProvider.php:36-47`):
```php
public static function getOauthProvider() {
    $config = [
        'clientId'                => env('MANGABAKA_CLIENT_ID'),
        'clientSecret'            => env('MANGABAKA_CLIENT_SECRET'),
        'redirectUri'             => env('APP_URL') . '/mangabaka/auth',
        'urlAuthorize'            => 'https://mangabaka.org/auth/oauth2/authorize',
        'urlAccessToken'          => 'https://mangabaka.org/auth/oauth2/token',
        'urlResourceOwnerDetails' => 'https://mangabaka.org/auth/oauth2/userinfo',
    ];
    return new \League\OAuth2\Client\Provider\GenericProvider($config);
}
```

**For Bangumi**, the equivalent URLs are:
- `urlAuthorize`: `https://bgm.tv/oauth/authorize`
- `urlAccessToken`: `https://bgm.tv/oauth/access_token`
- `urlResourceOwnerDetails`: `https://api.bgm.tv/v0/me`
- `redirectUri`: `env('APP_URL') . '/bangumi/auth'`
- Env vars: `BANGUMI_CLIENT_ID`, `BANGUMI_CLIENT_SECRET`

**B) OAuth route handler** (`backend/routes/web.php`)
All routes are centralised in `web.php`. The MangaBaka route (`web.php:443-492`) is the most complete recent example:
- Implements PKCE (S256 code challenge)
- Stores `MANGABAKA_ACCESS_TOKEN` + `MANGABAKA_REFRESH_TOKEN` as cookies
- After successful token exchange, returns a `<script>` that calls `window.opener.postMessage({at, rt, ex, ci, mangabaka: true}, origin)`
- The `userinfo` proxy endpoint (`web.php:494-506`) forwards the `Authorization` header to the external API

Bangumi does NOT require PKCE (unlike MangaBaka), so the simpler Annict/AniList pattern can be used. However PKCE can also be added for extra security.

**C) Environment variables** (`backend/.env.example`)
Pattern: `{PLATFORM}_CLIENT_ID=XXX` and `{PLATFORM}_CLIENT_SECRET=XXX`.
Files to update: `backend/.env`, `backend/.env.example`.

**D) Dedicated route files** (`backend/routes/`)
Some platforms (e.g., `anilist.php`, `shikimori.php`) have their own route files for additional API proxy endpoints beyond just auth. For Bangumi, if rating fetching is done client-side via `api.bgm.tv` directly, no additional route file is needed. If proxied, a `backend/routes/bangumi.php` file would be created.

---

### 2. Frontend OAuth Pattern

**A) Service** (`frontend/src/app/services/anime/bangumi.service.ts`)
Follows the `MangabakaService` pattern (`frontend/src/app/services/manga/mangabaka.service.ts`):
- Stores `bangumiAccessToken` and `bangumiRefreshToken` in `localStorage`
- `isLoggedIn` and `user` as `BehaviorSubject`
- `login()` opens a popup window to `${environment.backend}bangumi/auth` and listens for `postMessage` with `{ bangumi: true }`
- `logout()` clears localStorage entries and resets BehaviorSubjects
- `getRating(subjectId: number)` returns `Promise<ExtRating | undefined>`

**B) Login component** (`frontend/src/app/components/logins/bangumi-login/`)
One `*.ts` + `*.html` file per platform. All login components are aggregated in `logins.component.html`.

**C) Icon component** (`frontend/src/app/icon/bangumi/bangumi.component.ts` + `.html`)
SVG icon for Bangumi. Registered in `icon.module.ts`.

**D) postMessage payload convention** (`web.php:482`):
```js
{ at: "access_token", rt: "refresh_token", ex: expiry_timestamp, ci: "client_id", bangumi: true }
```
The frontend `login()` method checks `event.data.bangumi` to recognise the callback.

---

### 3. ExtRating Interface and Ratings Display

**`ExtRating`** (`frontend/src/app/models/components.ts:32-39`):
```typescript
interface Rating {
  norm: number;     // normalised to 0–100 scale
  nom: number;      // native score from provider
  unit?: string;    // e.g. "%" or "/10"
  ratings?: number; // number of raters
}
export type ExtRating = Rating;
```

**`AnimeExtension`** in `frontend/src/app/models/anime.ts:164-203` stores per-provider IDs in the MAL `comments` field (Base64-encoded JSON). Currently present: `anilistId`, `malId`, `kitsuId`, `simklId`, `annictId`, `livechartId`, `anisearchId`, `annId`, `anidbId`, `apSlug`. A **`bangumiId?: number`** field needs to be added here.

**Details component pattern** (`frontend/src/app/anime/details/details.component.ts`):
- `ratings: Array<{ provider: string; rating: ExtRating }> = []` (line 53)
- `getRatings()` method (line 604) calls each service's `getRating(id)` and stores results via `setRating(provider, rating)`
- `setRating(provider, rating)` (line 677): pushes or replaces entry in `ratings` array
- Template uses: `<myanili-external-rating [rating]="getRating('bangumi')"></myanili-external-rating>`

**Bangumi ratings to `ExtRating` mapping:**

Option A – Community rating (no auth, via `GET /v0/subjects/{id}`):
```typescript
// response.rating.score is 0–10
return {
  nom: response.rating.score,
  norm: response.rating.score * 10,
  ratings: response.rating.total,
};
```

Option B – User personal rating (auth required, via `GET /v0/users/{username}/collections`):
```typescript
// item.rate is 0–10, 0 = not rated
return {
  nom: item.rate,
  norm: item.rate * 10,
};
```

---

### 4. Bangumi API Reference

**Base URL**: `https://api.bgm.tv`
**App registration**: `https://bgm.tv/dev/app`
**API docs**: https://bangumi.github.io/api/

**OAuth 2.0 flow**:
```
GET  https://bgm.tv/oauth/authorize?client_id=...&response_type=code&redirect_uri=...&state=...
POST https://bgm.tv/oauth/access_token  (grant_type=authorization_code, code, redirect_uri, client_id, client_secret)
POST https://bgm.tv/oauth/access_token  (grant_type=refresh_token, refresh_token, client_id, client_secret, redirect_uri)
```

**Token lifetime**: 7 days (604,800 seconds). Auth codes expire in **60 seconds**.

**Key endpoints**:

| Endpoint | Auth | Description |
|---|---|---|
| `GET /v0/me` | Required (Bearer) | Current user info: `{ id, username, nickname, avatar, ... }` |
| `GET /v0/users/{username}/collections` | Optional | User collection with ratings; `?subject_type=2` = anime, `=1` = books/manga |
| `GET /v0/subjects/{id}` | None | Subject detail incl. community `rating.score` (0–10) and `rating.total` |

**Collections response** (`GET /v0/users/{username}/collections`):
```json
{
  "total": 100, "limit": 50, "offset": 0,
  "data": [{
    "subject_id": 12345,
    "type": 2,      // 1=wish, 2=done, 3=doing, 4=onhold, 5=dropped
    "rate": 8,      // 0–10, 0 = unrated
    "comment": "",
    "ep_status": 13,
    "private": false,
    "updated_at": "2025-01-01T00:00:00Z"
  }]
}
```

**subject_type values**: 1=Book, 2=Anime, 3=Music, 4=Game, 6=Real (no 5).

**Required headers**:
- `Authorization: Bearer {token}` (for authenticated endpoints)
- `User-Agent: yourapp/version (url)` — **must be set**, generic UA strings may be blocked

**Rate limiting**: Not published in the spec. Implement conservative backoff on `429` responses.

---

### 5. ID Storage: Where Bangumi IDs Come From

Other platform IDs are cross-referenced via APIs. For Bangumi, the most practical approach:
1. **Via AniList**: AniList subjects have an `idMal` (MAL ID) field. Bangumi has a "MAL" source mapping but no direct cross-ref API known.
2. **Manual entry** in the anime edit dialog (like `anidbId`, `apSlug`).
3. **Bangumi's own subject search**: `GET /v0/search/subjects?keyword=...&type=2` (v0 search endpoint exists per the OpenAPI spec).

The `AnimeExtension.bangumiId` field would store the Bangumi `subject_id` integer, analogous to `annictId` or `anidbId`.

---

### 6. Manga Integration

For manga, the `MangaExtension` model (in `frontend/src/app/models/manga.ts`) also needs a `bangumiId` field. The manga details component (`frontend/src/app/manga/details/details.component.ts`) follows the same `setRating` / `getRating` pattern. Bangumi subject_type=1 (Book) covers manga.

---

## Code References

- `backend/app/Providers/MangabakaServiceProvider.php:36-47` — OAuth provider config pattern to replicate
- `backend/routes/web.php:443-506` — MangaBaka auth + userinfo route handlers (most recent OAuth example)
- `backend/.env.example:1-20` — env var naming convention
- `frontend/src/app/services/manga/mangabaka.service.ts:1-362` — full frontend service pattern
- `frontend/src/app/models/anime.ts:164-203` — `AnimeExtension` where `bangumiId` must be added
- `frontend/src/app/models/components.ts:32-39` — `ExtRating` interface
- `frontend/src/app/anime/details/details.component.ts:53` — `ratings` array
- `frontend/src/app/anime/details/details.component.ts:604-658` — `getRatings()` method (add Bangumi call here)
- `frontend/src/app/anime/details/details.component.ts:673-695` — `getRating` / `setRating` helpers
- `frontend/src/app/components/external-rating/external-rating.component.ts` — shared rating display component

---

## Architecture Documentation

### Files to Create

| File | Purpose |
|---|---|
| `backend/app/Providers/BangumiServiceProvider.php` | OAuth config + userinfo proxy |
| `frontend/src/app/services/anime/bangumi.service.ts` | Token storage, login, getRating |
| `frontend/src/app/components/logins/bangumi-login/bangumi-login.component.ts` | Login UI |
| `frontend/src/app/components/logins/bangumi-login/bangumi-login.component.html` | Login UI template |
| `frontend/src/app/icon/bangumi/bangumi.component.ts` | Icon component |
| `frontend/src/app/icon/bangumi/bangumi.component.html` | Icon SVG |

### Files to Modify

| File | Change |
|---|---|
| `backend/routes/web.php` | Add `/bangumi/auth` and `/bangumi/userinfo` routes |
| `backend/.env` + `backend/.env.example` | Add `BANGUMI_CLIENT_ID`, `BANGUMI_CLIENT_SECRET` |
| `frontend/src/app/models/anime.ts` | Add `bangumiId?: number` to `AnimeExtension` |
| `frontend/src/app/models/manga.ts` | Add `bangumiId?: number` to manga extension |
| `frontend/src/app/anime/details/details.component.ts` | Inject service, call `getRating` in `getRatings()` |
| `frontend/src/app/anime/details/details.component.html` | Add `<myanili-external-rating>` block |
| `frontend/src/app/manga/details/details.component.ts` | Same for manga |
| `frontend/src/app/components/logins/logins.component.html` | Add bangumi-login component |
| `frontend/src/app/icon/icon.module.ts` | Register Bangumi icon component |
| `frontend/src/environments/environment.ts` (all envs) | Add `bangumiClientId` if needed client-side |

---

## Historical Context (from thoughts/)

- `thoughts/shared/research/2026-01-26-mangabaka-api-integration-patterns.md` — Comprehensive research on integration patterns; MangaBaka was the most recently implemented OAuth integration and serves as the primary reference.
- `thoughts/shared/plans/2026-01-26-107-mangabaka-integration.md` — Implementation plan for MangaBaka (now implemented as PR #111).

---

## Open Questions

1. **Community vs. user ratings**: Should the integration show community average scores (no auth needed, via `GET /v0/subjects/{id}`) or the user's personal score (requires OAuth)? Both could be combined.
2. **Bangumi subject_id discovery**: How will users find and enter their Bangumi ID for a given anime? A search-by-name feature using `GET /v0/search/subjects` would improve UX.
3. **Token refresh lifetime**: The Bangumi docs do not specify if the refresh_token expires after 7 days together with the access_token or has a longer lifetime.
4. **User-Agent header**: The backend proxy must set a descriptive User-Agent when calling `api.bgm.tv` — generic strings may be blocked.
5. **Manga coverage**: Bangumi covers manga as `subject_type=1` (books). The exact integration scope for manga should be clarified.
