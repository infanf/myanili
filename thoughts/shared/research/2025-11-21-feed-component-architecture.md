---
date: 2025-11-21T12:13:01+01:00
researcher: cschreiner
git_commit: 20815f182bc012936f25b73c1095e3c65b5f340f
branch: beta
repository: beta
topic: "Feed Component: Activity Model Usage, Avatar Sizes, and Overflow Issues"
tags: [research, codebase, feed, anilist, models, ui]
status: complete
last_updated: 2025-11-21
last_updated_by: cschreiner
last_updated_note: "Added follow-up research confirming medium avatar size (100px) is sufficient for all feed use cases"
---

# Research: Feed Component Architecture and Implementation Details

**Date**: 2025-11-21T12:13:01+01:00
**Researcher**: cschreiner
**Git Commit**: 20815f182bc012936f25b73c1095e3c65b5f340f
**Branch**: beta
**Repository**: beta

## Research Question

The feed component at `frontend/src/app/feed/` uses the AnilistActivity model. Investigation needed on:
1. How the Activity model is structured and if there's duplication between local and shared models
2. What avatar sizes are available in the AniList API and current usage patterns
3. How activities and comments handle overflow and viewport containment

## Summary

The feed component implementation reveals three key architectural aspects:

1. **Activity Model Duplication**: The codebase contains two nearly identical Activity interface definitions - a private `Activity` interface in `feed.service.ts` (used internally for GraphQL response mapping) and a public `AnilistActivity` interface in `anilist.ts` (used by components). The `mapActivity` method bridges these interfaces.

2. **Avatar Size Usage**: The AniList GraphQL API provides only two avatar sizes (`large` and `medium`), but the feed component currently requests only `large` avatars for all use cases. Main activity avatars display at 48x48 pixels while reply avatars display at 32x32 pixels, both using the `large` image source.

3. **Overflow Handling**: The feed component has minimal overflow containment strategies. It uses Bootstrap's basic layout classes (`d-flex`, `flex-grow-1`) but lacks explicit text truncation, line clamping, or overflow control that other components in the codebase implement via `.line-clamp` utility class, `overflow-hidden`, or `text-nowrap`.

## Detailed Findings

### Activity Model Structure and Duplication

#### Private Activity Interface (feed.service.ts)
**Location**: `frontend/src/app/services/anilist/feed.service.ts:703-767`

The service defines a private `Activity` interface used exclusively for mapping GraphQL query results:

```typescript
interface Activity {
  id: number;
  type: string;
  createdAt: number;
  text?: string;
  status?: string;
  progress?: string;
  message?: string;
  user: {
    id: number;
    name: string;
    avatar: { large: string };
  };
  messenger?: { id: number; name: string; avatar: { large: string } };
  recipient?: { id: number; name: string; avatar: { large: string } };
  media?: { /* ... */ };
  replies?: Array<{ /* ... */ }>;
  likes?: Array<{ id: number; name: string }>;
  replyCount: number;
  likeCount: number;
  isLiked?: boolean;
  siteUrl: string;
}
```

**Key characteristics**:
- Defined as private interface within feed.service.ts
- Includes additional fields like `messenger`, `recipient`, and `message` for MessageActivity support
- Used in GraphQL response type definitions (`ActivityResult`, `UserFeedResult`, `FollowingFeedResult`)

#### Public AnilistActivity Interface (anilist.ts)
**Location**: `frontend/src/app/models/anilist.ts:80-129`

The public model used by components throughout the application:

```typescript
export interface AnilistActivity {
  id: number;
  type: string;
  createdAt: number;
  user: {
    id: number;
    name: string;
    avatar: { large: string };
  };
  text?: string;
  status?: string;
  progress?: string;
  media?: { /* ... */ };
  replies?: Array<{ /* ... */ }>;
  likes?: Array<{ id: number; name: string }>;
  replyCount: number;
  likeCount: number;
  isLiked: boolean;
  siteUrl: string;
}
```

**Key characteristics**:
- Exported public interface used by feed component and other consumers
- Simplified structure without MessageActivity-specific fields
- `isLiked` is required (not optional)

#### Mapping Between Interfaces
**Location**: `frontend/src/app/services/anilist/feed.service.ts:217-242`

The `mapActivity` method converts from the private `Activity` interface to the public `AnilistActivity`:

```typescript
private static mapActivity(activity: Activity): AnilistActivity {
  // For MessageActivity, use messenger as the user
  const user = activity.user ||
    activity.messenger || {
      id: 0,
      name: 'Unknown',
      avatar: { large: '' },
    };

  return {
    id: activity.id,
    type: activity.type,
    createdAt: activity.createdAt,
    user,
    text: activity.text || activity.message,  // Maps message to text
    status: activity.status,
    progress: activity.progress,
    media: activity.media,
    replies: activity.replies,
    likes: activity.likes,
    replyCount: activity.replyCount,
    likeCount: activity.likeCount,
    isLiked: activity.isLiked || false,  // Defaults to false
    siteUrl: activity.siteUrl,
  };
}
```

**Transformation logic**:
- Consolidates `messenger` field to `user` for MessageActivity types
- Maps `message` field to `text` for uniform text access
- Defaults `isLiked` to `false` if undefined
- Provides fallback "Unknown" user when no user data exists

#### GraphQL Query Structure
**Location**: `frontend/src/app/services/anilist/feed.service.ts:244-674`

The service defines three GraphQL queries (`getUserFeedQuery`, `getFollowingFeedQuery`, `getActivityQuery`) that fetch activities using union type fragments:

```graphql
activities(userId: $userId, sort: ID_DESC) {
  ... on ListActivity { /* fields */ }
  ... on TextActivity { /* fields */ }
  ... on MessageActivity { /* fields */ }
}
```

All three activity types request identical avatar structure:
```graphql
avatar {
  large
}
```

**Current State**: Only the `large` avatar size is requested in all queries (lines 288, 299, 321, 332, 354, 361, 372, 435, 446, 468, 501, 519, 574, 585, 607, 618, 640, 658). The `medium` size is never queried.

### Avatar Sizes in AniList API

#### Available Sizes
According to the [AniList API documentation](https://docs.anilist.co/reference/object/useravatar), the `UserAvatar` type provides exactly two size options:

- **large**: "The avatar of user at its largest size" (String URL)
- **medium**: "The avatar of user at medium size" (String URL)

**Note**: The official AniList API documentation does not specify pixel dimensions for these sizes. Both return URLs to pre-rendered images hosted on AniList's CDN.

#### Current Usage in Feed Component
**Location**: `frontend/src/app/feed/feed.component.html`

**Main Activity Avatars** (line 62-69):
```html
<img
  [src]="activity.user.avatar.large"
  class="rounded-circle me-3"
  width="48"
  height="48"
  alt="{{ activity.user.name }}"
  [routerLink]="['/feed/user', activity.user.id]"
  style="cursor: pointer"
/>
```

**Reply Avatars** (line 141-148):
```html
<img
  [src]="reply.user.avatar.large"
  class="rounded-circle me-2"
  width="32"
  height="32"
  alt="{{ reply.user.name }}"
  [routerLink]="['/feed', reply.user.id]"
  style="cursor: pointer"
/>
```

**Observation**: Both use cases request the `large` avatar size despite different display dimensions:
- Main avatars: 48×48 pixels
- Reply avatars: 32×32 pixels (potentially wasteful bandwidth for smaller display)

#### Avatar Size in Other Models
**Location**: `frontend/src/app/models/anilist.ts:4-10`

The base `User` interface only defines `medium`:
```typescript
export interface User {
  id: number;
  name: string;
  avatar: {
    medium: string;
  };
}
```

**Note**: This creates an inconsistency - `User` interface expects `medium`, but `AnilistActivity` uses `large`.

#### Login Query Pattern
**Location**: `frontend/src/app/services/anilist.service.ts:89-100`

The `checkLogin` query fetches both sizes:
```graphql
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
```

This demonstrates awareness of both sizes, though only `large` is used in feed queries.

### Overflow and Viewport Containment

#### Current Feed Component Styling
**Location**: `frontend/src/app/feed/feed.component.scss`

The SCSS file is essentially empty:
```scss
// Minimal custom styles - using Bootstrap utilities instead
```

**Implication**: All styling relies on Bootstrap utility classes with no custom overflow handling.

#### HTML Structure and Layout
**Location**: `frontend/src/app/feed/feed.component.html`

**Container Structure** (line 1):
```html
<div class="container-fluid mt-4">
  <div class="row">
    <div class="col-12">
```

Uses Bootstrap's full-width responsive container with no explicit width constraints.

**Activity Card Layout** (lines 58-60, 70):
```html
<div class="card shadow-sm">
  <div class="card-body">
    <div class="d-flex align-items-start">
      <img />
      <div class="flex-grow-1">
        <!-- Activity content -->
      </div>
    </div>
  </div>
</div>
```

**Flex Layout Characteristics**:
- `d-flex align-items-start`: Flexbox with top alignment
- `flex-grow-1`: Content area expands to fill available space
- **No overflow constraints**: Content can grow indefinitely

**Activity Text Rendering** (line 86):
```html
<div class="mt-2 lh-base" [innerHTML]="getActivityText(activity)"></div>
```

**Reply Text Rendering** (line 160):
```html
<div [innerHTML]="parseMarkdown(reply.text)"></div>
```

**Current Implementation**:
- `lh-base`: Bootstrap's standard line-height class
- `[innerHTML]`: Binds parsed markdown/HTML directly
- **No truncation**: Text can overflow viewport without constraint
- **No line clamping**: Multi-line text displays fully without limit

#### Markdown Parsing
**Location**: `frontend/src/app/feed/feed.component.ts:136-147`

```typescript
parseMarkdown(text: string): string {
  if (text) {
    try {
      return marked.parse(text, { async: false, breaks: true }) as string;
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return text;
    }
  }
  return '';
}
```

**Configuration**: `breaks: true` converts newlines to `<br>` tags, which can contribute to vertical overflow when users include many line breaks.

#### Reply Section Layout
**Location**: `frontend/src/app/feed/feed.component.html:134-163`

```html
<div class="mt-3" *ngIf="showReplies[activity.id]">
  <div
    class="mb-2 p-2 bg-body-tertiary rounded border-start border-primary border-3"
    *ngFor="let reply of activity.replies"
  >
    <div class="d-flex">
      <img />
      <div class="flex-grow-1">
        <div [innerHTML]="parseMarkdown(reply.text)"></div>
      </div>
    </div>
  </div>
</div>
```

**Observations**:
- Reply container uses `bg-body-tertiary` with left border accent
- Same `flex-grow-1` pattern as main activity
- **No max-height or scroll behavior**: All replies display fully

#### Available Overflow Patterns in Codebase

The codebase includes several overflow handling patterns not currently used in the feed component:

**1. Line Clamping Utility** (`frontend/src/styles.scss:168-174`):
```scss
.line-clamp {
  --clamp-lines: 3;
  display: -webkit-box;
  -webkit-line-clamp: var(--clamp-lines);
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

**Usage**: Truncates text to specified number of lines (default 3, configurable via CSS variable)

**2. Container Overflow Control** (`frontend/src/app/components/media-card/media-card.component.html:1`):
```html
<div class="card cursor-pointer overflow-hidden">
```

**Usage**: Hard cutoff of content exceeding card boundaries

**3. Scrollable Overflow** (`frontend/src/app/components/media-card/media-card.component.scss`):
```scss
.card-details {
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 0;  // Hidden scrollbar
  }
}
```

**Usage**: Allows scrolling within container with hidden scrollbar

**4. Text Nowrap** (various locations):
```html
<span class="text-nowrap">{{ dateValue | date }}</span>
```

**Usage**: Prevents wrapping for single-line content

**Current Status**: None of these patterns are applied in the feed component.

## Code References

- `frontend/src/app/feed/feed.component.ts:3` - AnilistActivity model import
- `frontend/src/app/feed/feed.component.html:62-69` - Main avatar usage (48×48, large)
- `frontend/src/app/feed/feed.component.html:141-148` - Reply avatar usage (32×32, large)
- `frontend/src/app/feed/feed.component.html:86` - Activity text rendering (no overflow control)
- `frontend/src/app/feed/feed.component.html:160` - Reply text rendering (no overflow control)
- `frontend/src/app/feed/feed.component.scss:1-2` - Minimal SCSS (no custom styles)
- `frontend/src/app/models/anilist.ts:80-129` - Public AnilistActivity interface
- `frontend/src/app/services/anilist/feed.service.ts:703-767` - Private Activity interface
- `frontend/src/app/services/anilist/feed.service.ts:217-242` - mapActivity method
- `frontend/src/app/services/anilist/feed.service.ts:244-674` - GraphQL queries (only large avatars)
- `frontend/src/styles.scss:168-174` - Available .line-clamp utility (not used in feed)

## Architecture Documentation

### Activity Data Flow

1. **GraphQL Query** → Feed Service queries AniList API with union type fragments
2. **Response Mapping** → Private `Activity` interface captures GraphQL response
3. **Transformation** → `mapActivity` method converts to public `AnilistActivity`
4. **Observable Stream** → BehaviorSubject publishes to component subscribers
5. **Component Binding** → Feed component receives array via `anilistService.feed`
6. **Template Rendering** → Angular template displays activities with data binding

### Model Architecture Pattern

The dual-interface pattern serves a separation of concerns:

- **Private interface** (`Activity`): Tightly coupled to GraphQL schema, handles API variations (ListActivity, TextActivity, MessageActivity)
- **Public interface** (`AnilistActivity`): Stable contract for components, abstracts API details
- **Mapping layer**: Provides data normalization and fallback handling

This pattern allows GraphQL schema changes to be isolated to the service layer without breaking component contracts.

### Avatar Request Strategy

**Current**: All queries request only `large` avatar size
**API Capability**: Supports `large` and `medium` sizes
**Display Context**: Varies from 32×32 (replies) to 48×48 (main activities)

### Overflow Strategy

**Current**: Relies on Bootstrap defaults with no explicit constraints
**Available Tools**: `.line-clamp`, `overflow-hidden`, `text-nowrap` utilities exist but are unused
**Layout Pattern**: `flex-grow-1` allows unlimited content expansion

## Related Patterns

### Markdown Rendering Pattern
Used across codebase for user-generated content:
- `marked.parse()` with `breaks: true` configuration
- `[innerHTML]` binding for HTML output
- `nl2br` pipe for simpler newline conversion (not used in feed)
- DomSanitizer via `safe` pipe when security bypass needed

### Card Layout Pattern
Common structure in codebase:
- Bootstrap card components (`card`, `card-body`)
- Flexbox with avatar + content (`d-flex`, `flex-grow-1`)
- Shadow utilities for depth (`shadow-sm`)
- Responsive grid system (`container-fluid`, `row`, `col-12`)

### Text Containment Strategies
Available but unused in feed:
- `.line-clamp` for multi-line truncation
- `text-nowrap` for single-line preservation
- `overflow-hidden` for container boundaries
- `overflow-y: scroll` for scrollable areas

## External Resources

- [AniList UserAvatar API Documentation](https://docs.anilist.co/reference/object/useravatar)
- [AniList GraphiQL Explorer](https://anilist.co/graphiql) - Interactive schema testing
- [AniList API GitHub Repository](https://github.com/AniList/ApiV2-GraphQL-Docs)

## Open Questions

1. **Model Consolidation**: Is the dual-interface pattern necessary, or could the public `AnilistActivity` interface be enhanced to handle MessageActivity types directly?

2. **Avatar Size Optimization**: Would using `medium` avatars for reply sections (32×32 display) reduce bandwidth without perceptible quality loss?

3. **Overflow Behavior Intent**: Is the current unlimited text expansion intentional design, or should content be constrained within viewport boundaries?

4. **Line Break Handling**: Does the `breaks: true` markdown option cause excessive vertical spacing when users include multiple newlines?

5. **Performance Impact**: With unlimited content expansion, how does the feed component perform with:
   - Very long activity text (multi-paragraph posts)?
   - Activities with many replies (50+)?
   - Markdown with complex nested elements?

6. **User Interface Definition**: Should activities/replies have visual boundaries or constraints, or is full content visibility the intended UX?

## Follow-up Research [2025-11-21T12:13:01+01:00]

### Avatar Size Confirmation: Medium Avatar Dimensions

**Context**: During initial research, the exact pixel dimensions of AniList avatar sizes were not documented in the official API documentation. Follow-up investigation confirms the actual dimensions.

**Finding**: The `medium` avatar size from AniList API is **100×100 pixels**.

**Implication**: The medium avatar size at 100px is sufficient for all feed component use cases:

1. **Main Activity Avatars** (currently 48×48 display):
   - Using `medium` (100px) downscaled to 48px provides excellent quality
   - 2× native resolution ensures crisp rendering on high-DPI displays
   - No visual quality loss compared to using `large`

2. **Reply Avatars** (currently 32×32 display):
   - Using `medium` (100px) downscaled to 32px provides more than adequate quality
   - 3× native resolution is excessive but ensures maximum sharpness
   - Significantly better than needed for standard displays

**Recommendation**: The feed component can safely use `medium` avatars for all use cases instead of requesting `large` avatars. This would:
- Reduce bandwidth consumption
- Improve page load performance
- Maintain excellent visual quality at both 48×48 and 32×32 display sizes
- Align with the base `User` interface which already defines `avatar.medium` (`frontend/src/app/models/anilist.ts:7-9`)

**Current Inconsistency Resolved**: The base `User` interface expects `medium` avatars while `AnilistActivity` uses `large`. Since medium (100px) is sufficient for all display contexts, the interfaces could be aligned to consistently use `medium`, simplifying the model structure.
