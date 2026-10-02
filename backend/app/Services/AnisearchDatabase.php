<?php

namespace App\Services;

/**
 * Local SQLite mirror of the aniSearch Database API bulk exports
 * (ratings and MyAnimeList mappings).
 *
 * The bulk endpoints may only be requested once per 24 hours without a token
 * (once per hour with a token), so the data is refreshed lazily on request
 * and shared by all users of this backend instance.
 *
 * @see https://api.anisearch.com/docs/api_database.html
 */
class AnisearchDatabase
{
    const API_URL = "https://api.anisearch.com/v1/";
    const TYPES = ['anime', 'manga'];

    /** Minimum age before a dataset is refreshed (seconds) */
    const MAX_AGE = 60 * 60 * 24;
    /** Wait after a failed refresh if no Retry-After is given (seconds) */
    const RETRY_DELAY = 60 * 60;

    private static ?\SQLite3 $db = null;

    public static function userAgent(): string
    {
        return env('ANISEARCH_USER_AGENT', 'MyAniLi/7.1 (https://myani.li; cs@infanf.de)');
    }

    /**
     * @return array{rank: int, score: int, member_count: int, rating_count: int}|null
     */
    public static function getRating(string $type, int $id): ?array
    {
        self::ensureFresh($type, 'ratings');
        $stmt = self::db()->prepare(
            "SELECT rank, score, member_count, rating_count FROM ratings WHERE type = :type AND id = :id"
        );
        $stmt->bindValue(':type', $type);
        $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
        $row = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
        return $row ?: null;
    }

    public static function getIdByMalId(string $type, int $malId): ?int
    {
        self::ensureFresh($type, 'associated');
        $stmt = self::db()->prepare(
            "SELECT anisearch_id FROM mal_mapping WHERE type = :type AND mal_id = :mal_id"
        );
        $stmt->bindValue(':type', $type);
        $stmt->bindValue(':mal_id', $malId, SQLITE3_INTEGER);
        $row = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
        return $row ? intval($row['anisearch_id']) : null;
    }

    /** Whether the dataset has been imported at least once */
    public static function hasData(string $type, string $dataset): bool
    {
        return self::getMeta("{$type}_{$dataset}_updated") > 0;
    }

    private static function dbPath(): string
    {
        return env('ANISEARCH_DB_PATH', '/dbs/anisearch.sqlite');
    }

    private static function db(): \SQLite3
    {
        if (self::$db) {
            return self::$db;
        }
        $db = new \SQLite3(self::dbPath());
        $db->busyTimeout(5000);
        $db->exec("PRAGMA journal_mode = WAL");
        $db->exec("CREATE TABLE IF NOT EXISTS ratings (
            type TEXT NOT NULL,
            id INTEGER NOT NULL,
            rank INTEGER NOT NULL,
            score INTEGER NOT NULL,
            member_count INTEGER NOT NULL,
            rating_count INTEGER NOT NULL,
            PRIMARY KEY (type, id)
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS mal_mapping (
            type TEXT NOT NULL,
            mal_id INTEGER NOT NULL,
            anisearch_id INTEGER NOT NULL,
            PRIMARY KEY (type, mal_id)
        )");
        $db->exec("CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value INTEGER NOT NULL)");
        return self::$db = $db;
    }

    private static function getMeta(string $key): int
    {
        $stmt = self::db()->prepare("SELECT value FROM meta WHERE key = :key");
        $stmt->bindValue(':key', $key);
        $row = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
        return $row ? intval($row['value']) : 0;
    }

    private static function setMeta(string $key, int $value): void
    {
        $stmt = self::db()->prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (:key, :value)");
        $stmt->bindValue(':key', $key);
        $stmt->bindValue(':value', $value, SQLITE3_INTEGER);
        $stmt->execute();
    }

    /**
     * Refreshes a dataset if it is outdated. Only one process refreshes at a
     * time; others keep serving the (possibly stale) data.
     */
    private static function ensureFresh(string $type, string $dataset): void
    {
        $key = "{$type}_{$dataset}";
        $now = time();
        if (self::getMeta("{$key}_updated") > $now - self::MAX_AGE) {
            return;
        }
        if (self::getMeta("{$key}_next_attempt") > $now) {
            return;
        }

        $lock = fopen(self::dbPath() . ".{$key}.lock", 'c');
        if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) {
            return;
        }
        try {
            // re-check: another process may have finished meanwhile
            if (
                self::getMeta("{$key}_updated") > time() - self::MAX_AGE
                || self::getMeta("{$key}_next_attempt") > time()
            ) {
                return;
            }
            // block further attempts until this one is done or the retry delay passed
            self::setMeta("{$key}_next_attempt", time() + self::RETRY_DELAY);

            $query = $dataset === 'associated' ? 'source=myanimelist_unique&gzip' : 'gzip';
            [$status, $data, $retryAfter] = self::download(self::API_URL . "{$type}/{$dataset}?{$query}");
            if ($status !== 200 || !is_array($data)) {
                error_log("aniSearch: refreshing {$key} failed with HTTP {$status}");
                if ($retryAfter) {
                    self::setMeta("{$key}_next_attempt", time() + $retryAfter);
                }
                return;
            }

            $dataset === 'associated' ? self::importMapping($type, $data) : self::importRatings($type, $data);
            self::setMeta("{$key}_updated", time());
            self::setMeta("{$key}_next_attempt", 0);
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    /**
     * @return array{0: int, 1: mixed, 2: int} HTTP status, decoded JSON, Retry-After seconds
     */
    private static function download(string $url): array
    {
        $headers = [];
        $token = env('ANISEARCH_API_TOKEN');
        if ($token) {
            $headers[] = "Authorization: Bearer {$token}";
        }
        $retryAfter = 0;
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERAGENT      => self::userAgent(),
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_TIMEOUT        => 60,
            CURLOPT_HEADERFUNCTION => function ($ch, $header) use (&$retryAfter) {
                if (stripos($header, 'Retry-After:') === 0) {
                    $retryAfter = intval(trim(substr($header, 12)));
                }
                return strlen($header);
            },
        ]);
        $body = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if (!is_string($body)) {
            return [0, null, 0];
        }
        // ?gzip returns a gzip file, error responses remain plain JSON
        if (str_starts_with($body, "\x1f\x8b")) {
            $body = gzdecode($body);
        }
        return [$status, json_decode($body, true), $retryAfter];
    }

    private static function importRatings(string $type, array $data): void
    {
        $db = self::db();
        $db->exec("BEGIN");
        try {
            $delete = $db->prepare("DELETE FROM ratings WHERE type = :type");
            $delete->bindValue(':type', $type);
            $delete->execute();
            $stmt = $db->prepare(
                "INSERT INTO ratings (type, id, rank, score, member_count, rating_count)
                VALUES (:type, :id, :rank, :score, :member_count, :rating_count)"
            );
            foreach ($data as $id => $rating) {
                $stmt->bindValue(':type', $type);
                $stmt->bindValue(':id', intval($id), SQLITE3_INTEGER);
                $stmt->bindValue(':rank', intval($rating['rank'] ?? 0), SQLITE3_INTEGER);
                $stmt->bindValue(':score', intval($rating['score'] ?? 0), SQLITE3_INTEGER);
                $stmt->bindValue(':member_count', intval($rating['member_count'] ?? 0), SQLITE3_INTEGER);
                $stmt->bindValue(':rating_count', intval($rating['rating_count'] ?? 0), SQLITE3_INTEGER);
                $stmt->execute();
                $stmt->reset();
            }
            $db->exec("COMMIT");
        } catch (\Throwable $e) {
            $db->exec("ROLLBACK");
            throw $e;
        }
    }

    private static function importMapping(string $type, array $data): void
    {
        $db = self::db();
        $db->exec("BEGIN");
        try {
            $delete = $db->prepare("DELETE FROM mal_mapping WHERE type = :type");
            $delete->bindValue(':type', $type);
            $delete->execute();
            $stmt = $db->prepare(
                "INSERT INTO mal_mapping (type, mal_id, anisearch_id) VALUES (:type, :mal_id, :anisearch_id)"
            );
            foreach ($data as $malId => $entry) {
                if (empty($entry['id'])) {
                    continue;
                }
                $stmt->bindValue(':type', $type);
                $stmt->bindValue(':mal_id', intval($malId), SQLITE3_INTEGER);
                $stmt->bindValue(':anisearch_id', intval($entry['id']), SQLITE3_INTEGER);
                $stmt->execute();
                $stmt->reset();
            }
            $db->exec("COMMIT");
        } catch (\Throwable $e) {
            $db->exec("ROLLBACK");
            throw $e;
        }
    }
}
