# Feed Component Improvements Implementation Plan

## Overview

Improve the feed component by:
1. Switching from `large` to `medium` avatars (100px) for bandwidth optimization
2. Consolidating Activity model interfaces to eliminate duplication
3. Adding overflow controls (line clamping, word-break) to prevent viewport breakage

**Goal**: Reduce bandwidth, simplify codebase, and ensure content stays contained within viewport boundaries.

## Current State Analysis

### Avatar Usage
- Feed component requests `large` avatars for all contexts (48×48 and 32×32 display)
- Medium avatars are 100×100 pixels, sufficient for both use cases with excellent quality
- Base `User` interface already defines `avatar.medium`, creating inconsistency

### Model Duplication
- Private `Activity` interface in `frontend/src/app/services/anilist/feed.service.ts:703-767`
- Public `AnilistActivity` interface in `frontend/src/app/models/anilist.ts:80-129`
- `mapActivity` method bridges these interfaces
- Duplication adds maintenance burden without clear benefit

### Overflow Issues
- No text truncation or line clamping
- No word-break controls for long URLs or words
- Content can grow indefinitely, breaking viewport
- `.line-clamp` utility exists in `frontend/src/styles.scss:168-174` but is unused

## Desired End State

### After Implementation:
1. **Avatar Optimization**: All feed queries request `medium` avatars, reducing bandwidth
2. **Single Model**: Only public `AnilistActivity` interface exists, with MessageActivity support
3. **Contained Content**: Activity and reply text has line clamping and word-break, preventing overflow

### Verification:
- Feed page loads faster (smaller avatar images)
- TypeScript compiles without errors
- Long text/URLs don't break card layouts
- Content stays within viewport on mobile and desktop
- All existing functionality works unchanged

## What We're NOT Doing

- Not adding "show more/less" text expansion (can be added later)
- Not modifying the base `User` interface
- Not changing other components that use `AnilistActivity`
- Not altering GraphQL query structure beyond avatar field
- Not touching notification system or other AniList integrations

## Implementation Approach

**Strategy**: Implement in three independent phases to minimize risk:
1. Avatar switch (pure data optimization)
2. Model consolidation (refactoring with no behavioral changes)
3. Overflow controls (pure UI enhancement)

Each phase is independently testable and can be deployed separately if needed.

---

## Phase 1: Switch to Medium Avatars

### Overview
Replace all `large` avatar requests with `medium` in the feed service. This reduces bandwidth while maintaining excellent visual quality (100px downscaled to 48px or 32px).

### Changes Required

#### 1. Update GraphQL Queries in Feed Service
**File**: `frontend/src/app/services/anilist/feed.service.ts`

**Lines to change**: 288, 299, 321, 332, 354, 361, 372, 435, 446, 468, 501, 519, 574, 585, 607, 618, 640, 658

**Change all occurrences from**:
```graphql
avatar {
  large
}
```

**To**:
```graphql
avatar {
  medium
}
```

**Specific locations**:
- `getUserFeedQuery()` method (lines 244-389):
  - ListActivity user avatar (line 287-289)
  - ListActivity replies user avatar (line 298-300)
  - TextActivity user avatar (line 320-322)
  - TextActivity replies user avatar (line 331-333)
  - MessageActivity messenger avatar (line 353-355)
  - MessageActivity recipient avatar (line 360-362)
  - MessageActivity replies user avatar (line 371-373)

- `getFollowingFeedQuery()` method (lines 391-536):
  - ListActivity user avatar (line 434-436)
  - ListActivity replies user avatar (line 445-447)
  - TextActivity user avatar (line 467-469)
  - TextActivity replies user avatar (line 478-480)
  - MessageActivity messenger avatar (line 500-502)
  - MessageActivity recipient avatar (line 508-510)
  - MessageActivity replies user avatar (line 518-520)

- `getActivityQuery()` method (lines 538-674):
  - ListActivity user avatar (line 573-575)
  - ListActivity replies user avatar (line 584-586)
  - TextActivity user avatar (line 606-608)
  - TextActivity replies user avatar (line 617-619)
  - MessageActivity messenger avatar (line 639-641)
  - MessageActivity recipient avatar (line 647-649)
  - MessageActivity replies user avatar (line 657-659)

#### 2. Update AnilistActivity Interface
**File**: `frontend/src/app/models/anilist.ts`

**Lines**: 80-129

**Change**:
```typescript
export interface AnilistActivity {
  id: number;
  type: string;
  createdAt: number;
  user: {
    id: number;
    name: string;
    avatar: {
      large: string;  // Change this
    };
  };
  // ... rest of interface
  replies?: Array<{
    id: number;
    text: string;
    createdAt: number;
    user: {
      id: number;
      name: string;
      avatar: {
        large: string;  // Change this too
      };
    };
  }>;
  // ... rest of interface
}
```

**To**:
```typescript
export interface AnilistActivity {
  id: number;
  type: string;
  createdAt: number;
  user: {
    id: number;
    name: string;
    avatar: {
      medium: string;  // Changed
    };
  };
  // ... rest of interface
  replies?: Array<{
    id: number;
    text: string;
    createdAt: number;
    user: {
      id: number;
      name: string;
      avatar: {
        medium: string;  // Changed
      };
    };
  }>;
  // ... rest of interface
}
```

#### 3. Update Private Activity Interface (Temporary)
**File**: `frontend/src/app/services/anilist/feed.service.ts`

**Lines**: 703-767

Update the private `Activity` interface avatar fields to match (will be removed in Phase 2):

```typescript
interface Activity {
  // ... other fields
  user: {
    id: number;
    name: string;
    avatar: { medium: string };  // Changed from large
  };
  messenger?: {
    id: number;
    name: string;
    avatar: { medium: string };  // Changed from large
  };
  recipient?: {
    id: number;
    name: string;
    avatar: { medium: string };  // Changed from large
  };
  // ... rest of interface
  replies?: Array<{
    id: number;
    text: string;
    createdAt: number;
    user: {
      id: number;
      name: string;
      avatar: {
        medium: string;  // Changed from large
      };
    };
  }>;
  // ... rest of interface
}
```

#### 4. Update mapActivity Method
**File**: `frontend/src/app/services/anilist/feed.service.ts`

**Lines**: 217-242

Update the fallback avatar in the `mapActivity` method:

**Change**:
```typescript
const user = activity.user ||
  activity.messenger || {
    id: 0,
    name: 'Unknown',
    avatar: { large: '' },  // Change this
  };
```

**To**:
```typescript
const user = activity.user ||
  activity.messenger || {
    id: 0,
    name: 'Unknown',
    avatar: { medium: '' },  // Changed
  };
```

#### 5. Update Feed Component Template
**File**: `frontend/src/app/feed/feed.component.html`

**Line 62**: Change main avatar property
```html
<!-- Before -->
<img [src]="activity.user.avatar.large" />

<!-- After -->
<img [src]="activity.user.avatar.medium" />
```

**Line 141**: Change reply avatar property
```html
<!-- Before -->
<img [src]="reply.user.avatar.large" />

<!-- After -->
<img [src]="reply.user.avatar.medium" />
```

### Success Criteria

#### Automated Verification:
- [x] TypeScript compiles without errors: `cd frontend && npm run build`
- [ ] No linting errors: `cd frontend && npm run lint`
- [ ] Application starts successfully: `cd frontend && npm start`

#### Manual Verification:
- [ ] Navigate to feed page - loads without errors
- [ ] Main activity avatars display correctly (48×48)
- [ ] Reply avatars display correctly (32×32)
- [ ] Avatar image quality is excellent (no pixelation)
- [ ] Network tab shows smaller avatar image sizes
- [ ] All avatar images load successfully (check browser console for 404s)
- [ ] User profile navigation still works when clicking avatars

---

## Phase 2: Consolidate Activity Models

### Overview
Remove the private `Activity` interface and use only the public `AnilistActivity` interface throughout the feed service. Enhance `AnilistActivity` to support MessageActivity fields.

### Changes Required

#### 1. Enhance AnilistActivity Interface
**File**: `frontend/src/app/models/anilist.ts`

**Lines**: 80-129

**Add optional MessageActivity fields**:
```typescript
export interface AnilistActivity {
  id: number;
  type: string;
  createdAt: number;
  user: {
    id: number;
    name: string;
    avatar: {
      medium: string;
    };
  };
  text?: string;
  status?: string;
  progress?: string;

  // Add MessageActivity support
  message?: string;
  messenger?: {
    id: number;
    name: string;
    avatar: {
      medium: string;
    };
  };
  recipient?: {
    id: number;
    name: string;
    avatar: {
      medium: string;
    };
  };

  media?: {
    id: number;
    idMal?: number;
    type: 'ANIME' | 'MANGA';
    startDate: {
      year: number;
    };
    format: string;
    title: {
      userPreferred: string;
    };
    coverImage: {
      large: string;
    };
  };
  replies?: Array<{
    id: number;
    text: string;
    createdAt: number;
    user: {
      id: number;
      name: string;
      avatar: {
        medium: string;
      };
    };
  }>;
  likes?: Array<{
    id: number;
    name: string;
  }>;
  replyCount: number;
  likeCount: number;
  isLiked: boolean;
  siteUrl: string;
}
```

#### 2. Update GraphQL Response Type Definitions
**File**: `frontend/src/app/services/anilist/feed.service.ts`

**Lines**: 677-702

**Replace**:
```typescript
interface ActivityResult {
  Activity: Activity;
}

interface UserFeedResult {
  Page: {
    pageInfo: PageInfo;
    activities: Activity[];
  };
}

interface FollowingFeedResult {
  Page: {
    pageInfo: PageInfo;
    activities: Activity[];
  };
}
```

**With**:
```typescript
interface ActivityResult {
  Activity: AnilistActivity;
}

interface UserFeedResult {
  Page: {
    pageInfo: PageInfo;
    activities: AnilistActivity[];
  };
}

interface FollowingFeedResult {
  Page: {
    pageInfo: PageInfo;
    activities: AnilistActivity[];
  };
}
```

**Add import at top of file** (after line 2):
```typescript
import { AnilistActivity } from '@models/anilist';
```

#### 3. Remove Private Activity Interface
**File**: `frontend/src/app/services/anilist/feed.service.ts`

**Lines**: 703-767

**Delete the entire interface**:
```typescript
interface Activity {
  // ... DELETE ALL OF THIS (lines 703-767)
}
```

#### 4. Update mapActivity Method Signature
**File**: `frontend/src/app/services/anilist/feed.service.ts`

**Lines**: 217-242

**Change**:
```typescript
private static mapActivity(activity: Activity): AnilistActivity {
  // ... implementation
}
```

**To**:
```typescript
private static mapActivity(activity: AnilistActivity): AnilistActivity {
  // ... implementation
}
```

**Note**: The implementation stays the same - it already handles the mapping logic correctly.

### Success Criteria

#### Automated Verification:
- [x] TypeScript compiles without errors: `cd frontend && npm run build`
- [ ] No linting errors: `cd frontend && npm run lint`
- [ ] No unused imports or variables
- [ ] Application starts successfully: `cd frontend && npm start`

#### Manual Verification:
- [ ] Feed page loads without errors
- [ ] User feed displays correctly
- [ ] Following feed displays correctly
- [ ] Single activity view works
- [ ] Like/unlike functionality works
- [ ] Reply posting works
- [ ] All activity types display (List, Text, Message)
- [ ] MessageActivity shows correct user (messenger vs recipient)
- [ ] No console errors related to missing properties

---

## Phase 3: Add Overflow Controls

### Overview
Add CSS overflow controls to prevent content from breaking the viewport. Apply word-break for long words/URLs and line clamping for multi-line text.

### Changes Required

#### 1. Add Feed Component Styles
**File**: `frontend/src/app/feed/feed.component.scss`

**Current content** (line 1):
```scss
// Minimal custom styles - using Bootstrap utilities instead
```

**Replace with**:
```scss
// Activity and reply text overflow controls
.activity-text,
.reply-text {
  // Prevent long words/URLs from breaking layout
  word-break: break-word;
  overflow-wrap: break-word;

  // Ensure content doesn't overflow horizontally
  max-width: 100%;

  // Optional: Add line clamping (can be removed if not desired)
  &.clamped {
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.reply-text {
  &.clamped {
    -webkit-line-clamp: 3; // Fewer lines for replies
  }
}

// Ensure cards don't overflow
.card {
  overflow: hidden;
}
```

#### 2. Update Activity Text in Template
**File**: `frontend/src/app/feed/feed.component.html`

**Line 86**:

**Change**:
```html
<div class="mt-2 lh-base" [innerHTML]="getActivityText(activity)"></div>
```

**To**:
```html
<div class="mt-2 lh-base activity-text clamped" [innerHTML]="getActivityText(activity)"></div>
```

#### 3. Update Reply Text in Template
**File**: `frontend/src/app/feed/feed.component.html`

**Line 160**:

**Change**:
```html
<div [innerHTML]="parseMarkdown(reply.text)"></div>
```

**To**:
```html
<div class="reply-text clamped" [innerHTML]="parseMarkdown(reply.text)"></div>
```

#### 4. Add overflow-hidden to Card Container (Optional Safety)
**File**: `frontend/src/app/feed/feed.component.html`

**Line 58**:

**Change**:
```html
<div class="card shadow-sm">
```

**To**:
```html
<div class="card shadow-sm overflow-hidden">
```

### Success Criteria

#### Automated Verification:
- [x] SCSS compiles without errors: `cd frontend && npm run build`
- [ ] No linting errors: `cd frontend && npm run lint`
- [ ] Application starts successfully: `cd frontend && npm start`

#### Manual Verification:
- [ ] Long activity text is clamped to 5 lines with ellipsis
- [ ] Long reply text is clamped to 3 lines with ellipsis
- [ ] Long URLs don't cause horizontal scrolling
- [ ] Long words without spaces break appropriately
- [ ] Cards maintain proper width on mobile devices
- [ ] No horizontal overflow on any screen size (test at 320px, 768px, 1024px)
- [ ] Text is still readable and doesn't appear cut off awkwardly
- [ ] Line clamping works in Chrome, Firefox, Safari
- [ ] Markdown formatting (bold, links) still works within clamped text

---

## Testing Strategy

### Unit Tests
Not applicable - these are primarily UI/styling changes. Component already has integration with service layer that doesn't need testing.

### Integration Tests
Not applicable - no new API interactions or data flow changes.

### Manual Testing Steps

#### Test Data Scenarios:
1. **Short activity text** (1-2 lines) - should display fully
2. **Long activity text** (10+ lines) - should clamp to 5 lines
3. **Activity with very long URL** - should break and wrap properly
4. **Reply with long text** (5+ lines) - should clamp to 3 lines
5. **Activity with markdown** (bold, links, lists) - should render correctly while clamped
6. **Activity with many line breaks** - should still clamp properly
7. **Empty/null text** - should handle gracefully

#### Browser Testing:
- Chrome (desktop & mobile viewport)
- Firefox
- Safari (if available)
- Edge

#### Viewport Sizes:
- Mobile: 320px, 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px

#### Specific Test Cases:

**Avatar Testing (Phase 1)**:
1. Load feed page, verify avatars display
2. Open network tab, confirm avatar URLs contain "medium" not "large"
3. Check avatar file sizes are smaller than before
4. Verify no broken images (404s)
5. Click avatar, verify navigation still works

**Model Consolidation (Phase 2)**:
1. Load user feed with mixed activity types
2. Verify all activities display correctly
3. Like an activity, verify state updates
4. Post a reply, verify it appears
5. Check browser console for any errors
6. Load following feed, verify works
7. Load single activity by ID, verify works

**Overflow Controls (Phase 3)**:
1. Find activity with very long text (>10 lines)
   - Verify it's clamped to 5 lines
   - Verify ellipsis appears
2. Find activity with long URL
   - Verify it breaks to multiple lines
   - Verify no horizontal scroll
3. Test on mobile viewport (320px)
   - Verify cards don't overflow
   - Verify text wraps properly
4. Test in different browsers
   - Chrome: line clamping works
   - Firefox: line clamping works
   - Safari: line clamping works

## Performance Considerations

### Avatar Bandwidth Reduction:
- Medium avatars (100×100) are approximately 30-50% smaller than large avatars
- Feed page with 25 activities = 25 main avatars + variable reply avatars
- Estimated bandwidth savings: 100-200 KB per page load
- Mobile users benefit most from reduced data usage

### No Performance Degradation:
- Model consolidation removes code but doesn't add processing
- CSS overflow controls are performant (GPU-accelerated)
- No new subscriptions or observables
- No additional HTTP requests

## Migration Notes

### No Data Migration Required:
- All changes are code-only
- No database schema changes
- No API contract changes (same GraphQL queries, different field)
- No user data affected

### Backward Compatibility:
- Public `AnilistActivity` interface is enhanced, not broken
- Existing code using `AnilistActivity` continues to work
- Optional fields (messenger, recipient, message) don't break existing consumers

### Deployment:
- Can deploy all phases together or separately
- No required coordination with backend
- No feature flags needed
- Safe to deploy during business hours

## References

- Research document: `thoughts/shared/research/2025-11-21-feed-component-architecture.md`
- AniList API docs: https://docs.anilist.co/reference/object/useravatar
- Line clamp utility: `frontend/src/styles.scss:168-174`
- Current implementation:
  - Feed component: `frontend/src/app/feed/feed.component.ts`
  - Feed service: `frontend/src/app/services/anilist/feed.service.ts`
  - Models: `frontend/src/app/models/anilist.ts`
