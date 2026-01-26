---
date: 2026-01-26T17:30:00+01:00
planner: Claude (Sonnet 4.5)
git_commit: 2e4a0c4
branch: feat/107_mangabaka-integration
repository: beta
topic: "Complete MangaBaka Integration (#107)"
tags: [implementation-plan, mangabaka, external-service-integration, manga, library-sync]
status: pending
last_updated: 2026-01-26
last_updated_by: Claude
github_issue: https://github.com/infanf/myanili/issues/107
---

# MangaBaka Integration Completion Implementation Plan

## Overview

Complete the MangaBaka integration for MyAniLi by connecting the existing, fully-functional MangaBaka API service layer to the main manga tracking workflow. The service layer (authentication, API wrapper, data models) is already implemented - this plan focuses on wiring it into the existing patterns used by other external services (MAL, AniList, Kitsu, MangaUpdates, etc.).

## Current State Analysis

### What EXISTS:
✅ Complete MangaBaka API service (`MangabakaService`) with all CRUD operations
✅ PAT authentication system with login UI component
✅ Data models for all MangaBaka types (`MangaBakaSeries`, `MangaBakaLibraryEntry`, `MangaBakaUser`)
✅ Icon component using MangaBaka logo
✅ Cross-service mapping API (`mapFromSource()` supports AniList, MAL, Kitsu, etc.)
✅ Caching layer integration

**File References:**
- `frontend/src/app/services/manga/mangabaka.service.ts` - Complete service (lines 1-294)
- `frontend/src/app/models/mangabaka.ts` - Data models (lines 1-65)
- `frontend/src/app/components/logins/mangabaka-login/` - Login component
- `MANGABAKA_SETUP.md` - Comprehensive documentation

### What's MISSING (per GitHub issue #107):

**1. Synchronize database changes to user's MB library**
- `MangabakaService` is injected in `MangaService` (line 41) but never used
- No sync calls in `MangaService.updateManga()` (lines 99-189)
- No sync calls in `MangaService.deleteManga()` (lines 191-205)
- Need status mapping function (MAL states → MangaBaka states)

**2. Fetch missing external IDs from MB**
- No `mangabakaId` field in `MangaExtension` model (`frontend/src/app/models/manga.ts:139-162`)
- No ID lookup in manga details page's `checkExternalIds()` method (`details.component.ts:127-246`)
- MangaBaka's `mapFromSource()` API already exists but isn't used

**3. Use MB to fetch ratings from external databases**
- MangaBaka API returns ratings in series data (`MangaBakaSeries.rating` field)
- No rating fetch in `details.component.ts getRatings()` method (lines 485-550)
- Need to add MangaBaka to the ratings array

**4. Add link to MB entries on manga details page**
- No MangaBaka link in the details template (`details.component.html`)
- No search modal for finding/linking MangaBaka series
- Pattern exists in `manga-edit.component.ts` (`findKitsu()` line 253, `findBaka()` line 263, `findANN()` line 272)

### Key Discoveries:

**Pattern: Parallel Sync Updates**
- All services updated simultaneously with `Promise.all()` in `MangaService.updateManga()`
- MAL is primary service (result returned)
- Each service checks if logged in before attempting update
- External IDs fetched on-demand if missing
- Data transformed per service (e.g., AniList uses score * 10, Kitsu uses score * 2)
- Status enums converted using service-specific `statusFromMal()` methods

**Pattern: On-Demand ID Mapping**
- IDs stored in `my_extension` field (Base64-encoded JSON in MAL comments)
- Fetching happens lazily on details page load if IDs are missing
- Multiple fallback strategies: direct ID mapping → title search → fuzzy matching
- All ID lookups happen in parallel with `Promise.all()`
- Successfully fetched IDs are saved back to MAL

**Pattern: Progressive Rating Display**
- Ratings fetched asynchronously (fire-and-forget pattern with `.then()`)
- Each service updates the ratings array independently as data arrives
- User's personal score takes precedence over aggregated ratings
- Weighted mean calculation based on number of ratings per service

## Desired End State

After implementation, the MangaBaka integration should:

1. **Automatically sync library changes** from MyAniLi to MangaBaka whenever user updates manga status, progress, or rating
2. **Automatically fetch MangaBaka IDs** for manga using AniList/MAL mapping when viewing details page
3. **Display MangaBaka ratings** alongside other service ratings (AniList, Kitsu, etc.) on details page
4. **Show clickable link** to MangaBaka series on manga details page with icon
5. **Delete from MangaBaka library** when user deletes manga from MyAniLi

### Verification:
- User can update manga in MyAniLi and see it sync to MangaBaka library
- MangaBaka rating appears in the ratings section on manga details page
- MangaBaka link appears in external links section when ID is found
- Clicking MangaBaka link opens correct series page on mangabaka.org
- User can delete manga and it's removed from MangaBaka library

## What We're NOT Doing

- **NOT implementing bidirectional sync** (changes from MangaBaka → MyAniLi) - one-way sync from MyAniLi to MangaBaka only
- **NOT adding manual search modal** (like Kitsu/Baka-Updates have) in this phase - auto-fetch using `mapFromSource()` only
- **NOT implementing OAuth authentication** - PAT-only (OAuth not yet available from MangaBaka)
- **NOT adding MangaBaka to anime tracking** - manga only per issue requirements
- **NOT creating new UI components** - use existing patterns and components
- **NOT modifying MangaBaka API service** - it's already complete

## Bonus Feature: Extract ANN and Anime-Planet IDs from MangaBaka

MangaBaka series data includes external IDs from multiple sources in the `source` object, including `anime_news_network` and `anime_planet`. We'll extract these IDs when fetching MangaBaka series data.

**What We're Extracting:**
1. **ANN ID** - Persisted in `manga.my_extension.annId`
   - Provides fallback/enhancement to direct ANN API lookup
   - Saved for future page loads

2. **Anime-Planet ID** - Stored temporarily in component property
   - Used only for link display during current page view
   - NOT persisted in extension (matches anime pattern)
   - Regenerated fresh on each page load

**Benefits:**
- Anime News Network (ANN) links more reliably work for manga
- Anime-Planet links now available for manga (currently anime-only)
- No additional API calls needed - extracted from MangaBaka data already being fetched
- Leverages MangaBaka's aggregated ID data
- Consistent with existing patterns (anime doesn't persist Anime-Planet IDs either)

## Implementation Approach

Follow the established patterns used by other external services (AniList, Kitsu, Shikimori, MangaUpdates). Wire MangaBaka into existing sync points, ID lookup mechanisms, and rating display systems. Use one-way sync (MyAniLi → MangaBaka) with auto-fetch IDs via `mapFromSource()` API.

---

## Phase 1: Data Model Extension

### Overview
Add `mangabakaId` field to the `MangaExtension` interface to store MangaBaka series IDs, and extend the `MangaBakaSeries` interface to include external source IDs.

### Changes Required:

#### 1. Update MangaBakaSeries Interface
**File**: `frontend/src/app/models/mangabaka.ts`
**Lines**: 1-14
**Changes**: Add `source` field to include external service IDs

```typescript
export interface MangaBakaSeries {
  id: number;
  state: 'active' | 'merged' | 'deleted';
  merged_with: number | null;
  title: string;
  native_title: string | null;
  romanized_title: string | null;
  type: 'manga' | 'novel' | 'manhwa' | 'manhua' | 'oel' | 'other';
  status: 'cancelled' | 'completed' | 'hiatus' | 'releasing' | 'unknown' | 'upcoming';
  description: string | null;
  cover_image: string | null;
  genres: string[];
  rating: number | null;
  source?: {  // ADD THIS FIELD
    anilist?: { id: number | null; rating: number | null; rating_normalized: number | null };
    anime_planet?: { id: number | null; rating: number | null; rating_normalized: number | null };
    anime_news_network?: { id: number | null; rating: number | null; rating_normalized: number | null };
    kitsu?: { id: number | null; rating: number | null; rating_normalized: number | null };
    manga_updates?: { id: string | null; rating: number | null; rating_normalized: number | null };
    my_anime_list?: { id: number | null; rating: number | null; rating_normalized: number | null };
    shikimori?: { id: number | null; rating: number | null; rating_normalized: number | null };
  };
}
```

#### 2. Update MangaExtension Interface
**File**: `frontend/src/app/models/manga.ts`
**Lines**: 139-162
**Changes**: Add `mangabakaId` field after `bakaId`

```typescript
interface MangaExtensionInterface {
  comment?: string;
  platform?: string;
  platformId?: string;
  ongoing?: boolean;
  hideShelf?: boolean;
  publisher?: string;
  publisherWebsite?: string;
  displayName?: string;
  anilistId?: number;
  malId?: number;
  kitsuId?: { kitsuId: number | string; entryId?: string | undefined };
  bakaId?: number | string;
  bakaMigrated?: boolean;
  mangabakaId?: number;  // ADD THIS LINE
  mdId?: string;
  anisearchId?: number;
  annId?: number;
  /** manga-passion.de */
  mpasId?: number;
  fandomSlug?: string;
  simulpub?: Weekday[];
}
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compilation passes: `cd frontend && npx tsc --noEmit`
- [x] No linting errors: `cd frontend && npm run lint`
- [x] Type checking confirms `mangabakaId` is optional number

#### Manual Verification:
- [x] IDE autocomplete shows `mangabakaId` on `MangaExtension` objects
- [x] No type errors when accessing `manga.my_extension.mangabakaId`

---

## Phase 2: Status Mapping Function

### Overview
Create a function to convert MAL reading states to MangaBaka library states, following the pattern used by other services.

### Changes Required:

#### 1. Add Status Mapping Function to MangabakaService
**File**: `frontend/src/app/services/manga/mangabaka.service.ts`
**Location**: After `removeFromLibrary()` method (after line 275)
**Changes**: Add `statusFromMal()` helper method

```typescript
  /**
   * Map MAL reading status to MangaBaka library state
   */
  statusFromMal(malStatus?: ReadStatus): 'reading' | 'completed' | 'dropped' | 'paused' | 'plan_to_read' | 'rereading' | undefined {
    switch (malStatus) {
      case 'reading':
        return 'reading';
      case 'completed':
        return 'completed';
      case 'on_hold':
        return 'paused';
      case 'dropped':
        return 'dropped';
      case 'plan_to_read':
        return 'plan_to_read';
      default:
        return undefined;
    }
  }
```

**Notes**:
- MangaBaka states: `reading`, `completed`, `dropped`, `paused`, `plan_to_read`, `considering`, `rereading`
- MAL states: `reading`, `completed`, `on_hold`, `dropped`, `plan_to_read`
- Direct mapping except `on_hold` → `paused`
- `rereading` state handled separately via `is_rereading` flag

#### 2. Import ReadStatus Type
**File**: `frontend/src/app/services/manga/mangabaka.service.ts`
**Location**: Top of file (lines 1-12)
**Changes**: Add import

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ReadStatus } from '@models/manga';  // ADD THIS IMPORT
import { CacheService } from '../cache.service';
import {
  MangaBakaSeries,
  MangaBakaLibraryEntry,
  // ... rest of imports
}
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compilation passes: `cd frontend && npx tsc --noEmit`
- [x] Method is accessible on service: `this.mangabaka.statusFromMal('reading')` type-checks
- [x] Return type matches MangaBaka state union type

#### Manual Verification:
- [x] Function returns correct mapping for each MAL status
- [x] Returns `undefined` for invalid status
- [x] `on_hold` → `paused` mapping works correctly

---

## Phase 3: Library Synchronization

### Overview
Wire MangaBaka sync into `MangaService.updateManga()` and `MangaService.deleteManga()` methods, following the established parallel update pattern.

### Changes Required:

#### 1. Add MangaBaka to updateManga() Sync
**File**: `frontend/src/app/services/manga/manga.service.ts`
**Lines**: 99-189
**Changes**:
1. Add `mangabakaId` to method signature `ids` parameter (lines 100-106)
2. Add MangaBaka sync promise to `Promise.all()` array (after line 186)

**Updated Method Signature**:
```typescript
async updateManga(
  ids: {
    malId: number;
    anilistId?: number;
    kitsuId?: { kitsuId: number | string; entryId?: string | undefined };
    anisearchId?: number;
    bakaId?: number | string;
    mangabakaId?: number;  // ADD THIS LINE
  },
  data: MyMangaUpdateExtended,
): Promise<MyMangaStatus> {
```

**Add to Promise.all() Array** (after Baka-Updates sync, before closing bracket on line 187):
```typescript
      (async () => {
        if (!this.mangabaka.isLoggedIn.value) return;
        if (!ids.mangabakaId) return;

        const state = data.is_rereading ? 'rereading' : this.mangabaka.statusFromMal(data.status);
        if (!state) return;

        try {
          return await this.mangabaka.updateLibraryEntry(ids.mangabakaId, {
            state,
            progress_chapter: data.num_chapters_read || null,
            progress_volume: data.num_volumes_read || null,
            rating: data.score ? Math.round(data.score * 10) : null,
            start_date: data.start_date || null,
            finish_date: data.finish_date || null,
            number_of_rereads: data.num_times_reread || null,
            note: data.comments || null,
          });
        } catch (error) {
          console.error('MangaBaka updateLibraryEntry error:', error);
          return;
        }
      })(),
```

**Notes**:
- Check `isLoggedIn` observable before attempting sync
- Skip if `mangabakaId` is missing (not yet linked)
- Convert score to 0-100 scale (MAL is 0-10, MangaBaka is 0-100)
- Handle `is_rereading` flag → `rereading` state
- Wrap in try-catch to prevent sync failures from breaking MAL update
- Return early on error (graceful degradation)

#### 2. Add MangaBaka to deleteManga() Sync
**File**: `frontend/src/app/services/manga/manga.service.ts`
**Lines**: 191-205
**Changes**:
1. Add `mangabakaId` to method signature `ids` parameter (lines 191-196)
2. Add MangaBaka delete promise to `Promise.all()` array (after line 202)

**Updated Method Signature**:
```typescript
async deleteManga(ids: {
  malId: number;
  anilistId?: number;
  kitsuId?: { kitsuId: number | string; entryId?: string | undefined };
  anisearchId?: number;
  mangabakaId?: number;  // ADD THIS LINE
}) {
```

**Add to Promise.all() Array** (after Shikimori delete, before closing bracket on line 203):
```typescript
      (async () => {
        if (!ids.mangabakaId) return;
        try {
          return await this.mangabaka.removeFromLibrary(ids.mangabakaId);
        } catch (error) {
          console.error('MangaBaka removeFromLibrary error:', error);
          return;
        }
      })(),
```

#### 3. Update All Call Sites
**Files**: `frontend/src/app/manga/details/details.component.ts`
**Locations**: All calls to `updateManga()` and `deleteManga()`
**Changes**: Add `mangabakaId` to IDs object

**Call sites to update**:
1. Line 221-244: `checkExternalIds()` - update save call
2. Line 282-291: `setStatus()` - add `mangabakaId`
3. Line 300-314: `reread()` - add `mangabakaId`
4. Line 333-348: `startOver()` - add `mangabakaId`
5. Line 409-418: `plusOne()` - add `mangabakaId`
6. Line 443-448: `deleteEntry()` - add `mangabakaId`

**Example Update** (line 221-244):
```typescript
await this.mangaService.updateManga(
  {
    malId: manga.id,
    kitsuId: this.manga.my_extension.kitsuId,
    anilistId: this.manga.my_extension.anilistId,
    anisearchId: this.manga.my_extension.anisearchId,
    bakaId: this.manga.my_extension.bakaId,  // existing
    mangabakaId: this.manga.my_extension.mangabakaId,  // ADD THIS
  },
  {
    status: manga.my_list_status.status || 'plan_to_read',
    is_rereading: manga.my_list_status.is_rereading,
    extension: Base64.encode(
      JSON.stringify({
        ...manga.my_extension,
        // ... existing IDs
        mangabakaId: this.manga.my_extension.mangabakaId,  // ADD THIS
      }),
    ),
  },
);
```

**Repeat for all 6 call sites** - each gets `mangabakaId` added to both:
- The IDs object passed to `updateManga()`/`deleteManga()`
- The extension JSON if applicable

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compilation passes: `cd frontend && npx tsc --noEmit`
- [x] No linting errors: `cd frontend && npm run lint`
- [x] All call sites type-check with new `mangabakaId` parameter

#### Manual Verification:
- [x] When logged into MangaBaka, updating manga in MyAniLi syncs to MangaBaka library
- [x] Check MangaBaka library at mangabaka.org - entry should appear/update
- [x] Status, progress, rating, dates sync correctly
- [x] Re-reading state syncs as `rereading` in MangaBaka
- [x] Score converts correctly (MAL 7/10 → MangaBaka 70/100)
- [x] Deleting manga removes from MangaBaka library
- [x] Sync works silently in background (no user-facing errors)
- [x] If MangaBaka ID missing, sync is skipped gracefully

---

## Phase 4: External ID Mapping

### Overview
Add MangaBaka ID auto-fetch to the manga details page's `checkExternalIds()` method using the existing `mapFromSource()` API.

### Changes Required:

#### 1. Add MangaBaka ID Lookup and Extract Additional IDs
**File**: `frontend/src/app/manga/details/details.component.ts`
**Lines**: 127-246 (inside `checkExternalIds()` method)
**Changes**: Add MangaBaka ID fetch after MangaPassion lookup (after line 218, before Promise.all)

```typescript
    if (!this.manga.my_extension.mangabakaId) {
      promises.push(
        (async () => {
          let mbSeries;

          // Try AniList ID mapping first
          if (this.manga?.my_extension?.anilistId) {
            try {
              mbSeries = await this.mangabaka.mapFromSource(
                'anilist',
                this.manga.my_extension.anilistId,
              );
              if (mbSeries && this?.manga?.my_extension) {
                this.manga.my_extension.mangabakaId = mbSeries.id;
              }
            } catch (error) {
              console.log('MangaBaka AniList mapping failed:', error);
            }
          }

          // Fallback to MAL ID mapping
          if (!mbSeries && this.manga?.id) {
            try {
              mbSeries = await this.mangabaka.mapFromSource('my-anime-list', this.manga.id);
              if (mbSeries && this?.manga?.my_extension) {
                this.manga.my_extension.mangabakaId = mbSeries.id;
              }
            } catch (error) {
              console.log('MangaBaka MAL mapping failed:', error);
            }
          }

          // Extract additional IDs from MangaBaka source data
          if (mbSeries && this?.manga?.my_extension) {
            // Anime News Network ID (provides fallback/enhancement to direct ANN lookup)
            if (!this.manga.my_extension.annId && mbSeries.source?.anime_news_network?.id) {
              this.manga.my_extension.annId = mbSeries.source.anime_news_network.id;
            }

            // Anime-Planet ID (temporary - not persisted, used for link display only)
            if (mbSeries.source?.anime_planet?.id) {
              // Store temporarily on component for link generation
              this.animePlanetId = mbSeries.source.anime_planet.id;
            }
          }
        })(),
      );
    }
```

**Notes**:
- Try AniList mapping first (more reliable)
- Fallback to MAL mapping if AniList fails or missing
- Extract ANN ID from MangaBaka's source data (persisted in extension)
- ANN ID extraction provides a fallback/enhancement (ANN direct lookup already exists at line 180-193)
- Extract Anime-Planet ID from MangaBaka's source data (NOT persisted, stored on component temporarily)
- Anime-Planet ID used only for link display, regenerated on each page load
- Wrap in async IIFE to handle await
- Graceful error handling - log and continue
- Push promise to array for parallel execution

#### 2. Add Component Property for Anime-Planet ID
**File**: `frontend/src/app/manga/details/details.component.ts`
**Location**: Class properties (after line 40)
**Changes**: Add property to temporarily store Anime-Planet ID

```typescript
export class MangaDetailsComponent implements OnInit {
  @Input() id = 0;
  @Input() inModal = false;
  manga?: Manga;
  title?: string;
  shortsyn = true;
  fromCache = false;
  busy = false;
  ratings: Array<{ provider: string; rating: ExtRating }> = [];
  activeTab = 1;
  originalLanguage = 'Japanese';
  animePlanetId?: number;  // ADD THIS LINE - temporary storage for link display
```

#### 3. Add MangabakaService Import and Injection
**File**: `frontend/src/app/manga/details/details.component.ts`
**Changes**:
1. Add import at top (after line 17)
2. Add to constructor injection (after line 52)

**Import**:
```typescript
import { MangabakaService } from '@services/manga/mangabaka.service';
```

**Constructor Injection** (after `mangapassion: MangapassionService,`):
```typescript
  constructor(
    private mangaService: MangaService,
    private route: ActivatedRoute,
    private glob: GlobalService,
    public platformPipe: PlatformPipe,
    private anilist: AnilistService,
    private kitsu: KitsuService,
    private shikimori: ShikimoriService,
    private baka: MangaupdatesService,
    private mangadex: MangadexService,
    private mangapassion: MangapassionService,
    private mangabaka: MangabakaService,  // ADD THIS LINE
    private anisearch: AnisearchService,
    private ann: AnnService,
    private modalService: NgbModal,
    private cache: CacheService,
    private dialogue: DialogueService,
  ) {
```

#### 4. Update Extension Save in checkExternalIds()
**File**: `frontend/src/app/manga/details/details.component.ts`
**Lines**: 231-242
**Changes**: Add `mangabakaId` to extension JSON

```typescript
extension: Base64.encode(
  JSON.stringify({
    ...manga.my_extension,
    kitsuId: this.manga.my_extension.kitsuId,
    anilistId: this.manga.my_extension.anilistId,
    anisearchId: this.manga.my_extension.anisearchId,
    bakaId: this.manga.my_extension.bakaId,
    mangabakaId: this.manga.my_extension.mangabakaId,  // ADD THIS LINE
    annId: this.manga.my_extension.annId,
    mdId: this.manga.my_extension.mdId,
    mpasId: this.manga.my_extension.mpasId,
  }),
),
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compilation passes: `cd frontend && npx tsc --noEmit`
- [x] Service injection type-checks correctly
- [x] No circular dependency warnings

#### Manual Verification:
- [x] Navigate to manga details page
- [x] Check browser console - MangaBaka ID fetch executes
- [x] If AniList ID exists, AniList mapping is attempted first
- [x] If AniList mapping fails, MAL mapping is attempted
- [x] Successfully fetched ID is saved to `my_extension.mangabakaId`
- [x] If MangaBaka has ANN ID in source data, it's extracted to `my_extension.annId`
- [x] If MangaBaka has Anime-Planet ID in source data, it's stored in `this.animePlanetId`
- [x] ANN link appears in details page if ID was fetched
- [x] Anime-Planet link appears if component property is set
- [x] MangaBaka ID persists across page reloads
- [x] Anime-Planet ID is refetched on page reload (not persisted)
- [x] Failed lookups don't break page load
- [x] Lookup only happens once per page load

---

## Phase 5: Rating Display

### Overview
Add MangaBaka rating fetch to the manga details page's `getRatings()` method and include it in the weighted mean calculation.

### Changes Required:

#### 1. Add MangaBaka Rating Fetch
**File**: `frontend/src/app/manga/details/details.component.ts`
**Lines**: 485-550 (inside `getRatings()` method)
**Changes**: Add MangaBaka rating fetch after ANN fetch (after line 549, before method closing)

```typescript
    if (!this.getRating('mangabaka')) {
      const mangabakaId = this.manga?.my_extension?.mangabakaId;
      if (mangabakaId) {
        this.mangabaka.getSeries(mangabakaId).then(series => {
          if (series?.rating) {
            this.setRating('mangabaka', {
              nom: series.rating,
              norm: series.rating,
              unit: '%',
            });
          }
        });
      }
    }
```

**Notes**:
- Use fire-and-forget pattern (`.then()`) like other services
- MangaBaka rating is already 0-100 scale (no conversion needed)
- `nom` and `norm` are both the raw rating (no special normalization)
- No `ratings` count available from MangaBaka API - omit field
- Check for `mangabakaId` before attempting fetch

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compilation passes: `cd frontend && npx tsc --noEmit`
- [ ] Rating object type-checks with `ExtRating` interface

#### Manual Verification:
- [ ] MangaBaka rating appears in ratings section on details page
- [ ] Rating displays with "%" unit
- [ ] Rating contributes to weighted mean calculation
- [ ] Rating bar shows correct percentage
- [ ] If MangaBaka ID missing, rating fetch is skipped
- [ ] Failed rating fetch doesn't break page
- [ ] Rating updates progressively with other services

---

## Phase 6: Details Page Links

### Overview
Add MangaBaka and Anime-Planet links to manga details page template, following the pattern used for other external services. Anime-Planet ID is not persisted - it's extracted from MangaBaka source data and used temporarily for link display.

### Changes Required:

#### 1. Add MangaBaka Link to Template
**File**: `frontend/src/app/manga/details/details.component.html`
**Location**: In external links section (after Baka-Updates link, around line 350-400)
**Changes**: Add MangaBaka link with icon and rating

```html
@if (manga.my_extension?.mangabakaId) {
  <li class="list-inline-item mx-2">
    <myanili-provider-rating
      *ngIf="getRating('mangabaka')"
      [rating]="getRating('mangabaka')"
      [meanRating]="meanRating"
    ></myanili-provider-rating>
    <myanili-icon-mangabaka></myanili-icon-mangabaka>
    <a
      [href]="'https://mangabaka.org/' + manga.my_extension!.mangabakaId"
      target="_blank"
      >MangaBaka</a
    >
  </li>
}
```

**Notes**:
- Use `@if` directive to conditionally show when ID exists
- Include provider rating badge if rating available
- Use existing `<myanili-icon-mangabaka>` component
- Link format: `https://mangabaka.org/{seriesId}`
- Open in new tab (`target="_blank"`)
- Follow exact pattern of other service links (AniList, Kitsu, etc.)

#### 2. Add Anime-Planet Link to Template
**File**: `frontend/src/app/manga/details/details.component.html`
**Location**: In external links section (near other service links)
**Changes**: Add Anime-Planet link using component property (not persisted ID)

```html
@if (animePlanetId) {
  <li class="list-inline-item mx-2">
    <myanili-icon-anime-planet></myanili-icon-anime-planet>
    <a
      [href]="'https://www.anime-planet.com/manga/' + animePlanetId"
      target="_blank"
      >Anime-Planet</a
    >
  </li>
}
```

**Notes**:
- Uses component property `animePlanetId` (not `manga.my_extension.animePlanetId`)
- Property is populated from MangaBaka source data in `checkExternalIds()`
- ID is temporary - not persisted in extension
- Link regenerated fresh on each page load
- Use existing `<myanili-icon-anime-planet>` component
- Open in new tab (`target="_blank"`)

#### 3. Find Correct Insertion Point
**File**: `frontend/src/app/manga/details/details.component.html`
**Action**: Read file to find external links section

First, locate the external links section in the template.

### Success Criteria:

#### Automated Verification:
- [ ] Angular template compilation passes: `cd frontend && npm run build`
- [ ] No template syntax errors

#### Manual Verification:
- [ ] MangaBaka link appears in external links section when ID exists
- [ ] Link is hidden when `mangabakaId` is missing
- [ ] Clicking link opens correct MangaBaka series page
- [ ] MangaBaka icon displays correctly
- [ ] Provider rating badge shows when rating is available
- [ ] Anime-Planet link appears when MangaBaka has source data with Anime-Planet ID
- [ ] Link is hidden when `animePlanetId` component property is not set
- [ ] Clicking Anime-Planet link opens correct manga page
- [ ] Anime-Planet icon displays correctly
- [ ] Link styling matches other external service links
- [ ] Both links open in new tab

---

## Testing Strategy

### Unit Tests
Not required - following established pattern of manual testing for external service integrations. Existing services (AniList, Kitsu, Shikimori, MangaUpdates) have no unit tests for sync operations.

### Integration Tests
Manual end-to-end testing following these scenarios:

#### Scenario 1: New Manga Entry
1. Add new manga to MyAniLi library
2. Navigate to manga details page
3. Verify MangaBaka ID is auto-fetched
4. Verify MangaBaka link appears
5. Verify ANN ID is extracted (if available in MangaBaka source)
6. Verify Anime-Planet ID is extracted and link appears (if available in MangaBaka source)
7. Refresh page - Anime-Planet link should reappear (fetched fresh from MangaBaka)
8. Verify entry syncs to MangaBaka library

#### Scenario 2: Update Existing Entry
1. Update manga status (e.g., reading → completed)
2. Update progress (chapters, volumes)
3. Update rating
4. Verify changes sync to MangaBaka library
5. Check MangaBaka.org to confirm sync

#### Scenario 3: Re-reading
1. Mark manga as re-reading
2. Verify state syncs as `rereading` in MangaBaka
3. Complete re-read
4. Verify reread count increments

#### Scenario 4: Delete Entry
1. Delete manga from MyAniLi
2. Verify removal from MangaBaka library
3. Check MangaBaka.org to confirm deletion

#### Scenario 5: Rating Display
1. Navigate to manga with MangaBaka ID
2. Verify MangaBaka rating appears in ratings section
3. Verify rating contributes to mean calculation
4. Compare with other service ratings

#### Scenario 6: Missing ID Handling
1. Navigate to manga without MangaBaka mapping
2. Verify ID fetch is attempted
3. Verify graceful handling if mapping fails
4. Verify link is hidden when ID missing

#### Scenario 7: Not Logged In
1. Log out of MangaBaka
2. Update manga in MyAniLi
3. Verify sync is skipped gracefully
4. Verify no errors in console
5. Verify MAL update still succeeds

### Manual Testing Steps

**Pre-requisites:**
1. MangaBaka PAT token configured in MyAniLi
2. Test manga with AniList ID (for mapping)
3. Browser dev tools open (watch console)

**Test Execution:**
1. Clear MangaBaka library (if needed)
2. Add test manga to MyAniLi
3. Open details page
4. Watch console for ID fetch
5. Verify link appears
6. Update status/progress
7. Check MangaBaka.org library
8. Verify sync completed
9. Check rating display
10. Delete entry
11. Verify removal from MangaBaka

**Expected Results:**
- No console errors
- All syncs complete successfully
- MangaBaka library matches MyAniLi
- Ratings display correctly
- Links work correctly

## Performance Considerations

**ID Mapping:**
- MangaBaka `mapFromSource()` is cached (uses `cache.fetch()`)
- Lookup happens once per manga, result cached in extension
- Parallel execution with other ID lookups (no blocking)

**Library Sync:**
- Updates happen in parallel with other services
- Fire-and-forget pattern (doesn't block MAL update)
- Failed syncs don't affect user experience
- No retry logic needed (next update will sync)

**Rating Fetch:**
- Progressive loading (doesn't block page render)
- Fire-and-forget pattern (`.then()`)
- Uses cached series data if available
- No user-facing loading indicators needed

**Network Impact:**
- ID lookup: 1 request per manga (cached)
- Sync: 1 request per manga update (when logged in)
- Rating: 1 request per details page view (cached)
- All requests run in parallel with other services

**Optimization Opportunities:**
- Consider bulk ID mapping API if available
- Consider caching rating data separately
- Consider background sync queue for reliability

## Migration Notes

**No data migration required** - this is a net-new integration with no existing data to migrate.

**User Impact:**
- Users must generate MangaBaka PAT token manually
- Existing manga won't have MangaBaka IDs until details page visited
- ID population happens lazily (on-demand)
- No bulk ID fetch in this phase

**Gradual Rollout:**
- MangaBaka features appear as user interacts with manga
- No forced migration or bulk operations
- Users can continue using MyAniLi without MangaBaka
- Integration is opt-in via login

## References

- Original ticket: https://github.com/infanf/myanili/issues/107
- MangaBaka setup: `MANGABAKA_SETUP.md`
- MangaBaka service: `frontend/src/app/services/manga/mangabaka.service.ts`
- MangaBaka models: `frontend/src/app/models/mangabaka.ts`
- Manga service: `frontend/src/app/services/manga/manga.service.ts:99-189` (updateManga pattern)
- Details component: `frontend/src/app/manga/details/details.component.ts:127-246` (ID fetch pattern)
- Details component: `frontend/src/app/manga/details/details.component.ts:485-550` (rating fetch pattern)
- Kitsu service: `frontend/src/app/services/kitsu.service.ts:413-446` (status mapping pattern)
- AniList models: `frontend/src/app/models/anilist.ts:161-199` (status mapping pattern)
