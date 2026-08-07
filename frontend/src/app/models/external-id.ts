/**
 * Helpers to normalize manually entered external IDs. Users often paste a whole
 * URL instead of the bare ID, so every provider knows how to extract its ID
 * from a link.
 */

export type ExternalIdProvider =
  | 'anilist'
  | 'ann'
  | 'anisearch'
  | 'annict'
  | 'baka'
  | 'bangumi'
  | 'fandom'
  | 'kitsu'
  | 'livechart'
  | 'mangabaka'
  | 'mangadex'
  | 'simkl'
  | 'trakt';

type Extractor = (value: string) => string | undefined;

const NUMERIC = /^\d+$/;

const extractors: { [provider in ExternalIdProvider]: Extractor } = {
  anilist: value => match(value, /anilist\.co\/[a-z]+\/(\d+)/i),
  ann: value => match(value, /animenewsnetwork\.com\/encyclopedia\/[a-z]+\.php\?id=(\d+)/i),
  // aniSearch uses <id>,<slug> in the path
  anisearch: value => match(value, /anisearch\.[a-z.]+\/[a-z]+\/(\d+)/i),
  annict: value => match(value, /annict\.[a-z]+\/works\/(\d+)/i),
  baka: value =>
    // legacy series.html?id=<number> and current /series/<base36>/<slug>
    match(value, /mangaupdates\.com\/series\.html\?id=(\d+)/i) ||
    match(value, /mangaupdates\.com\/series\/([0-9a-z]+)/i),
  bangumi: value => match(value, /(?:bgm\.tv|bangumi\.tv|chii\.in)\/subject\/(\d+)/i),
  fandom: extractHost,
  kitsu: value => match(value, /kitsu\.(?:app|io)\/[a-z]+\/([\w-]+)/i),
  livechart: value => match(value, /livechart\.me\/anime\/(\d+)/i),
  mangabaka: value => match(value, /mangabaka\.(?:org|dev)\/(?:series\/)?(\d+)/i),
  mangadex: value => match(value, /mangadex\.org\/title\/([0-9a-f-]{36})/i),
  simkl: value => match(value, /simkl\.[a-z]+\/[a-z]+\/(\d+)/i),
  trakt: value => match(value, /trakt\.tv\/(?:shows|movies)\/([\w-]+)/i),
};

/** Providers whose IDs are stored as numbers in the extension. */
const numericProviders: ExternalIdProvider[] = [
  'anilist',
  'ann',
  'anisearch',
  'annict',
  'baka',
  'bangumi',
  'kitsu',
  'livechart',
  'mangabaka',
  'simkl',
];

/** Extension properties that hold an external ID, mapped to their provider. */
const extensionProviders: { [property: string]: ExternalIdProvider } = {
  anilistId: 'anilist',
  anisearchId: 'anisearch',
  annId: 'ann',
  annictId: 'annict',
  bakaId: 'baka',
  bangumiId: 'bangumi',
  fandomSlug: 'fandom',
  livechartId: 'livechart',
  mangabakaId: 'mangabaka',
  mdId: 'mangadex',
  simklId: 'simkl',
  trakt: 'trakt',
};

function match(value: string, regex: RegExp): string | undefined {
  return regex.exec(value)?.[1];
}

function isLink(value: string): boolean {
  return value.includes('/') || value.includes('://');
}

/** Reduces a pasted wiki link to its host, which is what fandomSlug expects. */
function extractHost(value: string): string | undefined {
  const host = match(value, /^(?:https?:)?\/\/([^/?#]+)/i) || match(value, /^([^/?#]+\.[^/?#]+)\//);
  if (!host) return undefined;
  const fandom = /^(.+)\.fandom\.com$/i.exec(host);
  return fandom?.[1] || host;
}

/**
 * Turns whatever the user entered into a plain ID: extracts the ID from a
 * pasted link and coerces numeric IDs to numbers. Returns the trimmed input
 * unchanged if nothing can be extracted, so no input is silently lost.
 */
export function normalizeExternalId(
  provider: ExternalIdProvider,
  value: string | number | null | undefined,
): string | number | null | undefined {
  if (value === null || value === undefined || value === '') return value;
  const trimmed = String(value).trim();
  if (!trimmed) return value;

  const extracted = isLink(trimmed) ? extractors[provider](trimmed) : trimmed;
  if (!extracted) return trimmed;

  if (numericProviders.includes(provider) && NUMERIC.test(extracted)) {
    return Number(extracted);
  }
  return extracted;
}

/**
 * Normalizes all external IDs of an anime/manga extension in place, so pasted
 * links are cleaned up on submit even if the input never lost focus.
 */
export function normalizeExtensionIds(extension?: object): void {
  if (!extension) return;
  const values = extension as { [property: string]: unknown };

  for (const [property, provider] of Object.entries(extensionProviders)) {
    const value = values[property];
    if (typeof value !== 'string' && typeof value !== 'number') continue;
    values[property] = normalizeExternalId(provider, value);
  }

  const kitsu = values['kitsuId'] as { kitsuId?: unknown } | undefined;
  if (kitsu && (typeof kitsu.kitsuId === 'string' || typeof kitsu.kitsuId === 'number')) {
    kitsu.kitsuId = normalizeExternalId('kitsu', kitsu.kitsuId);
  }
}
