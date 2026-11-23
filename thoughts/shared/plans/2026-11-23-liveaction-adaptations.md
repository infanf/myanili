---
date: 2026-11-23
author: cschreiner
branch: beta
topic: "Live Action adaptations (Bangumi subject_type 6)"
tags: [plan, liveaction, bangumi, tmdb, trakt, simkl]
status: implemented (untested end-to-end)
---

# Live Action Adaptations

## Decisions

- **Data source:** Bangumi `subject_type=6` (三次元). MAL has no live action; aniSearch has it but no API.
- **Leading list:** the user's Bangumi collection. No Bangumi login means no live action list.
- **Mirrors:** Trakt and SIMKL. They are addressed by TMDB/IMDb IDs, so no own Trakt/SIMKL IDs are stored.
- **External links:** Bangumi, TMDB (favicon), Trakt, SIMKL, aniSearch, MyDramaList (no IMDb link).
  - Trakt slug and SIMKL ID are resolved by the backend with the app's client IDs (`TRAKT_CLIENT_ID`, `SIMKL_CLIENT_ID`), so the links work without a user login there.
  - aniSearch ("movie" type) comes from a manual shared mapping, or automatically from the token-protected bulk export (see below).
- **English metadata:** TMDB, resolved by the backend (`LiveactionResolver`):
  1. manual mapping
  2. infobox `imdb_id` → TMDB `/find`, present on about 20% of subjects
  3. TMDB title search with the original title, then the Chinese title, plus the year
- **Manual mapping** (TMDB type/ID/season) is stored in the backend SQLite and shared by all users. Writing it requires a valid Bangumi token.
- Wikidata (P5732) covers only about 400 live action items and is not used.
- **Relations:** Bangumi rarely links live action to anime directly.
  - Manga → live action uses relation type 6.
  - Anime → source books (type 1) → their live action subjects.
  - aniSearch is only a fallback.
- **Platforms excluded:** 演出 (stage) and 综艺 (variety).
- **Drama labels:** Bangumi files everything except JP/Western/Chinese drama under 电视剧 (mostly Korean, then Thai). The label is derived from the infobox (`国家/地区`, then `语言`), e.g. "Korean Drama". "TV Drama" is the fallback.

## Implementation

Backend:
- `app/Services/LiveactionResolver.php`: SQLite at `LIVEACTION_DB_PATH` (default `/dbs/liveaction.sqlite`), tables `meta` and `mapping`.
- `routes/liveaction.php`:
  - `GET liveaction/meta/{id}`
  - `GET liveaction/tmdb/search/{movie|tv}?query&year`
  - `GET liveaction/tmdb/{type}/{id}`
  - `PUT liveaction/mapping/{id}`

Frontend:
- `models/liveaction.ts`, `services/liveaction/liveaction.service.ts` (fan-out: Bangumi throws, Trakt/SIMKL toast).
- `BangumiService`: type 6 search, subject, relations, collections, `updateLiveaction`.
- `TraktService.updateLiveaction`:
  - Watchlist, history and ratings.
  - Only newly watched episodes are added, since Trakt does not deduplicate.
  - Drop is supported.
- `SimklService.updateLiveaction`: add-to-list (movies or shows), ratings and episode history.
- Module `liveaction/`: list per status, details, edit modal (with TMDB picker `external/tmdb`).
- Search: the existing `SearchComponent` handles `type=liveaction` (`/search/liveaction`, Bangumi instead of MAL, bgm.tv URLs open details). `/liveaction/search` redirects there.
- Navigation: top "Live Action", bottom status tabs and search.
- `LiveactionRelatedComponent` uses Bangumi first (internal links), aniSearch as a fallback.

## TMDB attribution (API Terms §3)

- The About page has a "Data Sources" section. It holds the official TMDB logo (`assets/tmdb.svg`, alt short) and the required notice: "This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB."
- The TMDB chip on the live action details uses the TMDB favicon (`assets/tmdb-favicon.png`).
- Below the synopsis, a "Source: TMDB" note (or "Source: Bangumi" for the Chinese summary) credits the text.
- Logos are 16px high, so they stay less prominent than the MyAniLi logo, as required.
- TMDB data may be cached for at most 6 months. We cache for 7 days (backend) and 1 day (frontend).

## Watchlist

- `liveaction/watchlist` (default route) mirrors the anime watchlist. It has the same header settings, grid/table layout and styles (it reuses the anime watchlist SCSS).
- Bangumi has no simulcast times for live action. The air dates of the episodes (`/v0/episodes`, `airdate`) are used instead:
  - Sorting: days since the next episode aired.
  - autoFilter: hides shows whose next episode has not aired yet.
  - startingSoon: shows planned entries that premiered in the last 4 days.
- "Seen today" is based on the Bangumi collection `updated_at` (after the last 8 am, like anime).
- Marking an episode as seen syncs the update. When the last episode is marked, the entry is set to completed and the user is asked for a rating.

## MyDramaList (prepared, waiting for a public API)

- SIMKL provides the MDL slug (`ids.mdlslug`, e.g. `705723-strange-lawyer-woo-young-woo`). The backend resolves it together with the SIMKL ID.
- A manual shared mapping is possible as well (`mdl_slug` column). The edit dialogue accepts an ID, slug or URL.
- `MydramalistService` is wired into the update/delete fan-out but does nothing while `available = false`.
- **TODO once the API is available:** OAuth login, `updateEntry`/`deleteEntry`, ratings.

## aniSearch (prepared, waiting for API access)

- `GET v1/movie/associated` exists but requires `ANISEARCH_API_TOKEN` with live action access (403 `token_required` without it). Access has been requested.
- `AnisearchDatabase` supports type `movie`, analogous to anime/manga:
  - The mapping is keyed by IMDb ID (table `movie_mapping`).
  - The export source is configurable via `ANISEARCH_MOVIE_SOURCE`. The default `imdb_unique` is a guess.
  - Without a token, nothing is downloaded.
- **TODO once access is granted:**
  - Verify the source name and the export format against the docs.
  - Cached live action meta (7 days) has no `anisearch` yet. Clear the `meta` table in `liveaction.sqlite` after enabling.
- Ratings already work without a token: `anisearch/movie/rating/{id}` falls back to scraping.
- **Until then (and as a fallback):** the ID is found via aniSearch's global quick search (`search?q=`, works without a token).
  - Queries tried: the original title, the TMDB title, then parts of a combined original title.
  - A hit must match the year (±1) and movie vs. series. For title parts, the year and episode count must match exactly.
  - Examples:
    - 392219 → 31563
    - 101828 → 9297
    - 130338 → 14280
    - 73955 → 12072
  - Known gap: aniSearch combines both Attack on Titan films into one entry ("Movie, 2"). Bangumi has two, so 128886 needs a manual mapping.
- The backend meta cache is versioned (`CACHE_VERSION`), so format changes re-resolve cached entries.

## Open points / not done

- The Bangumi collection comment is **public**. It is used as a plain comment, not as storage for extension data.
- Bangumi episode progress can only be increased (episodes are marked as watched, never unmarked).
- No airing schedule. The Bangumi `/calendar` endpoint only covers anime.
- Lists resolve TMDB metadata per entry. On a cold cache this means one backend call per entry.
- Not verified live:
  - Bangumi write endpoints for type 6.
  - Trakt/SIMKL sync calls.
  - TMDB resolution (no API key available locally).
