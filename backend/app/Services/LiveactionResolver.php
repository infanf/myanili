<?php

namespace App\Services;

use App\Providers\AnisearchServiceProvider;

/**
 * Resolves Bangumi live action subjects (subject_type 6) to English metadata
 * from TMDB, since Bangumi itself only offers Chinese/original language data.
 *
 * Resolution order:
 *  1. Manual mapping (set by a logged in Bangumi user)
 *  2. IMDb ID from the Bangumi infobox → TMDB /find
 *  3. TMDB title search (original title, then Chinese title) + year
 *
 * Results are cached in SQLite and shared by all users of this backend.
 */
class LiveactionResolver
{
    const BANGUMI_URL = "https://api.bgm.tv";
    const TMDB_URL = "https://api.themoviedb.org/3";
    const TRAKT_URL = "https://api.trakt.tv";
    const SIMKL_URL = "https://api.simkl.com";
    const USER_AGENT = "myanili/2.0 (https://github.com/infanf/myanili)";

    /** Cache lifetime of resolved metadata (seconds) */
    const MAX_AGE = 60 * 60 * 24 * 7;
    /** Cache lifetime of unresolved subjects (seconds) */
    const MISS_AGE = 60 * 60 * 24;

    /** Bump when the format of the resolved data changes, to re-resolve cached entries */
    const CACHE_VERSION = 5;

    /** Bangumi platform names of movies */
    const MOVIE_PLATFORMS = ['电影'];

    private static ?\SQLite3 $db = null;

    /** Whether an external request failed (e.g. invalid key) while resolving */
    private static bool $requestFailed = false;

    public static function getMeta(int $bangumiId, bool $refresh = false): ?array
    {
        $mapping = self::getMapping($bangumiId);
        $cached = $refresh ? null : self::getCached($bangumiId);
        if ($cached && (!$mapping || $cached['mapping_updated'] >= $mapping['updated'])) {
            return $cached['data'];
        }

        self::$requestFailed = false;
        $subject = self::bangumi("/v0/subjects/$bangumiId");
        if (!$subject || ($subject['type'] ?? 0) !== 6) {
            return null;
        }

        $tmdb = null;
        if ($mapping && $mapping['tmdb_id']) {
            $tmdb = ['type' => $mapping['tmdb_type'], 'id' => $mapping['tmdb_id']];
        }
        $imdbId = self::infobox($subject, 'imdb_id');
        if (!$tmdb && $imdbId) {
            $tmdb = self::findByImdb($imdbId);
        }
        if (!$tmdb) {
            $tmdb = self::search($subject);
        }

        $data = [
            'bangumiId' => $bangumiId,
            'mediaType' => self::isMovie($subject) ? 'movie' : 'tv',
            'season' => $mapping ? intval($mapping['season']) : 1,
            'source' => $mapping && $mapping['tmdb_id'] ? 'manual' : ($tmdb ? 'auto' : 'none'),
            'imdb' => $imdbId ?: null,
        ];
        if ($tmdb) {
            $data = array_merge($data, self::tmdbDetails($tmdb['type'], $tmdb['id']) ?? []);
            $data['mediaType'] = $tmdb['type'];
        }

        if ($data['tmdb'] ?? $data['imdb']) {
            $data['trakt'] = self::traktSlug($data);
            $simkl = self::simkl($data);
            $data['simkl'] = $simkl['simkl'];
            $data['mdl'] = $simkl['mdl'];
        }
        if (!empty($mapping['mdl_slug'])) {
            $data['mdl'] = $mapping['mdl_slug'];
        }
        $data['anisearch'] = !empty($mapping['anisearch_id'])
            ? intval($mapping['anisearch_id'])
            : (($data['imdb'] ? AnisearchDatabase::getMovieIdByExternalId($data['imdb']) : null)
                ?? self::searchAnisearch($subject, $data));

        // Don't cache results of failing services, they would hide the data for a day
        if (!self::$requestFailed) {
            self::setCached($bangumiId, $data, $mapping['updated'] ?? 0);
        }
        return $data;
    }

    /**
     * Store a manual TMDB/aniSearch/MyDramaList mapping for a Bangumi subject.
     * Without any ID the mapping is removed.
     */
    public static function setMapping(
        int $bangumiId,
        ?string $type,
        ?int $tmdbId,
        int $season,
        ?int $anisearchId,
        ?string $mdlSlug,
        string $user
    ): void {
        if (!$tmdbId && !$anisearchId && !$mdlSlug) {
            $stmt = self::db()->prepare("DELETE FROM mapping WHERE bangumi_id = :id");
            $stmt->bindValue(':id', $bangumiId, SQLITE3_INTEGER);
            $stmt->execute();
            return;
        }
        $stmt = self::db()->prepare(
            "INSERT OR REPLACE INTO mapping (bangumi_id, tmdb_type, tmdb_id, season, anisearch_id, mdl_slug, user, updated)
            VALUES (:id, :type, :tmdb, :season, :anisearch, :mdl, :user, :updated)"
        );
        $stmt->bindValue(':id', $bangumiId, SQLITE3_INTEGER);
        $stmt->bindValue(':type', $type === 'movie' ? 'movie' : 'tv');
        $stmt->bindValue(':tmdb', $tmdbId ?: 0, SQLITE3_INTEGER);
        $stmt->bindValue(':season', max(1, $season), SQLITE3_INTEGER);
        $stmt->bindValue(':anisearch', $anisearchId, $anisearchId ? SQLITE3_INTEGER : SQLITE3_NULL);
        $stmt->bindValue(':mdl', $mdlSlug, $mdlSlug ? SQLITE3_TEXT : SQLITE3_NULL);
        $stmt->bindValue(':user', $user);
        $stmt->bindValue(':updated', time(), SQLITE3_INTEGER);
        $stmt->execute();
    }

    /**
     * MyDramaList slug ("705723-strange-lawyer-woo-young-woo") from a slug,
     * an ID or a pasted mydramalist.com URL
     */
    public static function normalizeMdlSlug(string $input): ?string
    {
        $input = trim($input);
        if (preg_match('#^(?:https?://)?(?:www\.)?mydramalist\.com/(\d+(?:-[\w-]+)?)#i', $input, $matches)) {
            return $matches[1];
        }
        return preg_match('/^\d+(-[\w-]+)?$/', $input) ? $input : null;
    }

    public static function searchTmdb(string $type, string $query, ?int $year = null): array
    {
        $type = $type === 'movie' ? 'movie' : 'tv';
        $params = ['query' => $query, 'language' => 'en-US'];
        if ($year) {
            $params[$type === 'movie' ? 'primary_release_year' : 'first_air_date_year'] = $year;
        }
        $result = self::tmdb("/search/$type", $params);
        return array_map(fn($item) => self::mapTmdbItem($type, $item), $result['results'] ?? []);
    }

    public static function tmdbDetails(string $type, int $id): ?array
    {
        $type = $type === 'movie' ? 'movie' : 'tv';
        $item = self::tmdb("/$type/$id", ['language' => 'en-US', 'append_to_response' => 'external_ids']);
        if (!$item || !isset($item['id'])) {
            return null;
        }
        $data = self::mapTmdbItem($type, $item);
        $data['imdb'] = $item['imdb_id'] ?? $item['external_ids']['imdb_id'] ?? null;
        $data['tvdb'] = $item['external_ids']['tvdb_id'] ?? null;
        $data['genres'] = array_map(fn($genre) => $genre['name'], $item['genres'] ?? []);
        // TMDB user score on a 0–10 scale; for TV shows it covers all seasons
        $data['rating'] = isset($item['vote_average']) ? floatval($item['vote_average']) : null;
        $data['votes'] = intval($item['vote_count'] ?? 0);
        if ($type === 'tv') {
            $data['seasons'] = array_values(array_map(fn($season) => [
                'number' => $season['season_number'],
                'episodes' => $season['episode_count'],
                'name' => $season['name'],
            ], array_filter($item['seasons'] ?? [], fn($season) => $season['season_number'] > 0)));
        }
        return $data;
    }

    private static function mapTmdbItem(string $type, array $item): array
    {
        $date = $item['release_date'] ?? $item['first_air_date'] ?? '';
        return [
            'tmdb' => $item['id'],
            'mediaType' => $type,
            'title' => $item['title'] ?? $item['name'] ?? null,
            'originalTitle' => $item['original_title'] ?? $item['original_name'] ?? null,
            'overview' => $item['overview'] ?? null,
            'poster' => !empty($item['poster_path']) ? "https://image.tmdb.org/t/p/w500" . $item['poster_path'] : null,
            'backdrop' => !empty($item['backdrop_path']) ? "https://image.tmdb.org/t/p/w1280" . $item['backdrop_path'] : null,
            'year' => $date ? intval(substr($date, 0, 4)) : null,
        ];
    }

    /**
     * aniSearch live action ID via aniSearch's quick search. A hit must match
     * the year (±1) and movie/series; the episode count breaks ties.
     * aniSearch only finds exact titles, so parts of a combined original title
     * ("進撃の巨人 ATTACK ON TITAN 反撃の狼煙") are tried last, with a stricter
     * match (same year, and same episode count if known).
     */
    private static function searchAnisearch(array $subject, array $data): ?int
    {
        $year = intval(substr($subject['date'] ?? '', 0, 4)) ?: intval($data['year'] ?? 0);
        if (!$year) {
            return null;
        }
        $isMovie = $data['mediaType'] === 'movie';
        $episodes = intval($subject['total_episodes'] ?? $subject['eps'] ?? 0);
        $name = trim($subject['name'] ?? '');
        $parts = preg_split('/\s+/u', $name);
        $queries = [];
        foreach ([$name, $data['title'] ?? ''] as $query) {
            $queries[$query] = false;
        }
        if (count($parts) > 1) {
            foreach ([end($parts), $parts[0]] as $part) {
                $queries[$part] ??= true;
            }
        }
        foreach ($queries as $query => $strict) {
            if (mb_strlen($query) < 2) {
                continue;
            }
            $candidates = array_filter(
                AnisearchServiceProvider::searchMovies($query),
                fn($movie) => $movie['year'] && abs($movie['year'] - $year) <= ($strict ? 0 : 1)
                    && (stripos($movie['type'], 'movie') !== false) === $isMovie
                    && (!$strict || !$episodes || $movie['episodes'] === $episodes)
            );
            if (!$candidates) {
                continue;
            }
            usort($candidates, fn($a, $b) => self::anisearchScore($b, $year, $episodes)
                <=> self::anisearchScore($a, $year, $episodes));
            return $candidates[0]['id'];
        }
        return null;
    }

    private static function anisearchScore(array $movie, int $year, int $episodes): int
    {
        return ($movie['year'] === $year ? 2 : 0)
            + ($episodes && $movie['episodes'] === $episodes ? 1 : 0);
    }

    /** Trakt slug, looked up with the app's client ID so it works without user login */
    private static function traktSlug(array $data): ?string
    {
        $type = $data['mediaType'] === 'movie' ? 'movie' : 'show';
        $path = !empty($data['tmdb']) ? "/search/tmdb/{$data['tmdb']}" : "/search/imdb/{$data['imdb']}";
        $result = self::request(self::TRAKT_URL . "$path?type=$type", [
            'Content-Type: application/json',
            'trakt-api-version: 2',
            'trakt-api-key: ' . env('TRAKT_CLIENT_ID'),
        ]);
        if ($result === null) {
            self::$requestFailed = true;
            return null;
        }
        $ids = $result[0][$type]['ids'] ?? null;
        return $ids['slug'] ?? (isset($ids['trakt']) ? strval($ids['trakt']) : null);
    }

    /**
     * SIMKL ID and MyDramaList slug, looked up with the app's client ID so it
     * works without user login. SIMKL knows the MyDramaList mapping, which
     * has no public API (yet).
     *
     * @return array{simkl: ?int, mdl: ?string}
     */
    private static function simkl(array $data): array
    {
        $params = ['client_id' => env('SIMKL_CLIENT_ID')];
        if (!empty($data['tmdb'])) {
            $params['tmdb'] = $data['tmdb'];
            $params['type'] = $data['mediaType'] === 'movie' ? 'movie' : 'show';
        } else {
            $params['imdb'] = $data['imdb'];
        }
        $result = self::request(self::SIMKL_URL . '/search/id?' . http_build_query($params), ['Accept: application/json']);
        if ($result === null) {
            self::$requestFailed = true;
            return ['simkl' => null, 'mdl' => null];
        }
        $id = intval($result[0]['ids']['simkl'] ?? 0);
        if (!$id) {
            return ['simkl' => null, 'mdl' => null];
        }
        $path = $data['mediaType'] === 'movie' ? 'movies' : 'tv';
        $details = self::request(
            self::SIMKL_URL . "/$path/$id?" . http_build_query(['client_id' => env('SIMKL_CLIENT_ID')]),
            ['Accept: application/json']
        );
        return ['simkl' => $id, 'mdl' => $details['ids']['mdlslug'] ?? null];
    }

    private static function findByImdb(string $imdbId): ?array
    {
        $result = self::tmdb("/find/$imdbId", ['external_source' => 'imdb_id']);
        if (!empty($result['movie_results'])) {
            return ['type' => 'movie', 'id' => $result['movie_results'][0]['id']];
        }
        if (!empty($result['tv_results'])) {
            return ['type' => 'tv', 'id' => $result['tv_results'][0]['id']];
        }
        return null;
    }

    private static function search(array $subject): ?array
    {
        $type = self::isMovie($subject) ? 'movie' : 'tv';
        $year = !empty($subject['date']) ? intval(substr($subject['date'], 0, 4)) : null;
        $queries = array_unique(array_filter([$subject['name'] ?? '', $subject['name_cn'] ?? '']));
        foreach ($queries as $query) {
            $results = self::searchTmdb($type, $query, $year);
            if (!$results && $year) {
                // Air dates on Bangumi and TMDB may differ by a year around new year
                $results = array_filter(
                    self::searchTmdb($type, $query),
                    fn($item) => $item['year'] && abs($item['year'] - $year) <= 1
                );
            }
            if ($results) {
                $exact = array_filter($results, fn($item) => $item['originalTitle'] === $query);
                $match = $exact ? reset($exact) : reset($results);
                return ['type' => $type, 'id' => $match['tmdb']];
            }
        }
        return null;
    }

    private static function isMovie(array $subject): bool
    {
        return in_array($subject['platform'] ?? '', self::MOVIE_PLATFORMS, true);
    }

    private static function infobox(array $subject, string $key): ?string
    {
        foreach ($subject['infobox'] ?? [] as $item) {
            if (strtolower($item['key'] ?? '') === $key && is_string($item['value'])) {
                return trim($item['value']);
            }
        }
        return null;
    }

    private static function bangumi(string $path): ?array
    {
        return self::request(self::BANGUMI_URL . $path, ['Accept: application/json']);
    }

    private static function tmdb(string $path, array $params = []): ?array
    {
        $params['api_key'] = env('TMDB_API_KEY');
        $result = self::request(self::TMDB_URL . $path . '?' . http_build_query($params), ['Accept: application/json']);
        if ($result === null) {
            self::$requestFailed = true;
        }
        return $result;
    }

    private static function request(string $url, array $headers = [], int $retries = 2): ?array
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERAGENT => self::USER_AGENT,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 15,
        ]);
        $response = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        // Bangumi intermittently answers with 5xx behind Cloudflare
        if (($response === false || $status >= 500) && $retries > 0) {
            usleep(500000);
            return self::request($url, $headers, $retries - 1);
        }
        if ($response === false || $status >= 400) {
            return null;
        }
        return json_decode($response, true);
    }

    private static function getMapping(int $bangumiId): ?array
    {
        $stmt = self::db()->prepare("SELECT * FROM mapping WHERE bangumi_id = :id");
        $stmt->bindValue(':id', $bangumiId, SQLITE3_INTEGER);
        $row = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
        return $row ?: null;
    }

    private static function getCached(int $bangumiId): ?array
    {
        $stmt = self::db()->prepare("SELECT data, updated, mapping_updated FROM meta WHERE bangumi_id = :id");
        $stmt->bindValue(':id', $bangumiId, SQLITE3_INTEGER);
        $row = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
        if (!$row) {
            return null;
        }
        $data = json_decode($row['data'], true);
        if (($data['version'] ?? 0) !== self::CACHE_VERSION) {
            return null;
        }
        $maxAge = ($data['source'] ?? 'none') === 'none' ? self::MISS_AGE : self::MAX_AGE;
        if (time() - $row['updated'] > $maxAge) {
            return null;
        }
        return ['data' => $data, 'mapping_updated' => intval($row['mapping_updated'])];
    }

    private static function setCached(int $bangumiId, array $data, int $mappingUpdated): void
    {
        $stmt = self::db()->prepare(
            "INSERT OR REPLACE INTO meta (bangumi_id, data, updated, mapping_updated)
            VALUES (:id, :data, :updated, :mapping_updated)"
        );
        $stmt->bindValue(':id', $bangumiId, SQLITE3_INTEGER);
        $stmt->bindValue(':data', json_encode(['version' => self::CACHE_VERSION] + $data));
        $stmt->bindValue(':updated', time(), SQLITE3_INTEGER);
        $stmt->bindValue(':mapping_updated', $mappingUpdated, SQLITE3_INTEGER);
        $stmt->execute();
    }

    private static function db(): \SQLite3
    {
        if (self::$db) {
            return self::$db;
        }
        $db = new \SQLite3(env('LIVEACTION_DB_PATH', '/dbs/liveaction.sqlite'));
        $db->busyTimeout(5000);
        $db->exec("PRAGMA journal_mode = WAL");
        $db->exec("CREATE TABLE IF NOT EXISTS meta (
            bangumi_id INTEGER PRIMARY KEY,
            data TEXT NOT NULL,
            updated INTEGER NOT NULL,
            mapping_updated INTEGER NOT NULL DEFAULT 0
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS mapping (
            bangumi_id INTEGER PRIMARY KEY,
            tmdb_type TEXT NOT NULL,
            tmdb_id INTEGER NOT NULL,
            season INTEGER NOT NULL DEFAULT 1,
            anisearch_id INTEGER,
            mdl_slug TEXT,
            user TEXT NOT NULL,
            updated INTEGER NOT NULL
        )");
        // Cleanup of the removed English search (TMDB): its automatic TMDB → Bangumi
        // resolutions were unreliable, so drop them and the metadata built from them
        $exists = $db->querySingle("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tmdb_bangumi'");
        if ($exists) {
            $db->exec("DELETE FROM meta WHERE bangumi_id IN (SELECT bangumi_id FROM tmdb_bangumi WHERE bangumi_id > 0)");
            $db->exec("DROP TABLE tmdb_bangumi");
        }
        $columns = [];
        $result = $db->query("PRAGMA table_info(mapping)");
        while ($column = $result->fetchArray(SQLITE3_ASSOC)) {
            $columns[] = $column['name'];
        }
        foreach (['anisearch_id' => 'INTEGER', 'mdl_slug' => 'TEXT'] as $column => $type) {
            if (!in_array($column, $columns, true)) {
                $db->exec("ALTER TABLE mapping ADD COLUMN $column $type");
            }
        }
        self::$db = $db;
        return $db;
    }
}
