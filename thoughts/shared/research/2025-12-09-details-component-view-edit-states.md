---
date: 2025-12-09T15:56:57+01:00
researcher: Claude Code
git_commit: fa5e06e7ccce30cfed35a83bb7edfe3b5b5a04ad
branch: beta
repository: beta
topic: "Details Components View/Edit State Implementation"
tags: [research, codebase, details-component, view-edit-state, angular, modal, popup]
status: complete
last_updated: 2025-12-09
last_updated_by: Claude Code
---

# Research: Details Components View/Edit State Implementation

**Date**: 2025-12-09T15:56:57+01:00
**Researcher**: Claude Code
**Git Commit**: fa5e06e7ccce30cfed35a83bb7edfe3b5b5a04ad
**Branch**: beta
**Repository**: beta

## Research Question

For the details components there are a view state and an edit state. Currently those two are in one file. I want to have a separate component for editing. Could be a popup.

## Summary

The codebase has two main details components (Anime and Manga) that implement view and edit states within a single component file. Both use an `edit` boolean flag pattern with backup data objects to toggle between viewing and editing modes. The edit UI is conditionally rendered in the same template, with layout adjustments to hide the poster and expand the content area when editing.

For separating the edit functionality into a popup component, the codebase already has three established modal patterns using `NgbModal` from ng-bootstrap:
1. **DialogueService** - Service-based dialogs for simple interactions (used in 17+ places)
2. **NgbModal Direct** - Component-based modals for complex custom UI (used in 7+ places)
3. **Display-only modals** - Information-only modals (used in 1+ places)

The **NgbModal Direct** pattern (Pattern 2) would be most suitable for an edit popup, as it's already used for similar data-heavy components like external service searches that accept multiple inputs and return complex data.

## Detailed Findings

### Current Implementation: Anime Details Component

**Location**: `frontend/src/app/anime/details/details.component.ts`

**State Management Properties** (lines 52-54):
```typescript
edit = false;
editBackup?: Partial<MyAnimeUpdate>;
editExtension?: { simulcast: {} } & AnimeExtension;
```

**Key Methods**:

**`editSave()` method** (lines 380-387):
```typescript
async editSave() {
  if (this.busy) return;
  if (this.anime?.my_list_status) {
    if (this.edit) return this.save();
    this.startEdit();
  } else {
    this.addAnime();
  }
}
```

**`startEdit()` method** (lines 389-413):
```typescript
async startEdit() {
  if (!this.anime?.my_list_status) return;
  this.edit = true;
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
  // Copy extension data for editing
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
      ...this.anime.my_extension,
    };
  }
}
```

**`stopEdit()` method** (lines 475-479):
```typescript
stopEdit() {
  this.edit = false;
  delete this.editBackup;
  delete this.editExtension;
}
```

**Template Structure**: `frontend/src/app/anime/details/details.component.html`

Header with edit controls:
```html
<header class="d-flex pt-2 mb-3 border-bottom sticky-header bg-white">
  <h2>{{ anime?.title || title || 'Loading…' }}</h2>
  @if (anime?.title && !fromCache) {
    <div class="ms-auto ps-3 cursor-pointer" style="white-space: nowrap">
      @if (anime?.my_list_status) {
        <myanili-icon
          [name]="busy ? 'loading' : edit ? 'check2' : 'pencil'"
          size="24"
          (click)="editSave()"
        ></myanili-icon>
        @if (edit && !busy) {
          <myanili-icon name="x" size="24" class="ms-3" (click)="stopEdit()"></myanili-icon>
        }
      }
    </div>
  }
</header>
```

Conditional layout adjustments:
```html
<!-- View mode: display poster, hide on edit -->
<div class="col-sm-5 col-md-4 mb-3" [class]="{ 'd-none': edit, 'd-sm-block': edit }">
  <myanili-poster-rating
    [poster]="anime?.main_picture?.large || anime?.main_picture?.medium"
    [meanRating]="meanRating"
    [rating]="anime?.my_list_status?.score"
  ></myanili-poster-rating>
</div>

<!-- Main content with conditional rendering for edit mode -->
<div class="col-sm-7 col-md-8 mb-3" [class]="{ 'col-12': edit }">
  <!-- Edit mode: score input -->
  @if (edit && editBackup) {
    <div class="row">
      <div class="col-4 fw-bold text-end">My&nbsp;Score</div>
      <div class="col-8">
        <myanili-rating [(rating)]="editBackup.score" [size]="16"></myanili-rating>
      </div>
    </div>
  }

  <!-- View mode: display name -->
  @if (anime?.my_extension?.displayName) {
    <div class="row">
      <div class="col-4 fw-bold text-end">Display</div>
      <div class="col-8">{{ anime?.my_extension?.displayName }}</div>
    </div>
  }

  <!-- Edit mode: name input -->
  @if (edit && anime && editExtension) {
    <div class="row my-2">
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
  }
</div>
```

### Current Implementation: Manga Details Component

**Location**: `frontend/src/app/manga/details/details.component.ts`

**State Management** (lines 43-45):
```typescript
edit = false;
editBackup?: Partial<MyMangaUpdate>;
editExtension?: MangaExtension;
```

The manga details component follows an identical pattern to the anime details component, with the same method names (`editSave()`, `startEdit()`, `stopEdit()`) and similar template structure. The only differences are the entity-specific fields (e.g., `num_chapters_read` vs `num_episodes_watched`).

### Sub-Components Structure

**Anime Details Sub-Components**:
- `frontend/src/app/anime/details/characters/` - Character listing
- `frontend/src/app/anime/details/staff/` - Staff listing
- `frontend/src/app/anime/details/recommendations/` - Recommendations
- `frontend/src/app/anime/details/songs/` - Opening/ending songs
- `frontend/src/app/anime/details/videos/` - Video links
- `frontend/src/app/anime/details/streams/` - Streaming services

**Manga Details Sub-Components**:
- `frontend/src/app/manga/details/characters/` - Character listing
- `frontend/src/app/manga/details/recommendations/` - Recommendations

These sub-components are display-only and do not contain edit functionality.

## Existing Modal/Popup Patterns

### Pattern 1: DialogueService - Service-Based Dialogs

**Location**: `frontend/src/app/services/dialogue.service.ts`

**Usage**: 17+ places across the codebase

**Implementation**:
```typescript
@Injectable({
  providedIn: 'root',
})
export class DialogueService {
  constructor(private modalService: NgbModal) {}

  async confirm(message: string, title?: string): Promise<boolean> {
    const modal = this.modalService.open(DialogueComponent);
    modal.componentInstance.title = title;
    modal.componentInstance.message = message;
    return modal.result.then(() => true).catch(() => false);
  }

  async prompt(
    message: string,
    title?: string,
    value?: string,
    type: InputType = 'text',
    placeholder?: string,
  ): Promise<string> {
    const modal = this.modalService.open(DialogueComponent);
    modal.componentInstance.title = title;
    modal.componentInstance.message = message;
    modal.componentInstance.prompt = { placeholder, type, value };
    return modal.result.catch(() => value);
  }
}
```

**Usage Example** (`frontend/src/app/anime/details/details.component.ts:516`):
```typescript
const reallySkip = await this.dialogue.confirm(
  `Skip ${this.anime.title} this week?`,
  'Skip'
);
```

**Best For**: Simple confirmations, alerts, text prompts, and single-choice interactions.

### Pattern 2: NgbModal Direct - Component-Based Modals

**Location**: Multiple locations (7+ places)

**Example**: External Service Search Modals (`frontend/src/app/anime/details/details.component.ts:711`)

```typescript
openTrakt() {
  const modal = this.modalService.open(TraktComponent);
  modal.componentInstance.title = this.anime.title;
  modal.componentInstance.isMovie = this.anime.media_type === 'movie';
  modal.result.then(id => {
    // Process selected result
  });
}
```

**Modal Component Base** (`frontend/src/app/external/external.component.ts`):
```typescript
@Component({
  selector: 'myanili-external',
  templateUrl: './external.component.html',
  standalone: false,
})
export class ExternalComponent implements OnInit {
  @Input() title?: string;
  nodes: Node[] = [];
  searching = false;

  constructor(public modal: NgbActiveModal) {}

  async ngOnInit() {}
}
```

**Template Structure** (`frontend/src/app/external/external.component.html`):
```html
<div class="modal-header">
  <div class="input-group">
    <input class="form-control" [(ngModel)]="title" type="search" />
    <button class="btn btn-primary" (click)="ngOnInit()">
      <myanili-icon name="search"></myanili-icon>
    </button>
  </div>
  <button
    type="button"
    class="btn-close"
    aria-describedby="modal-title"
    (click)="modal.dismiss()"
  ></button>
</div>
<div class="table-responsive">
  <table class="table table-striped table-hover" darkTable>
    <tbody>
      @for (node of nodes; track node) {
        <tr>
          <td>
            <b>{{ node.title }}</b>
            <!-- ... more content ... -->
          </td>
          <td>
            <myanili-icon
              class="cursor-pointer"
              size="20"
              name="link"
              (click)="modal.close(node.id)"
            ></myanili-icon>
          </td>
        </tr>
      }
    </tbody>
  </table>
</div>
```

**Other Examples**:
- Settings modal: `frontend/src/app/navbar/top/top.component.ts:42`
- Details in modal: `frontend/src/app/search/search.component.ts:167-172`

**Best For**: Complex custom components, data-rich displays, interactive searches, forms with multiple inputs.

### Pattern 3: Display-Only Modals

**Location**: `frontend/src/app/settings/new-version/new-version.component.ts`

**Usage**: 1 place (update changelog display)

**Implementation**:
```typescript
@Component({
  selector: 'myanili-new-version',
  templateUrl: './new-version.component.html',
  standalone: false,
})
export class NewVersionComponent {
  version = '';
  changelog!: Changelog;

  constructor(public modal: NgbActiveModal) {}
}
```

**Best For**: Information-only modals, read-only content display.

## Code References

### Main Components
- `frontend/src/app/anime/details/details.component.ts:52-54` - Edit state properties
- `frontend/src/app/anime/details/details.component.ts:380-413` - Edit initialization
- `frontend/src/app/anime/details/details.component.ts:475-479` - Edit cancellation
- `frontend/src/app/manga/details/details.component.ts:43-45` - Edit state properties (manga)

### Modal Patterns
- `frontend/src/app/services/dialogue.service.ts:1-60` - DialogueService implementation
- `frontend/src/app/components/dialogue/dialogue.component.ts:1-68` - DialogueComponent
- `frontend/src/app/external/external.component.ts:1-30` - Base external modal component
- `frontend/src/app/external/trakt/trakt.component.ts:1-60` - Trakt search modal (extends external)

### Modal Usage Examples
- `frontend/src/app/anime/details/details.component.ts:516` - Confirmation dialog usage
- `frontend/src/app/anime/details/details.component.ts:711` - Direct modal usage (Trakt)
- `frontend/src/app/search/search.component.ts:167-172` - Opening details in modal

## Architecture Documentation

### Current View/Edit State Pattern

**Characteristics**:
- Single component contains both view and edit logic
- Boolean `edit` flag controls UI rendering via `@if` directives
- Backup objects (`editBackup`, `editExtension`) preserve original data during editing
- `busy` flag prevents concurrent modifications during save
- Icon feedback: pencil (view) → check (edit) → loading (saving)
- Layout shifts: poster hidden and content expands to full width in edit mode
- Field-by-field change detection before API update
- Cancel button visible only during edit state
- Data cleanup with `delete` keyword on cancel

**Data Flow**:
1. User clicks pencil icon → `startEdit()` called
2. `edit = true`, create shallow copies in `editBackup`/`editExtension`
3. Template re-renders with input fields via `@if (edit)` conditionals
4. User modifies form fields bound with `[(ngModel)]`
5. User clicks check icon → `save()` called
6. Compare each field to detect changes
7. Send only changed fields to API
8. Reset state: `edit = false`, delete backup objects
9. Refresh data with `ngOnInit()`

### Modal Infrastructure

**Technical Foundation**:
- All patterns use `NgbModal` from `@ng-bootstrap/ng-bootstrap`
- Modal components receive `NgbActiveModal` for internal control (`close()`, `dismiss()`)
- Templates follow Bootstrap structure: `modal-header`, `modal-body`, `modal-footer`
- Standard close button: `<button class="btn-close" (click)="modal.dismiss()"></button>`
- Promise-based result handling: `modal.result.then().catch()`

**NgbModal API**:
```typescript
// Opening a modal
const modalRef = this.modalService.open(ComponentClass, options);

// Setting component inputs
modalRef.componentInstance.propertyName = value;

// Handling results
modalRef.result
  .then(result => { /* success */ })
  .catch(() => { /* dismissed */ });
```

**Modal Component Structure**:
```typescript
@Component({ ... })
export class MyModalComponent {
  @Input() someInput?: string;

  constructor(public modal: NgbActiveModal) {}

  submit(value: any) {
    this.modal.close(value);  // Returns value via modal.result promise
  }

  cancel() {
    this.modal.dismiss();  // Rejects modal.result promise
  }
}
```

### Pattern Comparison

| Aspect | Pattern 1: DialogueService | Pattern 2: NgbModal Direct | Pattern 3: Display-Only |
|--------|---------------------------|---------------------------|------------------------|
| **Complexity** | Low | High | Low |
| **Reusability** | High (service-based) | Medium (per-component) | Low (specific use case) |
| **Data Input** | Simple (strings, primitives) | Complex (objects, arrays) | Simple (display data) |
| **User Interaction** | Buttons, simple inputs | Full forms, search, selection | Read-only |
| **Return Value** | Boolean, string, number | Any type | None |
| **Usage Count** | 17+ places | 7+ places | 1 place |
| **Best Use Case** | Confirmations, prompts | Edit forms, searches | Changelogs, help text |

## Recommended Pattern for Edit Popup

Based on the analysis, **Pattern 2 (NgbModal Direct)** is recommended for implementing an edit popup for the details components because:

1. **Already used for similar functionality**: External service search modals (Trakt, TMDb) handle complex data entry and search
2. **Supports multiple inputs**: Can pass the entire anime/manga object and extension data
3. **Handles complex return values**: Can return the updated data object
4. **Established in codebase**: 7+ existing implementations to reference
5. **Full UI control**: Can replicate the exact edit form structure currently in the details template

**Example Implementation Structure**:

```typescript
// In details component
openEditPopup() {
  const modal = this.modalService.open(AnimeEditComponent);
  modal.componentInstance.anime = this.anime;
  modal.componentInstance.extension = this.anime.my_extension;

  modal.result.then((updatedData) => {
    // Handle save with updated data
    this.saveUpdates(updatedData);
  }).catch(() => {
    // User cancelled, no action needed
  });
}

// New edit component
@Component({
  selector: 'myanili-anime-edit',
  templateUrl: './anime-edit.component.html',
  standalone: false,
})
export class AnimeEditComponent implements OnInit {
  @Input() anime?: Anime;
  @Input() extension?: AnimeExtension;

  editBackup?: Partial<MyAnimeUpdate>;
  editExtension?: AnimeExtension;
  busy = false;

  constructor(public modal: NgbActiveModal) {}

  ngOnInit() {
    // Initialize backup objects (copy from startEdit() method)
    this.editBackup = { ... };
    this.editExtension = { ... };
  }

  save() {
    this.busy = true;
    // Return the edited data to parent
    this.modal.close({
      backup: this.editBackup,
      extension: this.editExtension
    });
  }

  cancel() {
    this.modal.dismiss();
  }
}
```

## Related Research

None found in `thoughts/shared/research/` directory.

## Open Questions

1. Should the edit popup be a separate component per entity type (AnimeEditComponent, MangaEditComponent) or a single generic component?
2. Should validation be performed in the popup before returning data, or in the parent component after modal closes?
3. Should the save API call be made from within the popup or by the parent component?
4. What should be the modal size configuration (`size: 'lg'`, `size: 'xl'`, `windowClass: 'custom-class'`)?
5. Should the popup replicate the current full edit form or show a simplified version?
