<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use App\Providers\AnilistServiceProvider as AnilistServiceProvider;
use App\Providers\MalServiceProvider as MalServiceProvider;
use App\Providers\TraktServiceProvider as TraktServiceProvider;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
 */

/*
 *  __  __   _   _    
 * |  \/  | /_\ | |   
 * | |\/| |/ _ \| |__ 
 * |_|  |_/_/ \_\____|
 * 
 */

$router->get('/auth', function () {
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

$router->get('/list', function () {
    return MalServiceProvider::getMyList();
});

$router->get('/list/{status}', function ($status) {
    return MalServiceProvider::getMyList($status);
});

$router->get('/mangalist', function () {
    return MalServiceProvider::getMyMangaList();
});

$router->get('/mangalist/{status}', function ($status) {
    return MalServiceProvider::getMyMangaList($status);
});

$router->get('/animes', function (Request $request) {
    $params = $request->all();
    if (isset($params['query'])) {
        return MalServiceProvider::getList('anime', $params['query']);
    }
    return [];
});

$router->get('/anime/{id}', function ($id) {
    return MalServiceProvider::getAnimeDetails($id);
});

$router->put('/anime/{id}', function ($id, Request $request) {
    return MalServiceProvider::putAnimeDetails($id, $request);
});

$router->post('/song/{id}', function ($id, Request $request) {
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

$router->get('/mangas', function (Request $request) {
    $params = $request->all();
    if (isset($params['query'])) {
        return MalServiceProvider::getList('manga', $params['query']);
    }
    return [];
});

$router->get('/manga/{id}', function ($id) {
    return MalServiceProvider::getMangaDetails($id);
});

$router->put('/manga/{id}', function ($id, Request $request) {
    return MalServiceProvider::putMangaDetails($id, $request);
});

$router->get('/animes/season/{year}/{season}', function (int $year, int $season) {
    return MalServiceProvider::getListSeason($year, $season);
});

$router->get('/me', function () {
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

$router->get('/logoff', function () {
    setcookie('MAL_ACCESS_TOKEN', '', 0);
    setcookie('MAL_REFRESH_TOKEN', '', 0);
});

$router->get('/', function () use ($router) {
    return $router->app->version();
});

$router->get('/debug', function () use ($router) {
    return $_SESSION['ACCESS_TOKEN'];
});

/*
 *   _            _   _    _
 *  | |_ _ _ __ _| |_| |_ | |___ __
 *  |  _| '_/ _` | / /  _||  _\ V /
 *   \__|_| \__,_|_\_\\__(_)__|\_/
 *
 */

$router->get('/traktauth', function () {
    $provider = TraktServiceProvider::getOauthProvider();
    if (!isset($_GET['code'])) {
        $authorizationUrl = $provider->getAuthorizationUrl([
            "response_type" => 'code',
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
            ]);

            setcookie('TRAKT_ACCESS_TOKEN', $accessToken->getToken(), $accessToken->getExpires());
            setcookie('TRAKT_REFRESH_TOKEN', $accessToken->getRefreshToken(), $accessToken->getExpires() + (30 * 24 * 60 * 60));
            $javascript = "";
            $clientId = env('TRAKT_CLIENT_ID');
            foreach (explode(',', env('APP_CLIENT')) as $opener) {
                $javascript .= <<<JAVASCRIPT
                    window.opener.postMessage({at:"{$accessToken->getToken()}",rt:"{$accessToken->getRefreshToken()}",ex:"{$accessToken->getExpires()}",ci:"{$clientId}",trakt:true}, "$opener");
JAVASCRIPT;
            }
            return "<script>$javascript</script>";
        } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {

            // Failed to get the access token or user details.
            return ($e->getMessage());
        }
    }
});

/*
 *     _        _ _    _    _
 *    /_\  _ _ (_) |  (_)__| |_
 *   / _ \| ' \| | |__| (_-<  _|
 *  /_/ \_\_||_|_|____|_/__/\__|
 *
 */

$router->get('/anilistauth', function () {
    $provider = AnilistServiceProvider::getOauthProvider();
    if (!isset($_GET['code'])) {
        $authorizationUrl = $provider->getAuthorizationUrl([
            "response_type" => 'code',
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
            ]);

            setcookie('ANILIST_ACCESS_TOKEN', $accessToken->getToken(), $accessToken->getExpires());
            setcookie('ANILIST_REFRESH_TOKEN', $accessToken->getRefreshToken(), $accessToken->getExpires() + (30 * 24 * 60 * 60));
            $javascript = "";
            $clientId = env('ANILIST_CLIENT_ID');
            foreach (explode(',', env('APP_CLIENT')) as $opener) {
                $javascript .= <<<JAVASCRIPT
                    window.opener.postMessage({at:"{$accessToken->getToken()}",rt:"{$accessToken->getRefreshToken()}",ex:"{$accessToken->getExpires()}",ci:"{$clientId}",anilist:true}, "$opener");
JAVASCRIPT;
            }
            return "<script>$javascript</script>";
        } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {

            // Failed to get the access token or user details.
            return ($e->getMessage());
        }
    }
});
