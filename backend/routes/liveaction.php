<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use App\Providers\BangumiServiceProvider as BangumiServiceProvider;
use App\Services\LiveactionResolver;
use Illuminate\Http\Request;

$router->group(['prefix' => 'liveaction'], function () use ($router) {
    $router->get('meta/{id:\d+}', function (int $id) {
        $meta = LiveactionResolver::getMeta($id);
        if (!$meta) {
            return response()->json(['error' => 'Not found'], 404);
        }
        return response()->json($meta);
    });

    /** English search (TMDB, Asian productions only) */
    $router->get('search', function (Request $request) {
        $query = trim((string) $request->input('query', ''));
        if (!$query) {
            return response()->json(['results' => [], 'more' => false]);
        }
        $page = max(1, min(50, intval($request->input('page', 1))));
        return response()->json(LiveactionResolver::searchLive($query, $page));
    });

    /** Bangumi subject of a TMDB entry, searched on Bangumi if not known yet */
    $router->get('resolve/{type:movie|tv}/{id:\d+}', function (string $type, int $id) {
        $bangumiId = LiveactionResolver::resolveTmdb($type, $id);
        if (!$bangumiId) {
            return response()->json(['error' => 'Not found'], 404);
        }
        return response()->json(['bangumiId' => $bangumiId]);
    });

    $router->get('tmdb/search/{type:movie|tv}', function (Request $request, string $type) {
        $query = trim((string) $request->input('query', ''));
        if (!$query) {
            return response()->json([]);
        }
        $year = intval($request->input('year', 0)) ?: null;
        return response()->json(LiveactionResolver::searchTmdb($type, $query, $year));
    });

    $router->get('tmdb/{type:movie|tv}/{id:\d+}', function (string $type, int $id) {
        $details = LiveactionResolver::tmdbDetails($type, $id);
        if (!$details) {
            return response()->json(['error' => 'Not found'], 404);
        }
        return response()->json($details);
    });

    /**
     * Manual Bangumi → TMDB mapping, shared by all users.
     * Requires a valid Bangumi access token to prevent anonymous vandalism.
     */
    $router->put('mapping/{id:\d+}', function (Request $request, int $id) {
        $authHeader = (string) $request->header('Authorization', '');
        if (!$authHeader) {
            return response()->json(['error' => 'No authorization header'], 401);
        }
        $userinfo = BangumiServiceProvider::getUserInfo($authHeader);
        $user = json_decode((string) $userinfo['body'], true);
        if ($userinfo['status'] !== 200 || empty($user['username'])) {
            return response()->json(['error' => 'Invalid Bangumi session'], 401);
        }
        LiveactionResolver::setMapping(
            $id,
            (string) $request->input('type', 'tv'),
            intval($request->input('tmdb', 0)) ?: null,
            intval($request->input('season', 1)),
            intval($request->input('anisearch', 0)) ?: null,
            LiveactionResolver::normalizeMdlSlug((string) $request->input('mdl', '')),
            $user['username']
        );
        return response()->json(LiveactionResolver::getMeta($id, true));
    });
});
