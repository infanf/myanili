<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use App\Providers\MalServiceProvider as MalServiceProvider;
use Illuminate\Http\Request;

$router->group(['prefix' => 'mal'], function () use ($router) {

    $router->get('auth', function () {
        $code_verifier = isset($_SESSION['verifier']) ? $_SESSION['verifier'] : rtrim(strtr(base64_encode(random_bytes(64)), "+/", "-_"), "=");
        $_SESSION['verifier'] = $code_verifier;
        $provider = MalServiceProvider::getOauthProvider();
        if (!isset($_GET['code'])) {
            $authorizationUrl = $provider->getAuthorizationUrl([
                "code_challenge" => $code_verifier,
                'grant_type' => 'authorization_code',
            ]);
            $_SESSION['oauth2state'] = $provider->getState();
            header('Location: ' . $authorizationUrl);
            exit;

            // Check given state against previously stored one to mitigate CSRF attack
        } elseif (empty($_GET['state']) || (isset($_SESSION['oauth2state']) && $_GET['state'] !== $_SESSION['oauth2state'])) {

            if (isset($_SESSION['oauth2state'])) {
                unset($_SESSION['oauth2state']);
            }

            exit('Invalid state');

        } else {
            try {
                $accessToken = $provider->getAccessToken('authorization_code', [
                    'code' => $_GET['code'],
                    'grant_type' => 'authorization_code',
                    'code_verifier' => $code_verifier,
                ]);

                setcookie('MAL_ACCESS_TOKEN', $accessToken->getToken(), $accessToken->getExpires());
                setcookie('MAL_REFRESH_TOKEN', $accessToken->getRefreshToken(), $accessToken->getExpires() + (30 * 24 * 60 * 60));
                $javascript = "";
                foreach (explode(',', env('APP_CLIENT')) as $opener) {
                    $javascript .= <<<JAVASCRIPT
                    window.opener.postMessage(true, "$opener");
JAVASCRIPT;
                }

                return "<script>$javascript</script>";
            } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {

                // Failed to get the access token or user details.
                return ($e->getMessage());
            }
        }
    });

    $router->get('list', function (Request $request) {
        $limit = $request->input('limit', 50);
        $offset = $request->input('offset', 0);
        $sort = $request->input('sort', 'list_updated_at');
        return MalServiceProvider::getMyList(null, $limit, $offset, $sort);
    });

    $router->get('list/{status}', function ($status, Request $request) {
        $limit = $request->input('limit', 50);
        $offset = $request->input('offset', 0);
        $sort = $request->input('sort', 'list_updated_at');
        return MalServiceProvider::getMyList($status, $limit, $offset, $sort);
    });

    $router->get('mangalist', function (Request $request) {
        $limit = $request->input('limit', 50);
        $offset = $request->input('offset', 0);
        return MalServiceProvider::getMyMangaList(null, $limit, $offset);
    });

    $router->get('mangalist/{status}', function ($status, Request $request) {
        $limit = $request->input('limit', 50);
        $offset = $request->input('offset', 0);
        return MalServiceProvider::getMyMangaList($status, $limit, $offset);
    });

    $router->get('animes', function (Request $request) {
        $params = $request->all();
        if (isset($params['query'])) {
            return MalServiceProvider::getList('anime', $params['query'], $params['limit'] ?? 50, $params['offset'] ?? 0);
        }
        return [];
    });

    $router->get('anime/{id}', function ($id) {
        return MalServiceProvider::getAnimeDetails($id);
    });

    $router->put('anime/{id}', function ($id, Request $request) {
        return MalServiceProvider::putMediaDetails($id, 'anime', $request);
    });

    $router->delete('anime/{id}', function ($id, Request $request) {
        return MalServiceProvider::deleteMediaFromList($id, 'anime');
    });

    $router->post('song/{id}', function ($id, Request $request) {
        $params = $request->toArray();
        $filename = dirname(__DIR__) . '/resources/songs.json';
        try {
            $songsArray = filesize($filename) ? json_decode(file_get_contents($filename), true) : [];
            if (isset($params['spotify'])) {
                $songsArray[intval($id)] = $params['spotify'];
                ksort($songsArray);
                file_put_contents($filename, json_encode($songsArray));
            }
        } catch (Exception $e) {
        }
    });

    $router->get('mangas', function (Request $request) {
        $params = $request->all();
        if (isset($params['query'])) {
            return MalServiceProvider::getList('manga', $params['query'], $params['limit'] ?? 50, $params['offset'] ?? 0);
        }
        return [];
    });

    $router->get('manga/{id}', function ($id) {
        return MalServiceProvider::getMangaDetails($id);
    });

    $router->put('manga/{id}', function ($id, Request $request) {
        return MalServiceProvider::putMediaDetails($id, 'manga', $request);
    });

    $router->delete('manga/{id}', function ($id, Request $request) {
        return MalServiceProvider::deleteMediaFromList($id, 'manga');
    });

    $router->get('animes/season/{year}/{season}', function (int $year, int $season) {
        return MalServiceProvider::getListSeason($year, $season);
    });

    $router->get('me', function () {
        $provider = MalServiceProvider::getOauthProvider();
        if (!isset($_COOKIE['MAL_ACCESS_TOKEN']) && isset($_COOKIE['MAL_REFRESH_TOKEN'])) {
            try {
                $accessToken = $provider->getAccessToken('refresh_token', [
                    'refresh_token' => $_COOKIE['MAL_REFRESH_TOKEN'],
                ]);

                setcookie('MAL_ACCESS_TOKEN', $accessToken->getToken(), $accessToken->getExpires());
                $_COOKIE['MAL_ACCESS_TOKEN'] = $accessToken->getToken();
                setcookie('MAL_REFRESH_TOKEN', $accessToken->getRefreshToken(), $accessToken->getExpires() + (30 * 24 * 60 * 60));
            } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {

                // Failed to get the access token or user details.
                return ($e->getMessage());
            }
        }

        return MalServiceProvider::getMe();
    });

    $router->get('logoff', function () {
        // remove all session variables and cookies
        session_unset();
        setcookie('MAL_ACCESS_TOKEN', '', time() - 3600, "/");
        unset($_COOKIE['MAL_ACCESS_TOKEN']);
        setcookie('MAL_REFRESH_TOKEN', '', time() - 3600, "/");
        unset($_COOKIE['MAL_REFRESH_TOKEN']);
        return ['success' => true];
    });

    $router->get('animes/season/{year}/{season}/songs', function (int $year, int $season) {
        function theme($themeNode)
        {
            return $themeNode['text'];
        }
        $season = MalServiceProvider::getListSeason($year, $season);
        $animes = [];
        foreach ($season as $node) {
            $anime = $node['node'];
            if (!isset($anime['my_list_status'])) {
                continue;
            }

            $details = MalServiceProvider::getAnimeDetails($anime['id']);
            $extras = [];
            try {
                $extras = json_decode(base64_decode($details['my_list_status']['comments']), true);
            } catch (Exception $e) {
            }
            $day = '';
            if (isset($extras['simulDay'])) {
                if (gettype($extras['simulDay']) == 'integer') {
                    $day = (($extras['simulDay']) + 6) % 7 + 1;
                } elseif(gettype($extras['simulDay']) == 'array' && count($extras['simulDay'])) {
                    $day = $extras['simulDay'][0];
                }
            }
            $animes[] = [
                'id' => $anime['id'],
                'title' => $anime['title'],
                'title_english' => $anime['alternative_titles']['en'] ?? '',
                'type' => $anime['media_type'],
                'day' => $day,
                'opening' => implode("\n", array_map('theme', $details['opening_themes'] ?? [])) ?? '',
                'ending' => implode("\n", array_map('theme', $details['ending_themes'] ?? [])) ?? '',
            ];

        }
        return $animes;
    });

    $router->get('maintenance', function() {
        return [
            'maintenance' => MalServiceProvider::getMaintenance()
        ];
    });
});
