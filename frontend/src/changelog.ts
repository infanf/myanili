export const changelog: Changelog = {
  changes: [
    {
      version: '2.36.1',
      date: new Date('2026-02-17'),
      fixes: ['Manga: mangaupdates rating not showing up on details page'],
      other: [
        'Anime: reenable aniDB proxy with cache to handle rate limits',
        'Update dependencies',
      ],
    },
    {
      version: '2.36.0',
      date: new Date('2026-01-29'),
      features: [
        'Manga: MangaBaka integration - automatic library synchronization',
        'Manga: MangaBaka ratings display on details page',
        'Manga: Auto-fetch MangaBaka series IDs via AniList/MAL mapping',
        'Manga: Extract Anime News Network and Anime-Planet IDs from MangaBaka',
        'Manga: Links to MangaBaka and Anime-Planet on manga details page',
      ],
      other: ['Update dependencies'],
    },
    {
      version: '2.35.2',
      date: new Date('2026-01-26'),
      fixes: ['Anime/Manga: restore "Remove from List" button in edit modal'],
    },
    {
      version: '2.35.1',
      date: new Date('2026-01-12'),
      fixes: ['fix deployment'],
    },
    {
      version: '2.35.0',
      date: new Date('2026-01-12'),
      features: ['Anime/Manga: show user start and end date', 'Anime/Manga: move edits into popup'],
      other: ['Update dependencies'],
    },
    {
      version: '2.34.4',
      date: new Date('2025-12-09'),
      fixes: ['Anime: popups for external connections not working'],
    },
    {
      version: '2.34.3',
      date: new Date('2025-12-02'),
      fixes: ['Feed: fix text parsing for some edge cases'],
      other: ['Update dependencies'],
    },
    {
      version: '2.34.2',
      date: new Date('2025-11-22'),
      features: ['Feed: Show users who liked an activity'],
      other: ['Update dependencies'],
    },
    {
      version: '2.34.1',
      date: new Date('2025-11-21'),
      features: ['Feed: Optimizations'],
    },
    {
      version: '2.34.0',
      date: new Date('2025-11-19'),
      features: ['Anilist Activity Feed', 'Manga Platforms: Rename Azuki to Omoi'],
    },
    {
      version: '2.33.10',
      date: new Date('2025-10-06'),
      fixes: ['Login: add loading state to login button'],
      other: ['Update dependencies'],
    },
    {
      version: '2.33.9',
      date: new Date('2025-09-08'),
      fixes: ['Login: need reload to show user for MAL and Livechart'],
      other: ['Update dependencies'],
    },
    {
      version: '2.33.8',
      date: new Date('2025-06-26'),
      fixes: ['Anisearch: fix OAuth authentication by implementing PKCE support'],
    },
    {
      version: '2.33.7',
      date: new Date('2025-06-19'),
      fixes: [
        "Manga: don't set completed status after first read chapter",
        'Manga: include unavailable chapters from MangaDex for volume/chapter mapping',
      ],
    },
    {
      version: '2.33.6',
      date: new Date('2025-06-04'),
      features: ['Trakt: auto map via simkl and imdb'],
    },
    {
      version: '2.33.5',
      date: new Date('2025-05-26'),
      features: ['Trakt: add newly introduced drop functionality'],
    },
    {
      version: '2.33.4',
      date: new Date('2025-05-09'),
      fixes: ['Shikimori: disable login if token refresh fails'],
    },
    {
      version: '2.33.3',
      date: new Date('2025-05-05'),
      fixes: ['Anilist: rewatching media are set to completed'],
      features: ['Add streaming platform WeTV (@nattadasu)'],
    },
    {
      version: '2.33.2',
      date: new Date('2025-05-03'),
      fixes: ['aniSearch: Fix entry updates to not change visibility'],
    },
    {
      version: '2.33.1',
      date: new Date('2025-05-01'),
      fixes: ['aniSearch: Fix entry updates to not remove data'],
    },
    {
      version: '2.33.0',
      date: new Date('2025-05-01'),
      features: [
        'Add support for aniSearch Accounts',
        'Add additional streaming and manga platforms (@nattadasu)',
      ],
      other: ['Update dependencies'],
    },
    {
      version: '2.32.0',
      date: new Date('2025-04-16'),
      fixes: ['Kitsu: fix auto logoff'],
      features: ['Anime: add promo videos'],
      other: ['Update Angular to 19'],
    },
    {
      version: '2.31.3',
      date: new Date('2025-01-18'),
      features: ['Add streaming platform Plex'],
    },
    {
      version: '2.31.2',
      date: new Date('2025-01-05'),
      features: ['Add streaming platforms Laftel and SHAHID (@nattadasu)'],
    },
    {
      version: '2.31.1',
      date: new Date('2025-01-01'),
      other: ['Update dependencies', 'Update icons for tubi and Prime Video'],
    },
    {
      version: '2.31.0',
      date: new Date('2024-11-20'),
      features: ['Changelog: add dates to versions'],
      other: ['Update dependencies'],
    },
    {
      version: '2.30.8',
      date: new Date('2024-10-29'),
      other: ['Update icons for trakt and Renta'],
    },
    {
      version: '2.30.7',
      date: new Date('2024-10-03'),
      fixes: ['AniList: correctly handle repeating after recent changes'],
    },
    {
      version: '2.30.6',
      date: new Date('2024-08-22'),
      fixes: ['AniList: add new entries with correct status'],
    },
    {
      version: '2.30.5',
      date: new Date('2024-08-11'),
      other: ['Kitsu: domain changed from .io to .app'],
    },
    {
      version: '2.30.4',
      date: new Date('2024-08-11'),
      fixes: ['Handle MAL backend failures'],
    },
    {
      version: '2.30.3',
      date: new Date('2024-07-30'),
      other: ['Update dependencies', 'Update Logos for HIDIVE and Prime Video'],
    },
    {
      version: '2.30.2',
      date: new Date('2024-07-08'),
      features: ['Manga: add platform JNC Nina', 'Anime: add platform Anime Onegai'],
      other: ['Update dependencies', 'Update Logos for Crunchyroll and BiliBili'],
    },
    {
      version: '2.30.1',
      date: new Date('2024-07-08'),
      features: ['Bookshelf: keep todays simulpubs until 8am the next day'],
      other: ['Optimize CSS', 'Update dependencies'],
    },
    {
      version: '2.30.0',
      date: new Date('2024-05-11'),
      features: [
        'Scores: let user select how the score should be displayed',
        'Anime: remove defunct Spotify Links',
      ],
    },
    {
      version: '2.29.6',
      features: ['Anime: add link to Aniplaylist'],
      fixes: ['Baka-Manga: optimize automatch'],
      other: ['Minor layout optimizations'],
    },
    {
      version: '2.29.5',
      fixes: ['Settings: cannot change some switches', 'Shikimori: Not adding to list'],
    },
    {
      version: '2.29.4',
      fixes: [
        'App stuck after deleting entry',
        'Livechart: sync not correctly working',
        'Comments: cryptic comments coming when using Watchlist',
      ],
      other: ['Update Angular to 17'],
    },
    {
      version: '2.29.3',
      other: ['Manga: add platform J-Novel Club'],
    },
    {
      version: '2.29.2',
      fixes: [
        'Trakt: add rating for movies from details page, handle too many requests error',
        "Don't update finish date if there is already a date set",
      ],
      other: [
        'Manga: add logos for publishers comikey and panini',
        'Anime: deprecate funimation and wakanim',
      ],
    },
    {
      version: '2.29.1',
      fixes: ['Shikimori: Show actual Shikimori score instead of what they copy from MAL'],
    },
    {
      version: '2.29.0',
      features: [
        'Add support for Shikimori',
        'add support for comments - comments are now only used for additional information on MAL',
      ],
      fixes: ['Anisearch: re-add ID mapping for mangas'],
    },
    {
      version: '2.28.5',
      fixes: ['Manga: plus one volume sometimes not working'],
    },
    {
      version: '2.28.4',
      fixes: [
        'AniDB: disable proxy doe to rate limits',
        'MangaDex: handle maintenance and other downtime errors',
      ],
      other: ['Optimize dark mode', 'Update dependencies'],
    },
    {
      version: '2.28.3',
      fixes: ["Bookshelf: progress sometime doesn't sync to Anilist and Baka-Manga"],
    },
    {
      version: '2.28.2',
      fixes: ['Anisearch: remove search while it is not working'],
    },
    {
      version: '2.28.1',
      features: ['Watchlist: add option to hide shows', 'Watchlist: add date'],
      fixes: ['Notifications: optimize for Anilist rate limit problems'],
    },
    {
      version: '2.28.0',
      features: [
        'Anime details: add link to Anime-Planet entry',
        'Anime details: add expiration date to streaming tab (if available)',
        'Share links and text to MyAniLi (may need to reinstall the app)',
      ],
      fixes: ['Mangadex: request error', 'aniSearch: live action links'],
    },
    {
      version: '2.27.1',
      fixes: ['Anime: deleted are now also sent to trakt and livechart'],
    },
    {
      version: '2.27.0',
      features: [
        'Watchlist: show shows that were dropped today',
        "Watchlist: add option to hide shows that don't air this week",
        'Bookshelf: add simulpub/today section to bookshelf',
        'Manga details: add link to manga passion (German speaking only)',
      ],
      other: ['Clean up code'],
    },
    {
      version: '2.26.3',
      fixes: ['Anisearch: search not working with some special characters'],
    },
    {
      version: '2.26.2',
      fixes: ['Trakt: scrobble specials as season 0, not 1'],
    },
    {
      version: '2.26.1',
      features: [
        'Manga details: set rating using stars',
        'Watchlist: show shows that were completed today',
      ],
      other: ['Update dependencies', 'Adjust dark mode for Bootstrap 5.3'],
    },
    {
      version: '2.26.0',
      features: [
        'Manga details: add option to hide series on bookshelf',
        'Manga platforms: add MangaUP!, K MANGA, Azuki and Mangamo',
      ],
      fixes: ['Activities: disable text selection on links'],
      other: ['Update dependencies'],
    },
    {
      version: '2.25.1',
      fixes: ['LiveChart start date wrong'],
    },
    {
      version: '2.25.0',
      features: [
        'Add Link to aniDB entry from details page',
        'Add streaming platforms from LiveChart',
      ],
      fixes: ['optimize season changes in schedule and season overview'],
    },
    {
      version: '2.24.2',
      fixes: ['updates not going through to LiveChart'],
    },
    {
      version: '2.24.1',
      fixes: ['no longer need to store LiveChart credentials in local storage'],
    },
    {
      version: '2.24.0',
      features: [
        'Integrate MangaDex: Link to MangaDex entry from details page',
        'Chapter volume mapping using MangaDex',
      ],
      fixes: ['Add new LiveChart statuses', 'Link to user LiveChart library from settings'],
      other: [
        'Change status icons for watching and on hold',
        'Kitsu rating in percent',
        'Update dependencies',
      ],
    },
    {
      version: '2.23.0',
      features: [
        'Add skip button to remove a show from the watchlist for a week',
        'Add MAL rankings to details page',
      ],
      fixes: ['Anisearch ratings not always correct'],
    },
    {
      version: '2.22.2',
      fixes: [
        'Anisearch ratings not loading',
        'ANN search not working when title starts with "The"',
      ],
    },
    {
      version: '2.22.1',
      fixes: ['Fix watchlist sorting with different timezones'],
    },
    {
      version: '2.22.0',
      features: ['Add support for AnimeNewsNetwork', 'Get news from AnimeNewsNetwork'],
    },
    {
      version: '2.21.0',
      features: ['add support for Livechart.me accounts'],
      other: ['optimize app size'],
    },
    {
      version: '2.20.1',
      fixes: ['watchlist sorting on sundays'],
    },
    {
      version: '2.20.0',
      features: [
        'add timezone settings to watch time',
        'get series names from trakt cache',
        'lazy load search results',
      ],
      other: ['upgrade dependencies'],
    },
    {
      version: '2.19.0',
      features: ['add notifications from Anilist and Kitsu'],
      other: ['add ADN and AKIBA PASS TV to streaming platforms'],
    },
    {
      version: '2.18.1',
      fixes: ['handle trakt maintenance'],
    },
    {
      version: '2.18.0',
      features: [
        'Sort seasonal animes by popularity',
        'Add genres to season list view',
        'Add details on hover to season grid view',
      ],
    },
    {
      version: '2.17.3',
      fixes: ['Flickering when scrolled to the bottom and the viewport is resized'],
    },
    {
      version: '2.17.2',
      fixes: [
        "status won't update when closing the ratings popup",
        "start and finish date aren't visible in details after status changes",
      ],
    },
    {
      version: '2.17.1',
      fixes: ['new version is wrongly detected resulting in infinite reloads'],
    },
    {
      version: '2.17.0',
      features: ['start and finish date for series'],
    },
    {
      version: '2.16.1',
      fixes: ["Padding when bottom nav isn't hidden", 'anisearch relations not showing up'],
    },
    {
      version: '2.16.0',
      features: [
        'redesign: add bottom navigation bar',
        'redesign: headers for list views',
        'Link live action adaptions on anisearch',
      ],
      fixes: ['use mathematical average for manga-updates score instead of bayesian average'],
    },
    {
      version: '2.15.5',
      features: ['Add trakt ID cache'],
    },
    {
      version: '2.15.4',
      fixes: ["details page doesn't load if no cache present"],
    },
    {
      version: '2.15.3',
      features: ['grid view for mangas'],
    },
    {
      version: '2.15.2',
      fixes: ['Load all animes for bookshelf'],
    },
    {
      version: '2.15.1',
      fixes: ['Load all animes for studios'],
    },
    {
      version: '2.15.0',
      features: [
        'Load animes and mangas in my list in 50 items steps to optimize inital load times',
      ],
    },
    {
      version: '2.14.4',
      fixes: ['Remove discontinued Jikan v3 API calls'],
    },
    {
      version: '2.14.3',
      features: ['Add LiveChart.me ID cache'],
    },
    {
      version: '2.14.2',
      features: ['Hide dropped and deleted shows in trakt calendar and progress'],
    },
    {
      version: '2.14.1',
      fixes: ['Anisearch ratings not loading', 'Baka-Manga Login only visible after reload'],
    },
    {
      version: '2.14.0',
      features: [
        'Update Baka-Manga implementation. You can now connect your account to sync progress and ratings.',
      ],
      fixes: ['Watchlist sorting on sundays was wrong due to recent dependency changes.'],
    },
    {
      version: '2.13.1',
      other: ['optimize app to reduce size'],
    },
    {
      version: '2.13.0',
      features: [
        'Catch and inform about MAL maintenance',
        'show start date for upcoming anime in schedule',
      ],
      fixes: ['recently watched ongoing shows not listetd in watchlist'],
    },
    {
      version: '2.12.3',
      fixes: ['handle annict results without poster'],
    },
    {
      version: '2.12.2',
      fixes: ['aniverse icon missing'],
    },
    {
      version: '2.12.1',
      fixes: ['manga search on submit switched to anime'],
    },
    {
      version: '2.12.0',
      features: [
        'remodelled search bar and integrated quickadd into search bar',
        'add book publisher logos',
        'add restart button for on-hold book series',
      ],
      fixes: ['app prompt autofocus'],
    },
    {
      version: '2.11.3',
      fixes: ['new mangaupdates.com series id and url structure'],
    },
    {
      version: '2.11.2',
      fixes: ['manga characters'],
      other: ['Improve baka manga, kitsu and anisearch background search'],
    },
    {
      version: '2.11.1',
      fixes: ['no episode rule for movies and specials'],
    },
    {
      version: '2.11.0',
      features: ['3 episode rule'],
      other: ['styled implementation of system dialogues'],
    },
    {
      version: '2.10.2',
      fixes: ['footer margin'],
    },
    {
      version: '2.10.1',
      other: ['Add legal and privacy information'],
    },
    {
      version: '2.10.0',
      features: [
        'migrate from jikan v3 to v4',
        'redo links in characters and persons to grid layout',
      ],
      fixes: ['show other in changelog (if available)', 'website favicons never worked'],
      other: ['optimize caching'],
    },
    {
      version: '2.9.3',
      fixes: ['use input type "search" for searches', 'hide kitsu links when no kitsu ID is found'],
      other: ['cleanup code base', 'restructure grid layouts using css grid'],
    },
    {
      version: '2.9.2',
      features: ['add official website to anime details'],
    },
    {
      version: '2.9.1',
      fixes: ['re-add reading platform WEBTOON'],
    },
    {
      version: '2.9.0',
      features: [
        'add this changelog',
        'media type icons',
        'filter out hentai from season view and search results',
        'show related media as cards similar to recommendations',
      ],
      fixes: ['adjust modal border radius to updated design'],
    },
  ],
};

export interface Changelog {
  changes: Array<{
    version: Version;
    date?: Date;
    features?: string[];
    fixes?: string[];
    other?: string[];
  }>;
}

type Version = `${number}.${number}.${number}`;
