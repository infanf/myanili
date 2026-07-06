# MyAniLi

MyAniLi is a web client and Progressive Web App (PWA) for [MyAnimeList](https://myanimelist.net), extended with deep integrations into a wide range of anime and manga tracking services.

![License](https://img.shields.io/github/license/infanf/myanili)

---

## Features

- **Full MyAnimeList integration** — anime & manga lists, detailed pages, status/score/notes updates, seasonal schedule
- **Multi-service anime tracking** — AniList, Kitsu, trakt.tv, SIMKL, Annict, Shikimori
- **Manga support** — MangaBaka (OAuth 2.0), MangaDex, MangaUpdates, MangaPassion
- **External metadata** — AniSearch, TMDB, AniDB, AniList
- **PWA** — installable, offline-capable via Angular Service Worker and IndexedDB caching
- **Responsive UI** — Bootstrap 5, dark/light mode, mobile-first

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21, TypeScript, Bootstrap 5, RxJS |
| Backend | Laravel Lumen 11 (PHP 8.1+) |
| Auth | OAuth 2.0 / PKCE (MAL, AniList, trakt, SIMKL, Annict, Shikimori, MangaBaka) |
| Caching | IndexedDB (client-side), file cache (backend) |
| Container | Docker + Docker Compose |

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Compose plugin
- [Node.js](https://nodejs.org/) 22+ and npm (for root-level scripts)

---

## Quick Start

```bash
git clone https://github.com/infanf/myanili.git
cd myanili
npm install
npm run dev
```

| URL | Description |
|---|---|
| `http://localhost:4200` | Angular dev server |
| `http://localhost:4280` | Lumen API / OAuth backend |

---

## Configuration

Copy the backend environment template and fill in your OAuth credentials:

```bash
cp backend/.env.example backend/.env
```

### Required backend variables

```env
APP_KEY=<generate-with-php-artisan-key:generate>
APP_CLIENT=http://localhost:4200

# MyAnimeList (https://myanimelist.net/apiconfig)
MAL_CLIENT_ID=
MAL_CLIENT_SECRET=

# trakt.tv (https://trakt.tv/oauth/applications)
TRAKT_CLIENT_ID=
TRAKT_CLIENT_SECRET=

# AniList (https://anilist.co/settings/developer)
ANILIST_CLIENT_ID=
ANILIST_CLIENT_SECRET=

# SIMKL (https://simkl.com/settings/developer)
SIMKL_CLIENT_ID=
SIMKL_CLIENT_SECRET=

# Annict (https://annict.com/settings/apps)
ANNICT_CLIENT_ID=
ANNICT_CLIENT_SECRET=

# TMDB (https://www.themoviedb.org/settings/api)
TMDB_API_KEY=
```

### Frontend environment

The Angular environments are in `frontend/src/environments/`. The default development config points to `http://localhost:4280` for the backend.

---

## Available Scripts

### Root (Docker orchestration)

| Command | Description |
|---|---|
| `npm run dev` | Start the full dev environment |
| `npm run dev:build` | Build Docker image, then start dev environment |
| `npm run build` | Build Docker image (no cache) |
| `npm run start` | `docker compose up` |
| `npm run stop` | `docker compose down` |
| `npm run shell` | Open shell in container as `application` |
| `npm run shell:root` | Open shell in container as root |

### Frontend (`frontend/`)

| Command | Description |
|---|---|
| `npm run dev` | Angular dev server (bound to `0.0.0.0`) |
| `npm run build` | Production build |
| `npm run build:beta` | Beta configuration build |
| `npm run test` | Unit tests (Karma/Jasmine) |
| `npm run check` | TSLint + Prettier check |
| `npm run fix` | Auto-fix lint and format issues |

---

## Project Structure

```
myanili/
├── backend/            # Laravel Lumen — OAuth proxy & API integration
│   ├── app/
│   │   ├── Providers/  # One OAuth ServiceProvider per integration
│   │   └── Http/       # Controllers, Middleware
│   └── routes/         # mal.php, anilist.php, trakt.php, …
├── frontend/           # Angular SPA / PWA
│   └── src/app/
│       ├── anime/      # Anime list, details, season schedule
│       ├── manga/      # Manga list, details, bookshelf
│       ├── character/  # Character pages
│       ├── person/     # Staff / creator pages
│       ├── search/     # Global search
│       ├── feed/       # Activity feed
│       ├── settings/   # User preferences
│       ├── components/ # Shared UI (login widgets, media cards, …)
│       └── services/   # Business logic, HTTP, caching
├── docker-compose.yml
├── dev.Dockerfile
└── package.json        # Root npm scripts
```

---

## Integrations

### Anime

| Service | Auth | Notes |
|---|---|---|
| MyAnimeList | OAuth 2.0 + PKCE | Core integration |
| AniList | OAuth 2.0 | GraphQL |
| Kitsu | OAuth 2.0 | REST |
| trakt.tv | OAuth 2.0 | TV/movie focused |
| SIMKL | OAuth 2.0 | |
| Annict | OAuth 2.0 | |
| Shikimori | OAuth 2.0 | |
| AniSearch | — | |
| AniDB | — | |
| TMDB | API key | Movie metadata |

### Manga

| Service | Auth | Notes |
|---|---|---|
| MangaBaka | OAuth 2.0 | Library management, cross-service mapping |
| MangaDex | Public API | |
| MangaUpdates | Public API | |
| MangaPassion | — | |

---

## MangaBaka Setup

1. Navigate to **Settings → Logins**.
2. Click **Connect** in the MangaBaka section.
3. Authorize MyAniLi in the popup — the window closes automatically.

Supported reading states: `reading`, `completed`, `plan_to_read`, `dropped`, `paused`, `considering`, `rereading`.

Cross-service mapping is supported from: AniList, Kitsu, Anime-Planet, MangaUpdates, MyAnimeList.

---

## Contributing

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/) — enforced via `commitlint` and `husky`. Code style is managed by Prettier and TSLint with `lint-staged` on pre-commit.

---

## License

[MIT](LICENSE)

---

## Disclaimer

MyAniLi is not affiliated with MyAnimeList or any other tracked service.
