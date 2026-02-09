# MangaBaka Integration Setup Guide

This document describes the complete MangaBaka integration that has been added to MyAniLi.

## Overview

MangaBaka (https://mangabaka.org) is a manga aggregator and tracking service that has been fully integrated into MyAniLi. Users can now:

- Search for manga series
- View detailed manga information
- Manage their manga library (reading status, progress, ratings)
- Map series from other services (AniList, MAL, Kitsu, etc.) to MangaBaka
- Authenticate via OAuth 2.0

## Files Created/Updated

### Backend
- `backend/app/Providers/MangabakaServiceProvider.php` - OAuth provider configuration
- `backend/routes/web.php` - OAuth authentication routes

### Frontend
- Updated: `frontend/src/app/services/manga/mangabaka.service.ts` - Switched from PAT to OAuth 2.0
- Updated: `frontend/src/app/components/logins/mangabaka-login/mangabaka-login.component.ts` - Updated login flow
- Updated: `frontend/src/app/components/logins/mangabaka-login/mangabaka-login.component.html` - UI for OAuth login

## Setup Instructions

### OAuth 2.0 Authentication

MangaBaka integration now uses OAuth 2.0 for a more secure and seamless experience:

1. Click the "Connect" button in the MangaBaka section on the Logins page.
2. A popup window will open redirects you to https://mangabaka.org.
3. Log in to your MangaBaka account and authorize MyAniLi.
4. The window will close automatically, and you will be connected.

**Note:** Personal Access Tokens (PAT) are no longer supported. If you were previously using a PAT, you will see a notice to reconnect using OAuth.

**Improvement:** Unlike PAT authentication, OAuth provides access to your profile information, allowing MyAniLi to display your username and link directly to your profile.

## Usage

### Authentication

The login component provides PAT-based authentication:

**Login Flow:**
- Click the "Connect" button in the MangaBaka section
- A token input field appears with a link to generate tokens
- Enter your MangaBaka Personal Access Token (mb-...)
- Click "Connect" again
- The service verifies the token and updates the login status

### Service Methods

The `MangabakaService` provides the following methods:

**Authentication:**
```typescript
// Set Personal Access Token and verify it
const isValid = await this.mangabaka.setApiKey('mb-your-token-here');

// Logout
this.mangabaka.logout();

// Check login status
const isLoggedIn = await this.mangabaka.checkLogin();

// Observable for auth state
this.mangabaka.isLoggedIn.subscribe(loggedIn => {
  console.log('Logged in:', loggedIn);
});
```

**Search & Retrieval:**
```typescript
// Search for manga
const results = await this.mangabaka.searchSeries({
  q: 're:zero',
  type: ['manga', 'novel'],
  status: ['releasing'],
});

// Get series by ID
const series = await this.mangabaka.getSeries(84926);

// Map from another service
const series = await this.mangabaka.mapFromSource('anilist', 123456);
```

**Library Management:**
```typescript
// Get user's library
const library = await this.mangabaka.getLibrary({
  limit: 50,
  page: 1,
  sort_by: 'series_title_asc',
});

// Get specific library entry
const entry = await this.mangabaka.getLibraryEntry(84926);

// Add to library
await this.mangabaka.addToLibrary(84926, {
  state: 'reading',
  progress_chapter: 5,
  rating: 90,
});

// Update library entry
await this.mangabaka.updateLibraryEntry(84926, {
  progress_chapter: 10,
  rating: 95,
});

// Remove from library
await this.mangabaka.removeFromLibrary(84926);
```

### Library States

Supported reading states:
- `reading` - Currently reading
- `completed` - Finished reading
- `plan_to_read` - Planning to read
- `dropped` - Dropped
- `paused` - On hold
- `considering` - Considering
- `rereading` - Re-reading

### Source Mapping

MangaBaka can map series from other services:
- `anilist` - AniList ID
- `kitsu` - Kitsu ID
- `anime-planet` - Anime-Planet ID
- `manga-updates` - MangaUpdates (Baka) ID
- `my-anime-list` - MyAnimeList ID

## API Details

**Base URL:** `https://api.mangabaka.dev/v1`

**Authentication:**
- Header: `x-api-key: {token}` (PAT)

**Key Endpoints:**
- `GET /series/search` - Search series
- `GET /series/{id}` - Get series details
- `GET /my/library` - List library entries
- `POST /my/library/{series_id}` - Add to library
- `PATCH /my/library/{series_id}` - Update library entry
- `DELETE /my/library/{series_id}` - Remove from library
- `GET /source/{source}/{id}` - Map from external source

## Testing

To test the integration:

1. **Setup Frontend:**
   ```bash
   cd frontend
   ng serve
   ```

2. **Generate a PAT:**
   - Go to https://mangabaka.org/my/settings
   - Find "Personal Access Tokens (PAT) for API"
   - Generate a new token
   - Copy the token (starts with `mb-`)

3. **Test Authentication:**
   - Navigate to the Logins page
   - Find the MangaBaka section
   - Click "Connect" to show the input field
   - Enter your PAT token
   - Click "Connect" again

4. **Test API Calls:**
   - Open browser console
   - Inject the MangabakaService
   - Call methods to test functionality

## Troubleshooting

### PAT Authentication Fails

**Problem:** PAT login says "not authenticated"
**Solution:**
- Verify the token starts with `mb-`
- Check that the token has `library.read` and `library.write` scopes
- Token may be expired - generate a new one
- Check browser console for API errors

### Username Not Displayed

**Problem:** UI shows "Connected" instead of username
**Solution:**
- This is expected behavior with PAT authentication
- PAT tokens only have access to library API, not userinfo endpoint
- OAuth is required for username display (not yet available from MangaBaka)
- The "Connected" link goes to your settings page

### CORS Issues

**Problem:** API calls blocked by CORS
**Solution:**
- MangaBaka API should support CORS by default
- If issues persist, contact MangaBaka support
- Verify you're making requests to `https://api.mangabaka.dev` (not `https://mangabaka.org`)

### Icon Not Showing

**Problem:** MangaBaka icon (logo) doesn't display
**Solution:**
- Check that https://mangabaka.org/images/logo.png is accessible
- Clear browser cache
- Check browser console for image load errors

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular Frontend                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    MangabakaLoginComponent                           │   │
│  │    - PAT input field                                 │   │
│  │    - Link to token generation                        │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │                                             │
│  ┌──────────────▼───────────────────────────────────────┐   │
│  │    MangabakaService                                  │   │
│  │    - setApiKey() - PAT authentication                │   │
│  │    - searchSeries() - Search manga                   │   │
│  │    - getLibrary() - Get user library                 │   │
│  │    - addToLibrary() - Add to library                 │   │
│  │    - updateLibraryEntry() - Update progress/status   │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │                                             │
│  ┌──────────────▼───────────────────────────────────────┐   │
│  │    CacheService (IndexedDB)                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────┬─────────────────────────────────────────────┘
                │
         Direct API Calls
                │
    ┌───────────▼─────────┐
    │  MangaBaka API      │
    │  api.mangabaka.dev  │
    └─────────────────────┘
```

## Security Considerations

1. **Token Storage:**
   - PAT tokens stored in localStorage
   - Tokens are user-specific and revocable
   - Consider using httpOnly cookies for production

2. **API Keys:**
   - PAT tokens are user-managed
   - Never commit tokens to version control
   - Users can revoke tokens at any time

## Future Enhancements

Potential improvements for the MangaBaka integration:

- [ ] Add OAuth 2.0 support when available from MangaBaka
- [ ] Implement library sync with other services
- [ ] Add manga recommendations based on MangaBaka data
- [ ] Create manga detail page with MangaBaka information
- [ ] Add batch operations for library management
- [ ] Implement offline support with service workers
- [ ] Add analytics for popular manga on MangaBaka

## Support

For issues with:
- **MyAniLi Integration:** Open an issue in the MyAniLi repository
- **MangaBaka API:** Contact MangaBaka support at https://mangabaka.org/support
- **PAT Tokens:** Manage at https://mangabaka.org/my/settings

## References

- MangaBaka Website: https://mangabaka.org
- MangaBaka API: https://api.mangabaka.dev
- Token Management: https://mangabaka.org/my/settings
- OpenAPI Spec: Available at OpenID Connect discovery endpoint
