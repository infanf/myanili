# Bangumi Integration Implementation Plan

## Overview

Add Bangumi (bgm.tv) support to myanili: OAuth account linking and community score display for both anime and manga. Ratings are fetched unauthenticated from `GET /v0/subjects/{id}` (no login required to see scores). OAuth login is implemented for account linking (shown in the logins settings page) and is the foundation for future sync features.

**GitHub Issue**: https://github.com/infanf/myanili/issues/113

## Current State Analysis

- No Bangumi support exists anywhere in the codebase.
- `AnimeExtension` (`frontend/src/app/models/anime.ts:164`) has no `bangumiId` field.
- `MangaExtensionInterface` (`frontend/src/app/models/manga.ts:139`) has no `bangumiId` field.
- The MangaBaka integration (PR #111) is the most recent OAuth integration and serves as the primary reference pattern.
- `.env.example` does not contain MangaBaka entries either — both need to be added.

### Key Discoveries

- MangaBaka provider: `backend/app/Providers/MangabakaServiceProvider.php` (49 lines) — exact template to follow.
- MangaBaka auth route: `backend/routes/web.php:443-506` — uses PKCE; Bangumi does **not** need PKCE (simpler).
- `web.php` use-imports at lines 5–12 — `BangumiServiceProvider` must be added here.
- logins.module.ts declares 12 login components — `BangumiLoginComponent` must be added.
- icon.module.ts (`frontend/src/app/icon/icon.module.ts`) declares/exports all icon components — `BangumiIconComponent` must be added.
- Annict service (`frontend/src/app/services/anime/annict.service.ts`) is a good reference for a simpler OAuth flow (no PKCE).
- Ratings are fetched directly from `https://api.bgm.tv/v0/subjects/{id}`, no auth needed. Score is `data.rating.score` (0–10), mapped to `norm = score * 10`.
- Bangumi requires a descriptive `User-Agent` header on API calls — generic strings may be blocked.
- Token lifetime: 7 days (604,800 s). Auth codes expire in 60 seconds.

## Desired End State

After this plan is complete:
- Users can link their Bangumi account via the Settings → Accounts page.
- A Bangumi community score appears in the anime details view when `bangumiId` is set.
- A Bangumi community score appears in the manga details view when `bangumiId` is set.

**Verify by:**
1. Opening Settings → Accounts, clicking "Connect" for Bangumi, completing OAuth, seeing the username appear.
2. Opening an anime detail page where `bangumiId` is set — a Bangumi rating row appears with a score.
3. Opening a manga detail page where `bangumiId` is set — same.

## What We're NOT Doing

- Watch/read progress syncing (future feature).
- Personal user score display (community score only for now).
- Automatic `bangumiId` discovery / search UI (manual entry only, like `anidbId`).
- Token refresh flow (same as most other integrations; Bangumi's 7-day token lifetime is sufficient for now).

## Implementation Approach

Follow the MangaBaka pattern exactly, simplifying where Bangumi differs (no PKCE). Community ratings are fetched client-side directly from `api.bgm.tv` — no backend proxy needed for ratings. The backend only proxies `/bangumi/userinfo` for account linking.

---

## Phase 1: Backend OAuth

### Overview
Create the PHP service provider and add the two backend routes (`/bangumi/auth`, `/bangumi/userinfo`). Add env vars to `.env.example`.

### Changes Required

#### 1. New file: `backend/app/Providers/BangumiServiceProvider.php`

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class BangumiServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public static function getUserInfo(string $authHeader): array
    {
        $ch = curl_init('https://api.bgm.tv/v0/me');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: ' . $authHeader,
                'Accept: application/json',
                'User-Agent: myanili/2.0 (https://github.com/infanf/myanili)',
            ],
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return ['body' => $response, 'status' => $httpCode];
    }

    public static function getOauthProvider()
    {
        $config = [
            'clientId'                => env('BANGUMI_CLIENT_ID'),
            'clientSecret'            => env('BANGUMI_CLIENT_SECRET'),
            'redirectUri'             => env('APP_URL') . '/bangumi/auth',
            'urlAuthorize'            => 'https://bgm.tv/oauth/authorize',
            'urlAccessToken'          => 'https://bgm.tv/oauth/access_token',
            'urlResourceOwnerDetails' => 'https://api.bgm.tv/v0/me',
        ];
        return new \League\OAuth2\Client\Provider\GenericProvider($config);
    }
}
```

#### 2. Modify `backend/routes/web.php`

**At line 9** (after the MangabakaServiceProvider use statement), add:

```php
use App\Providers\BangumiServiceProvider as BangumiServiceProvider;
```

**At the end of the file**, add a header comment block (matching the style of other platform blocks) and then the two routes:

```php
/*
 *  ____                                    _
 * | __ )  __ _ _ __   __ _ _   _ _ __ ___ (_)
 * |  _ \ / _` | '_ \ / _` | | | | '_ ` _ \| |
 * | |_) | (_| | | | | (_| | |_| | | | | | | |
 * |____/ \__,_|_| |_|\__, |\__,_|_| |_| |_|_|
 *                    |___/
 */

$router->get('/bangumi/auth', function () {
    $provider = BangumiServiceProvider::getOauthProvider();
    if (!isset($_GET['code'])) {
        $authorizationUrl = $provider->getAuthorizationUrl();
        $_SESSION['oauth2state'] = $provider->getState();
        header('Location: ' . $authorizationUrl);
        exit;
    } elseif (empty($_GET['state']) || (isset($_SESSION['oauth2state']) && $_GET['state'] !== $_SESSION['oauth2state'])) {
        if (isset($_SESSION['oauth2state'])) {
            unset($_SESSION['oauth2state']);
        }
        exit('Invalid state');
    } else {
        try {
            $accessToken = $provider->getAccessToken('authorization_code', [
                'code' => $_GET['code'],
            ]);
            setcookie('BANGUMI_ACCESS_TOKEN', $accessToken->getToken(), $accessToken->getExpires());
            setcookie('BANGUMI_REFRESH_TOKEN', $accessToken->getRefreshToken(), $accessToken->getExpires() + (30 * 24 * 60 * 60));
            $javascript = "";
            $clientId = env('BANGUMI_CLIENT_ID');
            foreach (explode(',', env('APP_CLIENT')) as $opener) {
                $javascript .= <<<JAVASCRIPT
                    window.opener.postMessage({at:"{$accessToken->getToken()}",rt:"{$accessToken->getRefreshToken()}",ex:"{$accessToken->getExpires()}",ci:"{$clientId}",bangumi:true}, "$opener");
JAVASCRIPT;
            }
            return "<script>$javascript</script>";
        } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {
            return ($e->getMessage());
        }
    }
});

$router->get('/bangumi/userinfo', function () {
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (empty($authHeader)) {
        http_response_code(401);
        header('Content-Type: application/json');
        return json_encode(['error' => 'No authorization header']);
    }

    $result = BangumiServiceProvider::getUserInfo($authHeader);
    http_response_code($result['status']);
    header('Content-Type: application/json');
    return $result['body'];
});
```

#### 3. Modify `backend/.env.example`

Add after line 18 (`ANNICT_CLIENT_SECRET=XXX`):

```
BANGUMI_CLIENT_ID=XXX
BANGUMI_CLIENT_SECRET=XXX
```

Also add (while here) the missing MangaBaka entries after the Bangumi block:

```
MANGABAKA_CLIENT_ID=XXX
MANGABAKA_CLIENT_SECRET=XXX
```

### Success Criteria

#### Automated Verification
- [x] PHP syntax check passes: `php -l backend/app/Providers/BangumiServiceProvider.php`
- [ ] `BangumiServiceProvider` class loads without error (Laravel bootstrap doesn't fail)

#### Manual Verification
- [ ] `GET /bangumi/auth` redirects to `https://bgm.tv/oauth/authorize`
- [ ] After completing OAuth on bgm.tv, the popup closes and `postMessage` is received by the frontend
- [ ] `GET /bangumi/userinfo` with a valid `Authorization: Bearer <token>` header returns user JSON

---

## Phase 2: Frontend Models

### Overview
Add `bangumiId` field to both `AnimeExtension` and `MangaExtensionInterface`.

### Changes Required

#### 1. Modify `frontend/src/app/models/anime.ts`

In `AnimeExtension` interface (currently at line 164), add after `anidbId?: number` (line 188):

```typescript
  bangumiId?: number;
```

#### 2. Modify `frontend/src/app/models/manga.ts`

In `MangaExtensionInterface` (currently at line 139), add after `mangabakaId?: number` (line 153):

```typescript
  bangumiId?: number;
```

### Success Criteria

#### Automated Verification
- [ ] TypeScript compilation passes: `npm run build` (or `ng build`) in `frontend/`

---

## Phase 3: Frontend Service

### Overview
Create the Bangumi Angular service. It manages login state (OAuth) and provides `getRating()` which fetches the community score unauthenticated.

### Changes Required

#### 1. New file: `frontend/src/app/services/anime/bangumi.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ExtRating } from '../../models/components';

interface BangumiUser {
  id: number;
  username: string;
  nickname: string;
  avatar?: { large?: string; medium?: string; small?: string };
}

@Injectable({
  providedIn: 'root',
})
export class BangumiService {
  private readonly baseUrl = 'https://api.bgm.tv';
  private readonly authUrl = `${environment.backend}bangumi/auth`;
  private readonly userinfoUrl = `${environment.backend}bangumi/userinfo`;
  private readonly userAgent = 'myanili/2.0 (https://github.com/infanf/myanili)';
  private accessToken = '';

  isLoggedIn = new BehaviorSubject<boolean>(false);
  user = new BehaviorSubject<BangumiUser | undefined>(undefined);

  constructor() {
    this.accessToken = String(localStorage.getItem('bangumiAccessToken') || '');
    if (this.accessToken) {
      this.checkLogin();
    }
  }

  private async checkLogin(): Promise<void> {
    try {
      const response = await fetch(this.userinfoUrl, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      if (response.ok) {
        const user: BangumiUser = await response.json();
        this.user.next(user);
        this.isLoggedIn.next(true);
      } else {
        this.logout();
      }
    } catch {
      this.logout();
    }
  }

  async login(): Promise<void> {
    return new Promise((resolve, reject) => {
      const popup = window.open(this.authUrl, 'bangumi_auth', 'width=600,height=700');
      const handler = (event: MessageEvent) => {
        if (!event.data?.bangumi) return;
        window.removeEventListener('message', handler);
        popup?.close();
        const { at, rt } = event.data;
        this.accessToken = at;
        localStorage.setItem('bangumiAccessToken', at);
        localStorage.setItem('bangumiRefreshToken', rt);
        this.checkLogin().then(resolve).catch(reject);
      };
      window.addEventListener('message', handler);
    });
  }

  logout(): void {
    this.accessToken = '';
    localStorage.removeItem('bangumiAccessToken');
    localStorage.removeItem('bangumiRefreshToken');
    this.user.next(undefined);
    this.isLoggedIn.next(false);
  }

  async getRating(subjectId: number | undefined): Promise<ExtRating | undefined> {
    if (!subjectId) return undefined;
    try {
      const response = await fetch(`${this.baseUrl}/v0/subjects/${subjectId}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': this.userAgent,
        },
      });
      if (!response.ok) return undefined;
      const data = await response.json();
      const score: number = data?.rating?.score ?? 0;
      const total: number = data?.rating?.total ?? 0;
      if (!score) return undefined;
      return { nom: score, norm: score * 10, ratings: total };
    } catch {
      return undefined;
    }
  }
}
```

### Success Criteria

#### Automated Verification
- [ ] TypeScript compilation passes

#### Manual Verification
- [ ] `BangumiService.getRating(387)` (Haruhi) returns `{ nom: ~8.x, norm: ~8x, ratings: <number> }`

---

## Phase 4: Icon Component

### Overview
Create the Bangumi icon component and register it in `icon.module.ts`.

### Changes Required

#### 1. New file: `frontend/src/app/icon/bangumi/bangumi.component.ts`

```typescript
import { Component } from '@angular/core';

import { IconComponent } from '../icon.component';

@Component({
  selector: 'myanili-icon-bangumi',
  templateUrl: './bangumi.component.html',
  styleUrls: ['../icon.component.scss'],
  standalone: false,
})
export class BangumiIconComponent extends IconComponent {
  name = 'bangumi';
}
```

#### 2. New file: `frontend/src/app/icon/bangumi/bangumi.component.html`

Inline SVG (source: [bangumi by-euai from-iconfont](https://github.com/rabbitohh/bangumi-css/blob/main/bangumi%20by-euai%20from-iconfont.svg)):

```html
<svg
  [attr.width]="size"
  [attr.height]="size"
  viewBox="0 0 1024 1024"
  xmlns="http://www.w3.org/2000/svg"
  style="vertical-align: middle"
>
  <path d="M228.115268 615.399298a12.300795 12.300795 0 0 0 11.35458 7.569719 12.471113 12.471113 0 0 0 4.749999-0.965139l147.609537-61.882459a12.300795 12.300795 0 0 0 0.26494-22.557765l-147.609537-66.235049a12.300795 12.300795 0 1 0-10.067727 22.444219l121.740019 54.634453-121.456155 50.906366a12.300795 12.300795 0 0 0-6.585656 16.085655zM399.020617 627.965033H239.469848a12.300795 12.300795 0 0 0 0 24.601589h159.550769a12.300795 12.300795 0 0 0 0-24.601589zM399.020617 667.460046H239.469848a12.300795 12.300795 0 0 0 0 24.601589h159.550769a12.300795 12.300795 0 0 0 0-24.601589zM872.941851 476.892349l-133.283841 58.381464a12.300795 12.300795 0 0 0-0.397411 22.349598l133.302766 64.058754a12.073703 12.073703 0 0 0 5.317729 1.23008 12.300795 12.300795 0 0 0 5.336652-23.390435l-109.15536-52.42031L882.896033 499.469038a12.300795 12.300795 0 1 0-9.954182-22.576689zM877.881094 627.965033h-148.101569a12.300795 12.300795 0 0 0 0 24.601589h148.101569a12.300795 12.300795 0 0 0 0-24.601589zM877.881094 667.460046h-148.101569a12.300795 12.300795 0 0 0 0 24.601589h148.101569a12.300795 12.300795 0 0 0 0-24.601589zM644.866193 537.128395h-162.919295a12.28187 12.28187 0 0 0-10.711153 18.318722l81.374488 145.130453a12.300795 12.300795 0 0 0 21.460155 0l81.374489-145.130453a12.300795 12.300795 0 0 0-10.730078-18.318722z m-81.374488 132.299778l-60.444213-107.698189h120.888426z" fill="#d4237a"></path>
  <path d="M891.411968 334.960102H648.405037c-6.812748-15.13944-19.813742-28.386449-36.864535-38.018917L803.092262 19.283861a12.300795 12.300795 0 0 0-20.249001-13.966133L588.566402 286.873457a147.723082 147.723082 0 0 0-45.418319-7.001991 151.507942 151.507942 0 0 0-31.887445 3.368526L239.980804 4.712151A12.300795 12.300795 0 0 0 222.437978 21.87649l262.726051 269.803739c-22.14143 9.821711-39.116527 25.112546-47.310749 43.242025H132.547555A91.763929 91.763929 0 0 0 40.764702 426.705107v414.44216A91.763929 91.763929 0 0 0 132.547555 932.967969h268.024855l-19.908363 46.989036c-12.641432 29.881469 22.614538 57.094612 48.294812 37.299794L538.473781 932.967969h352.938187a91.763929 91.763929 0 0 0 91.782853-91.782853v-414.442161a91.763929 91.763929 0 0 0-91.782853-91.782853z m34.839635 463.815658a60.709153 60.709153 0 0 1-60.709153 60.709153H585.670984L487.870204 932.967969l-77.002975 57.851583 24.412346-57.851583 31.016927-73.483056H198.082405A60.728077 60.728077 0 0 1 137.27863 798.737912V440.330602a60.728077 60.728077 0 0 1 60.728077-60.728077h667.460046a60.709153 60.709153 0 0 1 60.709153 60.728077z" fill="#d4237a"></path>
</svg>
```

#### 3. Modify `frontend/src/app/icon/icon.module.ts`

Add import at the top (after line 12, `BakamangaIconComponent`):

```typescript
import { BangumiIconComponent } from './bangumi/bangumi.component';
```

Add `BangumiIconComponent` to both the `declarations` and `exports` arrays (alphabetically between `BakamangaIconComponent` and `FandomIconComponent`).

### Success Criteria

#### Automated Verification
- [ ] TypeScript compilation passes

#### Manual Verification
- [ ] Bangumi icon renders correctly in the Settings → Accounts page

---

## Phase 5: Login Component

### Overview
Create the Bangumi login component, register it in `logins.module.ts`, and add it to the logins template.

### Changes Required

#### 1. New file: `frontend/src/app/components/logins/bangumi-login/bangumi-login.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { GlobalService } from '@services/global.service';
import { BangumiService } from '@services/anime/bangumi.service';

interface BangumiUser {
  id: number;
  username: string;
  nickname: string;
}

@Component({
  selector: 'myanili-bangumi-login',
  templateUrl: './bangumi-login.component.html',
  standalone: false,
})
export class BangumiLoginComponent implements OnInit {
  bangumiLoggedIn?: BangumiUser;
  bangumiLoading = false;

  constructor(
    private bangumi: BangumiService,
    private glob: GlobalService,
  ) {
    window.addEventListener('myanili-mal-logoff', () => {
      this.bangumiLogoff();
    });
  }

  ngOnInit() {
    this.bangumi.user.subscribe(user => {
      this.bangumiLoggedIn = user as BangumiUser | undefined;
    });
  }

  getProfileUrl(): string {
    if (this.bangumiLoggedIn?.username) {
      return `https://bgm.tv/user/${this.bangumiLoggedIn.username}`;
    }
    return 'https://bgm.tv';
  }

  async bangumiConnect() {
    this.bangumiLoading = true;
    try {
      this.glob.busy();
      await this.bangumi.login();
      this.glob.notbusy();
    } finally {
      this.bangumiLoading = false;
    }
  }

  async bangumiLogoff() {
    this.bangumi.logout();
  }
}
```

#### 2. New file: `frontend/src/app/components/logins/bangumi-login/bangumi-login.component.html`

```html
<div class="row">
  <div class="col-5">Bangumi</div>
  <div class="col-7">
    @if (bangumiLoggedIn) {
      <myanili-icon-bangumi class="me-1"></myanili-icon-bangumi>
      <a [href]="getProfileUrl()" target="_blank">{{ bangumiLoggedIn.nickname || bangumiLoggedIn.username || 'Connected' }}</a>
      <myanili-icon
        class="cursor-pointer"
        name="x"
        size="20"
        (click)="bangumiLogoff()"
      ></myanili-icon>
    } @else {
      <button
        class="btn btn-sm btn-primary"
        (click)="bangumiConnect()"
        [disabled]="bangumiLoading"
      >
        @if (bangumiLoading) {
          <myanili-icon-loading></myanili-icon-loading>
        } @else {
          <myanili-icon-bangumi></myanili-icon-bangumi>
        }
        Connect
      </button>
    }
  </div>
</div>
```

#### 3. Modify `frontend/src/app/components/logins/logins.module.ts`

Add import:

```typescript
import { BangumiLoginComponent } from './bangumi-login/bangumi-login.component';
```

Add `BangumiLoginComponent` to the `declarations` array.

#### 4. Modify `frontend/src/app/components/logins/logins.component.html`

Add after `<myanili-mangabaka-login>` (line 13):

```html
    <myanili-bangumi-login></myanili-bangumi-login>
```

### Success Criteria

#### Automated Verification
- [ ] TypeScript compilation passes

#### Manual Verification
- [ ] Settings → Accounts shows a "Bangumi" row with a "Connect" button
- [ ] Clicking "Connect" opens the bgm.tv OAuth popup
- [ ] After authorizing, the popup closes and the username/nickname appears
- [ ] Clicking "×" logs out and resets to the "Connect" button

---

## Phase 6: Anime Details Integration

### Overview
Inject `BangumiService` into the anime details component, add a `getRating('bangumi')` call, and add a template row.

### Changes Required

#### 1. Modify `frontend/src/app/anime/details/details.component.ts`

Add import at the top of the file:

```typescript
import { BangumiService } from '@services/anime/bangumi.service';
```

Inject in the constructor (alongside other services):

```typescript
private bangumi: BangumiService,
```

In `getRatings()` (around line 604), add at the end of the method:

```typescript
    if (!this.getRating('bangumi')) {
      this.bangumi.getRating(this.anime?.my_extension?.bangumiId).then(rating => {
        this.setRating('bangumi', rating);
      });
    }
```

#### 2. Modify `frontend/src/app/anime/details/details.component.html`

Add a new platform row after the ANN block (after line ~539), following the same two-column pattern:

```html
        @if (anime.my_extension?.bangumiId) {
          <div class="row">
            <div class="col-4">
              <myanili-external-rating [rating]="getRating('bangumi')"></myanili-external-rating>
            </div>
            <div class="col-8">
              <a
                href="https://bgm.tv/subject/{{ anime.my_extension?.bangumiId }}"
                target="_blank"
              >
                <myanili-icon-bangumi></myanili-icon-bangumi>
                Bangumi
              </a>
            </div>
          </div>
        }
```

### Success Criteria

#### Automated Verification
- [ ] TypeScript compilation passes

#### Manual Verification
- [ ] On an anime detail page with a valid `bangumiId` set, a "Bangumi" row appears with a community score
- [ ] The score matches the rating on `https://bgm.tv/subject/{bangumiId}`
- [ ] Clicking the Bangumi link opens the correct bgm.tv subject page
- [ ] On an anime detail page without `bangumiId`, no Bangumi row appears

---

## Phase 7: Manga Details Integration

### Overview
Same as Phase 6 but for manga. Reference: `manga/details/details.component.ts:546-625` where `getRatings()` is defined.

### Changes Required

#### 1. Modify `frontend/src/app/manga/details/details.component.ts`

Add import:

```typescript
import { BangumiService } from '@services/anime/bangumi.service';
```

Inject in constructor:

```typescript
private bangumi: BangumiService,
```

In `getRatings()` (around line 611, after the `mangabaka` block), add:

```typescript
    if (!this.getRating('bangumi')) {
      this.bangumi.getRating(this.manga?.my_extension?.bangumiId).then(rating => {
        this.setRating('bangumi', rating);
      });
    }
```

#### 2. Modify `frontend/src/app/manga/details/details.component.html`

Find the equivalent external ratings section and add a Bangumi row matching the same pattern as anime:

```html
        @if (manga.my_extension?.bangumiId) {
          <div class="row">
            <div class="col-4">
              <myanili-external-rating [rating]="getRating('bangumi')"></myanili-external-rating>
            </div>
            <div class="col-8">
              <a
                href="https://bgm.tv/subject/{{ manga.my_extension?.bangumiId }}"
                target="_blank"
              >
                <myanili-icon-bangumi></myanili-icon-bangumi>
                Bangumi
              </a>
            </div>
          </div>
        }
```

### Success Criteria

#### Automated Verification
- [ ] TypeScript compilation passes

#### Manual Verification
- [ ] On a manga detail page with a valid `bangumiId` (Bangumi `subject_type=1`), the community score appears
- [ ] The link opens the correct bgm.tv subject page

---

## Testing Strategy

### Manual Testing Steps

1. Register a Bangumi developer app at `https://bgm.tv/dev/app`, set redirect URI to `http://localhost:4280/bangumi/auth`.
2. Add `BANGUMI_CLIENT_ID` and `BANGUMI_CLIENT_SECRET` to `backend/.env`.
3. Start the dev environment.
4. Go to Settings → Accounts, click "Connect" for Bangumi, complete OAuth.
5. Find an anime on MAL and look up its Bangumi ID manually at bgm.tv (e.g., Haruhi = 387).
6. Open that anime's edit dialog and enter the Bangumi subject ID.
7. Navigate to that anime's detail page — confirm the Bangumi score appears.
8. Repeat for a manga title with a Bangumi Book subject ID.
9. Click the Bangumi "×" to log out — confirm token is cleared.

### Edge Cases to Verify

- Anime with `bangumiId` set but not yet rated on Bangumi (`rating.score = 0`) → no row should appear (service returns `undefined`)
- Invalid/non-existent `bangumiId` → `getRating` returns `undefined`, no row shown
- User not logged into Bangumi → ratings still appear (community scores are public)

## References

- Research document: `thoughts/shared/research/2026-03-18-113-bangumi-integration.md`
- Reference backend provider: `backend/app/Providers/MangabakaServiceProvider.php`
- Reference auth route: `backend/routes/web.php:443-506`
- Reference frontend service: `frontend/src/app/services/manga/mangabaka.service.ts`
- Reference login component: `frontend/src/app/components/logins/mangabaka-login/`
- Reference icon: `frontend/src/app/icon/mangabaka/mangabaka.component.ts`
- Bangumi API docs: https://bangumi.github.io/api/
- Bangumi OAuth docs: https://github.com/bangumi/api/blob/master/docs-raw/How-to-Auth.md
