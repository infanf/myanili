# Details Components Edit Modal Extraction Implementation Plan

## Overview

Extract edit functionality from inline conditionals in the Anime and Manga details components into dedicated modal popup components. This refactoring will improve code organization, maintainability, and user experience by presenting the edit interface in a focused popup dialog rather than inline state switching.

## Current State Analysis

### Existing Implementation
- **Anime Details**: `frontend/src/app/anime/details/details.component.ts:52-54`
  - Inline edit mode with `edit` boolean flag
  - Edit UI conditionally rendered in template with `@if (edit)` directives
  - Backup objects: `editBackup` (Partial<MyAnimeUpdate>), `editExtension` (AnimeExtension)
  - Layout shifts on edit: poster hidden, content expands to full width

- **Manga Details**: `frontend/src/app/manga/details/details.component.ts:43-45`
  - Identical pattern to anime with manga-specific fields
  - Backup objects: `editBackup` (Partial<MyMangaUpdate>), `editExtension` (MangaExtension)

### Current Edit Workflow
1. User clicks pencil icon → `startEdit()` creates backup copies
2. Template switches to edit mode with input fields
3. User modifies data via two-way binding `[(ngModel)]`
4. User clicks check icon → `save()` performs differential update
5. Service coordinates updates across 9+ external APIs simultaneously
6. Component reloads with fresh data via `ngOnInit()`

### Current Form Fields

**Anime (15+ fields)**:
- Core: score, status, dates, episodes, priority, tags
- Metadata: displayName, episodeRule, streaming provider/ID
- Schedule: simulcast days/time/timezone/country
- External IDs: AniList, Kitsu, Trakt, SIMKL, Annict, aniSearch, LiveChart, ANN, Fandom
- Preferences: hideWatchlist, comment

**Manga (12+ fields)**:
- Core: score, status, dates, chapters, volumes, priority, tags
- Metadata: displayName, publisher, platform/platformId
- Schedule: simulpub days
- External IDs: AniList, Kitsu, Baka-Updates, MangaDex, aniSearch, ANN, Fandom
- Preferences: ongoing, hideShelf, comment

### Established Modal Pattern
The codebase already has **Pattern 2 (NgbModal Direct)** extensively used in 7+ places:
- External service search modals (Trakt, Kitsu, Annict, ANN, LiveChart, Baka, aniSearch)
- Settings modal
- Details-in-modal view

**Pattern characteristics**:
- Data passed via `modal.componentInstance.propertyName = value`
- Component accepts inputs via `@Input()` decorators
- Results returned via `modal.close(value)` and captured with `modal.closed.subscribe()`
- Template structure: modal-header, modal-body, standard close button
- NgbActiveModal injected for internal control

## Desired End State

After implementation, the details components will:

1. **No longer have inline edit UI** - All `@if (edit)` conditionals removed from templates
2. **No layout shifts** - Poster and content layout remains consistent
3. **Edit in popup** - User clicks edit icon → modal opens with full form → saves and closes
4. **Same functionality** - All current form fields and validation preserved
5. **Cleaner codebase** - Separation of concerns between view and edit

### Verification
- Details view has no edit UI or conditionals
- Edit modal contains all form fields
- Modal opens on pencil click
- Data saves correctly to all external services
- Modal shows loading state during save
- Error handling works (user sees errors, can retry)
- No functionality loss

## What We're NOT Doing

- ❌ Changing the save logic or API calls (keep existing service methods)
- ❌ Modifying the external service synchronization (AnimeService.updateAnime, MangaService.updateManga)
- ❌ Adding new validation logic (use existing HTML5 validation)
- ❌ Creating a generic unified component (separate components for anime and manga)
- ❌ Changing the data model (MyAnimeUpdate, MyMangaUpdate, extensions)
- ❌ Modifying how extension data is encoded/decoded (keep Base64 JSON in comments)
- ❌ Simplifying the form (include all current fields from day one)

## Implementation Approach

Use the **NgbModal Direct pattern** (Pattern 2) already established in the codebase. Create two separate modal components (AnimeEditComponent, MangaEditComponent) that:

1. Accept the full anime/manga object via @Input
2. Initialize backup objects in ngOnInit (copied from startEdit method)
3. Render the complete edit form (extracted from details template)
4. Handle save internally (call service directly)
5. Show loading state and handle errors
6. Return success via modal.close() or cancel via modal.dismiss()

## Phase 1: Create Anime Edit Modal Component

### Overview
Create the AnimeEditComponent with full edit form extracted from the anime details template. This phase focuses on building the modal structure, copying the form fields, and wiring up the save logic.

### Changes Required

#### 1. Create Modal Component Files

**File**: `frontend/src/app/anime/details/edit/anime-edit.component.ts`

```typescript
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Anime, AnimeExtension, MyAnimeUpdate, MyAnimeUpdateExtended } from '@models/anime';
import { AnimeService } from '@services/anime/anime.service';
import { parseExtension } from '@models/anime';
import { Base64 } from 'js-base64';
import { DialogueService } from '@services/dialogue.service';

@Component({
  selector: 'myanili-anime-edit',
  templateUrl: './anime-edit.component.html',
  standalone: false,
})
export class AnimeEditComponent implements OnInit {
  @Input() anime?: Anime;
  @Input() traktUser?: string;
  @Input() annictUser?: string;

  editBackup?: Partial<MyAnimeUpdate>;
  editExtension?: { simulcast: {} } & AnimeExtension;
  busy = false;

  constructor(
    public modal: NgbActiveModal,
    private animeService: AnimeService,
    private dialogue: DialogueService,
  ) {}

  async ngOnInit() {
    if (!this.anime?.my_list_status) return;

    // Initialize backup objects (copied from details startEdit method)
    this.editBackup = {
      status: this.anime.my_list_status.status || 'plan_to_watch',
      is_rewatching: this.anime.my_list_status.is_rewatching,
      score: this.anime.my_list_status.score,
      num_watched_episodes: this.anime.my_list_status.num_episodes_watched,
      priority: this.anime.my_list_status.priority,
      rewatch_value: this.anime.my_list_status.rewatch_value,
      start_date: this.anime.my_list_status.start_date,
      finish_date: this.anime.my_list_status.finish_date,
      tags: this.anime.my_list_status.tags?.join(','),
    };

    try {
      const extension = parseExtension(this.anime.my_list_status.comments);
      this.editExtension = {
        series: '',
        seasonNumber: 1,
        episodeCorOffset: 0,
        ...this.anime.my_extension,
        ...extension,
      };
    } catch (e) {
      this.editExtension = {
        series: '',
        seasonNumber: 1,
        episodeCorOffset: 0,
        externalStreaming: '',
        externalStreamingId: '',
        simulcast: {},
        ...this.anime.my_extension,
      };
    }
  }

  async save() {
    if (!this.anime?.my_list_status) return;
    if (!this.editBackup) {
      this.modal.dismiss();
      return;
    }

    this.busy = true;

    try {
      const updateData = {
        comments: this.editExtension?.comment || '',
        extension: Base64.encode(JSON.stringify(this.editExtension)),
        status: this.editBackup?.status || this.anime.my_list_status.status,
        is_rewatching: this.editBackup?.is_rewatching || this.anime.my_list_status.is_rewatching,
      } as MyAnimeUpdateExtended;

      // Include only changed fields
      if (this.editBackup.status && this.editBackup.status !== this.anime.my_list_status.status) {
        updateData.status = this.editBackup.status;
      }
      if (this.editBackup.is_rewatching !== this.anime.my_list_status.is_rewatching) {
        updateData.is_rewatching = this.editBackup.is_rewatching;
      }
      if (this.editBackup.score !== this.anime.my_list_status.score) {
        updateData.score = this.editBackup?.score;
      }
      if (this.editBackup.num_watched_episodes !== this.anime.my_list_status.num_episodes_watched) {
        updateData.num_watched_episodes = this.editBackup?.num_watched_episodes;
      }
      if (this.editBackup.priority !== this.anime.my_list_status.priority) {
        updateData.priority = this.editBackup?.priority;
      }
      if (this.editBackup.rewatch_value !== this.anime.my_list_status.rewatch_value) {
        updateData.rewatch_value = this.editBackup?.rewatch_value;
      }
      if (this.editBackup.tags !== this.anime.my_list_status.tags) {
        updateData.tags = this.editBackup?.tags;
      }
      if (this.editBackup.start_date !== this.anime.my_list_status.start_date) {
        updateData.start_date = this.editBackup?.start_date;
      }
      if (this.editBackup.finish_date !== this.anime.my_list_status.finish_date) {
        updateData.finish_date = this.editBackup?.finish_date;
      }

      await this.animeService.updateAnime(
        {
          malId: this.anime.id,
          anilistId: this.anime.my_extension?.anilistId,
          kitsuId: this.anime.my_extension?.kitsuId,
          anisearchId: this.anime.my_extension?.anisearchId,
          simklId: this.anime.my_extension?.simklId,
          annictId: this.anime.my_extension?.annictId,
          trakt: {
            id: this.anime.my_extension?.trakt,
            season: this.anime.media_type === 'movie' ? -1 : this.anime.my_extension?.seasonNumber,
          },
          livechartId: this.anime.my_extension?.livechartId,
        },
        updateData,
      );

      this.busy = false;
      this.modal.close(true); // Signal success

    } catch (error) {
      this.busy = false;
      await this.dialogue.confirm(
        'Failed to save changes. Please try again.',
        'Error'
      );
    }
  }

  cancel() {
    this.modal.dismiss();
  }

  changeWatchlist() {
    const hideWatchlist = !this.editExtension?.hideWatchlist;
    if (!this.editExtension) this.editExtension = { hideWatchlist, simulcast: {} };
    this.editExtension.hideWatchlist = hideWatchlist;
  }

  // External ID search methods (copied from details component)
  async findTrakt() {
    // Will be copied from details component lines 709-717
  }

  async findKitsu() {
    // Will be copied from details component lines 719-726
  }

  async findAnnict() {
    // Will be copied from details component lines 739-746
  }

  async findLivechart() {
    // Will be copied from details component lines 748-755
  }

  async findANN() {
    // Will be copied from details component lines 757-766
  }
}
```

**File**: `frontend/src/app/anime/details/edit/anime-edit.component.html`

Template structure (full form fields to be extracted from details.component.html):

```html
<div class="modal-header">
  <h5 class="modal-title">Edit {{ anime?.title }}</h5>
  <button
    type="button"
    class="btn-close"
    aria-describedby="modal-title"
    (click)="cancel()"
  ></button>
</div>

<div class="modal-body">
  @if (anime && editBackup && editExtension) {
    <!-- Extract all edit form fields from details.component.html lines 65-992 -->
    <!-- My Score -->
    <div class="row mb-2">
      <div class="col-4 fw-bold text-end">My Score</div>
      <div class="col-8">
        <myanili-rating [(rating)]="editBackup.score" [size]="16"></myanili-rating>
      </div>
    </div>

    <!-- Display Name -->
    <div class="row mb-2">
      <div class="col-4 fw-bold text-end">Display</div>
      <div class="col-8">
        <input
          class="form-control form-control-sm"
          [(ngModel)]="editExtension!.displayName"
          [disabled]="busy"
          enterkeyhint="done"
        />
      </div>
    </div>

    <!-- Status -->
    <div class="row mb-2">
      <div class="col-4 fw-bold text-end">My Status</div>
      <div class="col-8">
        <select
          class="form-select form-select-sm"
          [(ngModel)]="editBackup!.status"
          [disabled]="busy"
        >
          @for (value of ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch']; track value) {
            <option [value]="value">{{ value | mal: 'mystatus' }}</option>
          }
        </select>
      </div>
    </div>

    <!-- ... Continue extracting all remaining fields ... -->
    <!-- Dates, Episode Rule, Simulcast, Streaming, External IDs, Progress, Comment, etc. -->

  }
</div>

<div class="modal-footer">
  <button type="button" class="btn btn-secondary" (click)="cancel()" [disabled]="busy">
    Cancel
  </button>
  <button type="button" class="btn btn-primary" (click)="save()" [disabled]="busy">
    @if (busy) {
      <myanili-icon name="loading" size="16"></myanili-icon>
      Saving...
    } @else {
      Save Changes
    }
  </button>
</div>
```

#### 2. Update Anime Module Declaration

**File**: `frontend/src/app/anime/anime.module.ts`

Add import (around line 14-30):
```typescript
import { AnimeEditComponent } from './details/edit/anime-edit.component';
```

Add to declarations array (around line 32-51):
```typescript
declarations: [
  AnimeCharactersComponent,
  AnimeDetailsComponent,
  AnimeEditComponent, // NEW
  AnimeListComponent,
  // ... rest of declarations
],
```

#### 3. Modify Anime Details Component

**File**: `frontend/src/app/anime/details/details.component.ts`

**Changes**:

1. **Add import** (around line 15):
```typescript
import { AnimeEditComponent } from './edit/anime-edit.component';
```

2. **Remove edit state properties** (lines 52-54):
```typescript
// DELETE these lines:
// edit = false;
// editBackup?: Partial<MyAnimeUpdate>;
// editExtension?: { simulcast: {} } & AnimeExtension;
```

3. **Replace editSave() method** (lines 312-320):
```typescript
async editSave() {
  if (this.busy) return;
  if (this.anime?.my_list_status) {
    this.openEditModal();
  } else {
    this.addAnime();
  }
}
```

4. **Add openEditModal() method** (new method):
```typescript
async openEditModal() {
  if (!this.anime) return;

  const modal = this.modalService.open(AnimeEditComponent, { size: 'xl' });
  modal.componentInstance.anime = this.anime;
  modal.componentInstance.traktUser = this.traktUser;
  modal.componentInstance.annictUser = this.annictUser;

  modal.closed.subscribe(async (success) => {
    if (success) {
      // Reload component data after successful save
      await this.ngOnInit();
    }
  });
}
```

5. **Remove startEdit() method** (lines 322-356) - DELETE entire method

6. **Remove save() method** (lines 358-420) - DELETE entire method

7. **Remove stopEdit() method** (lines 422-426) - DELETE entire method

8. **Remove changeWatchlist() method** (lines 703-707) - DELETE (moved to modal)

9. **Remove external ID search methods** (lines 709-766) - DELETE all findTrakt, findKitsu, findAnnict, findLivechart, findANN methods (moved to modal)

**File**: `frontend/src/app/anime/details/details.component.html`

**Changes**:

1. **Simplify edit button** (lines 12-17):
```html
<!-- BEFORE: -->
<myanili-icon
  [name]="busy ? 'loading' : edit ? 'check2' : 'pencil'"
  size="24"
  (click)="editSave()"
></myanili-icon>
@if (edit && !busy) {
  <myanili-icon name="x" size="24" class="ms-3" (click)="stopEdit()"></myanili-icon>
}

<!-- AFTER: -->
<myanili-icon
  [name]="busy ? 'loading' : 'pencil'"
  size="24"
  (click)="editSave()"
></myanili-icon>
```

2. **Remove all edit conditionals** - DELETE all `@if (edit)` blocks:
   - Lines 65-71: My Score input
   - Lines 79-91: Display name input
   - Lines 152-169: Status dropdown (edit mode)
   - Lines 207-219: Start date input
   - Lines 221-233: Finish date input
   - Lines 241-258: Episode rule input
   - Lines 293-312: Watch on (simulcast days)
   - Lines 314-341: Watch at (simulcast time/timezone)
   - Lines 366-391: Streaming provider/region
   - Lines 393-404: Stream ID
   - Lines 406-553: All external ID inputs and search buttons
   - Lines 614-631: Progress (episodes watched)
   - Lines 633-655: Season number and episode offset
   - Lines 657-672: Hide on watchlist checkbox
   - Lines 983-992: Comment textarea

3. **Remove layout shifts** (lines 10-11):
```html
<!-- BEFORE: -->
<div class="col-sm-5 col-md-4 mb-3" [class]="{ 'd-none': edit, 'd-sm-block': edit }">

<!-- AFTER: -->
<div class="col-sm-5 col-md-4 mb-3">
```

```html
<!-- BEFORE: -->
<div class="col-sm-7 col-md-8 mb-3" [class]="{ 'col-12': edit }">

<!-- AFTER: -->
<div class="col-sm-7 col-md-8 mb-3">
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] No linting errors: `npm run lint`
- [ ] All imports resolve correctly
- [ ] Component is declared in AnimeModule

#### Manual Verification:
- [ ] Anime details view displays correctly (no edit UI visible)
- [ ] Clicking pencil icon opens the edit modal
- [ ] Modal displays with "xl" size
- [ ] All form fields present and populated with current values
- [ ] Form fields are editable and two-way binding works
- [ ] Clicking "Cancel" closes modal without saving
- [ ] Clicking "Save Changes" shows loading indicator
- [ ] Successful save closes modal and refreshes details view
- [ ] Failed save shows error dialog and keeps modal open for retry
- [ ] External ID search buttons open search modals correctly
- [ ] All external service IDs save correctly
- [ ] No layout shifts or visual regressions in details view

---

## Phase 2: Create Manga Edit Modal Component

### Overview
Create the MangaEditComponent following the same pattern as AnimeEditComponent. This phase mirrors Phase 1 but for manga-specific fields and services.

### Changes Required

#### 1. Create Modal Component Files

**File**: `frontend/src/app/manga/details/edit/manga-edit.component.ts`

```typescript
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Manga, MangaExtension, MyMangaUpdate, MyMangaUpdateExtended } from '@models/manga';
import { MangaService } from '@services/manga/manga.service';
import { Base64 } from 'js-base64';
import { DialogueService } from '@services/dialogue.service';

@Component({
  selector: 'myanili-manga-edit',
  templateUrl: './manga-edit.component.html',
  standalone: false,
})
export class MangaEditComponent implements OnInit {
  @Input() manga?: Manga;

  editBackup?: Partial<MyMangaUpdate>;
  editExtension?: MangaExtension;
  busy = false;

  constructor(
    public modal: NgbActiveModal,
    private mangaService: MangaService,
    private dialogue: DialogueService,
  ) {}

  async ngOnInit() {
    if (!this.manga?.my_list_status) return;

    // Initialize backup objects (copied from manga details startEdit method)
    this.editBackup = {
      status: this.manga.my_list_status.status || 'plan_to_read',
      is_rereading: this.manga.my_list_status.is_rereading,
      score: this.manga.my_list_status.score,
      num_chapters_read: this.manga.my_list_status.num_chapters_read,
      num_volumes_read: this.manga.my_list_status.num_volumes_read,
      priority: this.manga.my_list_status.priority,
      reread_value: this.manga.my_list_status.reread_value,
      start_date: this.manga.my_list_status.start_date,
      finish_date: this.manga.my_list_status.finish_date,
      tags: this.manga.my_list_status.tags,
    };

    try {
      const extension = JSON.parse(Base64.decode(this.manga.my_list_status.comments))
        as unknown as Partial<MangaExtension>;
      this.editExtension = {
        ...this.manga.my_extension,
        ...extension,
      };
    } catch (e) {
      this.editExtension = { ...this.manga.my_extension };
    }
  }

  async save() {
    if (!this.manga?.my_list_status) return;
    if (!this.editBackup) {
      this.modal.dismiss();
      return;
    }

    this.busy = true;

    try {
      const updateData = {
        comments: this.editExtension?.comment || '',
        extension: Base64.encode(JSON.stringify(this.editExtension)),
        status: this.editBackup?.status || this.manga.my_list_status.status,
        is_rereading: this.editBackup?.is_rereading || this.manga.my_list_status.is_rereading,
      } as MyMangaUpdateExtended;

      // Include only changed fields (differential update logic)
      if (this.editBackup.score !== this.manga.my_list_status.score) {
        updateData.score = this.editBackup?.score;
      }
      if (this.editBackup.num_chapters_read !== this.manga.my_list_status.num_chapters_read) {
        updateData.num_chapters_read = this.editBackup?.num_chapters_read;
      }
      if (this.editBackup.num_volumes_read !== this.manga.my_list_status.num_volumes_read) {
        updateData.num_volumes_read = this.editBackup?.num_volumes_read;
      }
      if (this.editBackup.priority !== this.manga.my_list_status.priority) {
        updateData.priority = this.editBackup?.priority;
      }
      if (this.editBackup.reread_value !== this.manga.my_list_status.reread_value) {
        updateData.reread_value = this.editBackup?.reread_value;
      }
      if (this.editBackup.tags !== this.manga.my_list_status.tags) {
        updateData.tags = this.editBackup?.tags;
      }
      if (this.editBackup.start_date !== this.manga.my_list_status.start_date) {
        updateData.start_date = this.editBackup?.start_date;
      }
      if (this.editBackup.finish_date !== this.manga.my_list_status.finish_date) {
        updateData.finish_date = this.editBackup?.finish_date;
      }

      await this.mangaService.updateManga(
        {
          malId: this.manga.id,
          anilistId: this.manga.my_extension?.anilistId,
          kitsuId: this.manga.my_extension?.kitsuId,
          anisearchId: this.manga.my_extension?.anisearchId,
          bakaId: this.manga.my_extension?.bakaId,
        },
        updateData,
      );

      this.busy = false;
      this.modal.close(true); // Signal success

    } catch (error) {
      this.busy = false;
      await this.dialogue.confirm(
        'Failed to save changes. Please try again.',
        'Error'
      );
    }
  }

  cancel() {
    this.modal.dismiss();
  }

  enableKitsu() {
    // Copied from details component lines 296-302
    if (!this.editExtension) {
      this.editExtension = {};
    }
    if (!this.editExtension.kitsuId) {
      this.editExtension.kitsuId = { kitsuId: 0 };
    }
    return !!this.editExtension.kitsuId;
  }

  changeOngoing() {
    const ongoing = !this.editExtension?.ongoing;
    if (!this.editExtension) this.editExtension = { ongoing };
    this.editExtension.ongoing = ongoing;
  }

  changeShelf() {
    const hideShelf = !this.editExtension?.hideShelf;
    if (!this.editExtension) this.editExtension = { hideShelf };
    this.editExtension.hideShelf = hideShelf;
  }

  // External ID search methods (copied from manga details component)
  async findKitsu() {
    // Copied from lines 690-698
  }

  async findBaka() {
    // Copied from lines 712-719
  }

  async findANN() {
    // Copied from lines 721-731
  }
}
```

**File**: `frontend/src/app/manga/details/edit/manga-edit.component.html`

Template structure (extract from manga details.component.html):

```html
<div class="modal-header">
  <h5 class="modal-title">Edit {{ manga?.title }}</h5>
  <button
    type="button"
    class="btn-close"
    aria-describedby="modal-title"
    (click)="cancel()"
  ></button>
</div>

<div class="modal-body">
  @if (manga && editBackup && editExtension) {
    <!-- Extract all edit form fields from manga details.component.html -->
    <!-- My Score -->
    <div class="row mb-2">
      <div class="col-4 fw-bold text-end">My Score</div>
      <div class="col-8">
        <myanili-rating [(rating)]="editBackup.score" [size]="16"></myanili-rating>
      </div>
    </div>

    <!-- Display Name -->
    <div class="row mb-2">
      <div class="col-4 fw-bold text-end">Display</div>
      <div class="col-8">
        <input
          class="form-control form-control-sm"
          [(ngModel)]="editExtension!.displayName"
          [disabled]="busy"
          enterkeyhint="done"
        />
      </div>
    </div>

    <!-- Status -->
    <div class="row mb-2">
      <div class="col-4 fw-bold text-end">My Status</div>
      <div class="col-8">
        <select
          class="form-select form-select-sm"
          [(ngModel)]="editBackup!.status"
          [disabled]="busy"
        >
          @for (value of ['reading', 'completed', 'on_hold', 'dropped', 'plan_to_read']; track value) {
            <option [value]="value">{{ value | mal: 'mystatus' }}</option>
          }
        </select>
      </div>
    </div>

    <!-- ... Continue extracting all remaining manga-specific fields ... -->
    <!-- Dates, Simulpub, Platform, Publisher, External IDs, Progress (chapters/volumes), Preferences, Comment, etc. -->

  }
</div>

<div class="modal-footer">
  <button type="button" class="btn btn-secondary" (click)="cancel()" [disabled]="busy">
    Cancel
  </button>
  <button type="button" class="btn btn-primary" (click)="save()" [disabled]="busy">
    @if (busy) {
      <myanili-icon name="loading" size="16"></myanili-icon>
      Saving...
    } @else {
      Save Changes
    }
  </button>
</div>
```

#### 2. Update Manga Module Declaration

**File**: `frontend/src/app/manga/manga.module.ts`

Add import (around line 13-22):
```typescript
import { MangaEditComponent } from './details/edit/manga-edit.component';
```

Add to declarations array (around line 24-35):
```typescript
declarations: [
  BookshelfComponent,
  BookshelfWrapperComponent,
  MagazineComponent,
  MangaCharactersComponent,
  MangaDetailsComponent,
  MangaEditComponent, // NEW
  MangaListComponent,
  // ... rest of declarations
],
```

#### 3. Modify Manga Details Component

**File**: `frontend/src/app/manga/details/details.component.ts`

**Changes**:

1. **Add import** (around line 15):
```typescript
import { MangaEditComponent } from './edit/manga-edit.component';
```

2. **Remove edit state properties** (lines 43-45):
```typescript
// DELETE these lines:
// edit = false;
// editBackup?: Partial<MyMangaUpdate>;
// editExtension?: MangaExtension;
```

3. **Replace editSave() method** (lines 258-266):
```typescript
async editSave() {
  if (this.busy) return;
  if (this.manga?.my_list_status) {
    this.openEditModal();
  } else {
    this.setStatus('plan_to_read');
  }
}
```

4. **Add openEditModal() method** (new method):
```typescript
async openEditModal() {
  if (!this.manga) return;

  const modal = this.modalService.open(MangaEditComponent, { size: 'xl' });
  modal.componentInstance.manga = this.manga;

  modal.closed.subscribe(async (success) => {
    if (success) {
      // Reload component data after successful save
      await this.ngOnInit();
    }
  });
}
```

5. **Remove startEdit() method** (lines 268-294) - DELETE entire method

6. **Remove enableKitsu() method** (lines 296-302) - DELETE (moved to modal)

7. **Remove save() method** (lines 304-363) - DELETE entire method

8. **Remove stopEdit() method** (lines 365-369) - DELETE entire method

9. **Remove changeOngoing() method** (lines 678-682) - DELETE (moved to modal)

10. **Remove changeShelf() method** (lines 684-688) - DELETE (moved to modal)

11. **Remove external ID search methods** (lines 690-731) - DELETE all findKitsu, findBaka, findANN methods (moved to modal)

**File**: `frontend/src/app/manga/details/details.component.html`

**Changes**:

1. **Simplify edit button** (lines 12-17):
```html
<!-- BEFORE: -->
<myanili-icon
  [name]="busy ? 'loading' : edit ? 'check2' : 'pencil'"
  size="24"
  (click)="editSave()"
></myanili-icon>
@if (edit && !busy) {
  <myanili-icon name="x" size="24" class="ms-3" (click)="stopEdit()"></myanili-icon>
}

<!-- AFTER: -->
<myanili-icon
  [name]="busy ? 'loading' : 'pencil'"
  size="24"
  (click)="editSave()"
></myanili-icon>
```

2. **Remove all edit conditionals** - DELETE all `@if (edit)` blocks containing:
   - My Score input (lines ~65-71)
   - Display name input (lines ~83-88)
   - Status dropdown (edit mode) (lines ~172-185)
   - Dates (start/finish) (lines ~234-255)
   - Simulpub days (lines ~265-279)
   - Platform and Platform ID (lines ~313-337)
   - Publisher fields (lines ~366-385)
   - External ID inputs and search buttons (lines ~730-847)
   - Progress (chapters/volumes) (lines ~457-487)
   - Preferences (ongoing, hideShelf) (lines ~496-520)
   - Comment textarea (lines ~866-871)

3. **Remove layout shifts** (lines ~10-11):
```html
<!-- BEFORE: -->
<div class="col-sm-5 col-md-4 mb-3" [class]="{ 'd-none': edit, 'd-sm-block': edit }">

<!-- AFTER: -->
<div class="col-sm-5 col-md-4 mb-3">
```

```html
<!-- BEFORE: -->
<div class="col-sm-7 col-md-8 mb-3" [class]="{ 'col-12': edit }">

<!-- AFTER: -->
<div class="col-sm-7 col-md-8 mb-3">
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] No linting errors: `npm run lint`
- [ ] All imports resolve correctly
- [ ] Component is declared in MangaModule

#### Manual Verification:
- [ ] Manga details view displays correctly (no edit UI visible)
- [ ] Clicking pencil icon opens the edit modal
- [ ] Modal displays with "xl" size
- [ ] All form fields present and populated with current values
- [ ] Chapters and volumes inputs work correctly
- [ ] Form fields are editable and two-way binding works
- [ ] Clicking "Cancel" closes modal without saving
- [ ] Clicking "Save Changes" shows loading indicator
- [ ] Successful save closes modal and refreshes details view
- [ ] Failed save shows error dialog and keeps modal open for retry
- [ ] External ID search buttons open search modals correctly
- [ ] Kitsu ID object structure preserved (complex object with nested properties)
- [ ] All external service IDs save correctly
- [ ] No layout shifts or visual regressions in details view

---

## Phase 3: Refinement and Testing

### Overview
This phase focuses on polish, edge case handling, and comprehensive testing of both modal implementations.

### Changes Required

#### 1. Add Loading States and Error Handling

**Both Modal Components** (`anime-edit.component.ts` and `manga-edit.component.ts`):

Enhance error handling to provide more specific feedback:

```typescript
async save() {
  // ... existing validation ...

  this.busy = true;

  try {
    // ... existing save logic ...

    this.busy = false;
    this.modal.close(true);

  } catch (error: any) {
    this.busy = false;

    // Provide more specific error messages
    let errorMessage = 'Failed to save changes. ';

    if (error.status === 0) {
      errorMessage += 'Network error. Please check your connection and try again.';
    } else if (error.status === 401) {
      errorMessage += 'Authentication failed. Please log in again.';
    } else if (error.status === 403) {
      errorMessage += 'You do not have permission to modify this entry.';
    } else if (error.status >= 500) {
      errorMessage += 'Server error. Please try again later.';
    } else {
      errorMessage += error.message || 'Please try again.';
    }

    const retry = await this.dialogue.confirm(errorMessage, 'Error');
    if (retry) {
      // User wants to retry
      return this.save();
    }
  }
}
```

#### 2. Improve User Experience

**Both Modal Templates** (`anime-edit.component.html` and `manga-edit.component.html`):

1. **Add keyboard shortcuts**:
```html
<!-- Add to modal-body wrapper: -->
<div class="modal-body" (keydown.control.enter)="save()" (keydown.escape)="cancel()">
```

2. **Add unsaved changes warning**:

In component TS:
```typescript
hasUnsavedChanges(): boolean {
  if (!this.editBackup || !this.anime?.my_list_status) return false;

  // Check if any field has changed
  return this.editBackup.score !== this.anime.my_list_status.score ||
         this.editBackup.status !== this.anime.my_list_status.status ||
         // ... check all fields ...
         JSON.stringify(this.editExtension) !== JSON.stringify(this.anime.my_extension);
}

async cancel() {
  if (this.hasUnsavedChanges()) {
    const confirm = await this.dialogue.confirm(
      'You have unsaved changes. Are you sure you want to close?',
      'Unsaved Changes'
    );
    if (!confirm) return;
  }
  this.modal.dismiss();
}
```

3. **Add visual feedback for required fields**:
```html
<!-- Example for status field: -->
<select
  class="form-select form-select-sm"
  [(ngModel)]="editBackup!.status"
  [disabled]="busy"
  required
  [class.is-invalid]="!editBackup!.status"
>
```

#### 3. Add Accessibility Improvements

**Both Modal Templates**:

1. **Add ARIA labels**:
```html
<div class="modal-header">
  <h5 class="modal-title" id="editModalTitle">Edit {{ anime?.title }}</h5>
  <button
    type="button"
    class="btn-close"
    aria-label="Close edit dialog"
    aria-describedby="editModalTitle"
    (click)="cancel()"
  ></button>
</div>
```

2. **Add field labels for screen readers**:
```html
<div class="row mb-2">
  <label for="displayName" class="col-4 fw-bold text-end">Display</label>
  <div class="col-8">
    <input
      id="displayName"
      class="form-control form-control-sm"
      [(ngModel)]="editExtension!.displayName"
      [disabled]="busy"
      enterkeyhint="done"
      aria-label="Custom display name"
    />
  </div>
</div>
```

3. **Manage focus**:

In component TS:
```typescript
import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';

export class AnimeEditComponent implements OnInit, AfterViewInit {
  @ViewChild('firstInput') firstInput?: ElementRef;

  ngAfterViewInit() {
    // Focus first input when modal opens
    setTimeout(() => this.firstInput?.nativeElement.focus(), 100);
  }
}
```

In template:
```html
<input
  #firstInput
  class="form-control form-control-sm"
  [(ngModel)]="editExtension!.displayName"
  ...
/>
```

#### 4. Add Comprehensive Testing

**Manual Test Scenarios**:

1. **Basic Functionality**:
   - [ ] Open modal → verify all fields populated
   - [ ] Edit each field → verify two-way binding
   - [ ] Save with changes → verify success
   - [ ] Cancel without changes → verify closes immediately
   - [ ] Cancel with changes → verify warning dialog

2. **Error Scenarios**:
   - [ ] Network offline → verify network error message
   - [ ] Server error → verify retry option
   - [ ] API timeout → verify appropriate error handling
   - [ ] Invalid data → verify validation feedback

3. **Edge Cases**:
   - [ ] No extension data → verify defaults applied
   - [ ] Missing external IDs → verify graceful handling
   - [ ] Malformed Base64 comments → verify fallback
   - [ ] Rapid clicks on Save → verify debouncing (busy flag)
   - [ ] Modal open while details refreshing → verify no conflicts

4. **External ID Searches**:
   - [ ] Trakt search → verify movie/show distinction
   - [ ] Kitsu search → verify complex object structure saved
   - [ ] Annict search → verify user check
   - [ ] All searches → verify modal stacking works

5. **Keyboard Navigation**:
   - [ ] Tab through all fields → verify logical order
   - [ ] Ctrl+Enter to save → verify shortcut works
   - [ ] Escape to cancel → verify shortcut works
   - [ ] Focus management → verify first field focused on open

6. **Accessibility**:
   - [ ] Screen reader testing → verify all labels read correctly
   - [ ] High contrast mode → verify visibility
   - [ ] Keyboard-only navigation → verify full functionality

7. **Cross-Browser**:
   - [ ] Chrome → verify all features
   - [ ] Firefox → verify all features
   - [ ] Safari → verify all features
   - [ ] Edge → verify all features

8. **Mobile/Responsive**:
   - [ ] Mobile viewport → verify modal fits, scrolls correctly
   - [ ] Tablet viewport → verify layout adapts
   - [ ] Touch interactions → verify all controls accessible

#### 5. Performance Optimization

**Both Modal Components**:

1. **Lazy load modal components**:

In details component:
```typescript
async openEditModal() {
  if (!this.anime) return;

  // Dynamic import for code splitting
  const { AnimeEditComponent } = await import('./edit/anime-edit.component');

  const modal = this.modalService.open(AnimeEditComponent, { size: 'xl' });
  modal.componentInstance.anime = this.anime;
  modal.componentInstance.traktUser = this.traktUser;
  modal.componentInstance.annictUser = this.annictUser;

  modal.closed.subscribe(async (success) => {
    if (success) {
      await this.ngOnInit();
    }
  });
}
```

2. **Optimize change detection**:

In modal component:
```typescript
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'myanili-anime-edit',
  templateUrl: './anime-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // Add this
  standalone: false,
})
```

### Success Criteria

#### Automated Verification:
- [ ] All TypeScript compiles without errors: `npm run build`
- [ ] No linting errors: `npm run lint`
- [ ] Bundle size has not increased significantly (check build output)

#### Manual Verification:
- [ ] All manual test scenarios pass (see test checklist above)
- [ ] No console errors during any operations
- [ ] No memory leaks (modal properly disposed after close)
- [ ] Performance is acceptable (modal opens < 200ms)
- [ ] Accessibility audit passes (Lighthouse or axe DevTools)
- [ ] All keyboard shortcuts work as expected
- [ ] Unsaved changes warning functions correctly
- [ ] Error messages are clear and actionable
- [ ] All external service updates work correctly
- [ ] Focus management is intuitive
- [ ] Mobile experience is smooth

---

## Testing Strategy

### Unit Tests

**Not included in this plan** - The current codebase does not have extensive unit test coverage for components. Adding tests would require:
- Setting up TestBed configurations
- Mocking NgbModal, services, and dialogs
- Testing component initialization, form binding, and save logic

**If tests are desired**, create:
- `anime-edit.component.spec.ts` - Test initialization, save logic, error handling
- `manga-edit.component.spec.ts` - Same as anime

### Integration Tests

**Not included in this plan** - Integration tests would require:
- End-to-end testing framework (Cypress, Playwright)
- Test user account with known data
- External service mocks or test environments

### Manual Testing Steps

**Phase 1 Verification (Anime)**:
1. Navigate to any anime details page
2. Click the pencil icon → verify modal opens
3. Verify all current values are populated in the form
4. Edit the "My Score" field → verify rating component updates
5. Edit the "Display Name" field → verify input updates
6. Click "Cancel" → verify modal closes without changes
7. Re-open modal, make changes, click "Save Changes"
8. Verify loading indicator appears
9. Verify modal closes on success
10. Verify details page refreshes with new data
11. Check external services (AniList, Kitsu, etc.) to confirm updates synced

**Phase 2 Verification (Manga)**:
1. Navigate to any manga details page
2. Repeat steps 2-11 from Phase 1
3. Additionally test chapters/volumes inputs (manga-specific)
4. Test "Ongoing" and "Hide from Shelf" checkboxes

**Phase 3 Verification**:
1. Test error scenarios (disconnect network, test server errors)
2. Test keyboard shortcuts (Ctrl+Enter, Escape)
3. Test unsaved changes warning
4. Test accessibility with keyboard-only navigation
5. Test on mobile device or responsive viewport
6. Run Lighthouse accessibility audit

## Performance Considerations

- **Modal size**: Using `size: 'xl'` provides ample space for the extensive form without overwhelming the viewport
- **Code splitting**: Modal components can be lazy-loaded if bundle size becomes a concern
- **Change detection**: OnPush strategy can be applied if performance issues arise
- **API calls**: Existing parallel update strategy maintained (no additional overhead)
- **Memory**: Modal components properly destroyed after close (NgbModal handles cleanup)

## Migration Notes

**No data migration needed** - This is a purely architectural refactoring:
- Data models remain unchanged
- Service methods remain unchanged
- API contracts remain unchanged
- Extension encoding/decoding remains unchanged

**Backward compatibility**: None required - this is not a breaking change

**Rollback strategy**:
- If issues arise, can revert commits by phase
- Phase 1 and Phase 2 are independent (anime and manga)
- Each phase can be rolled back without affecting the other

## References

- Original research: `thoughts/shared/research/2025-12-09-details-component-view-edit-states.md`
- Anime details component: `frontend/src/app/anime/details/details.component.ts`
- Manga details component: `frontend/src/app/manga/details/details.component.ts`
- Modal pattern examples: `frontend/src/app/external/trakt/trakt.component.ts:8-60`
- Dialog service: `frontend/src/app/services/dialogue.service.ts:17-53`
- Shared components: `frontend/src/app/components/components.module.ts`
