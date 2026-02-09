<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use App\Providers\AnilistServiceProvider as AnilistServiceProvider;
use App\Providers\AnnictServiceProvider as AnnictServiceProvider;
use App\Providers\BakaServiceProvider as BakaServiceProvider;
use App\Providers\MalServiceProvider as MalServiceProvider;
use App\Providers\MangabakaServiceProvider as MangabakaServiceProvider;
use App\Providers\SimklServiceProvider as SimklServiceProvider;
use App\Providers\TraktServiceProvider as TraktServiceProvider;
use Illuminate\Http\Request;

$router->get('/phpinfo', function () {
    phpinfo();
});

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| I?code=NQWbdir0pAMkFBmLgkSvt7yq0C2S4Yu7gc2ece6fFPE&state=510e67689df0e7392a4d566f40bf3b55

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
                    window.opener.postMessage({mal: true}, "$opener");
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
    return MalServiceProvider::putMediaDetails($id, 'anime', $request);
});

$router->delete('/anime/{id}', function ($id, Request $request) {
    return MalServiceProvider::deleteMediaFromList($id, 'anime');
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
    return MalServiceProvider::putMediaDetails($id, 'manga', $request);
});

$router->delete('/manga/{id}', function ($id, Request $request) {
    return MalServiceProvider::deleteMediaFromList($id, 'manga');
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

$router->post('traktauth', function () {
    $provider = TraktServiceProvider::getOauthProvider();
    if (!isset($_COOKIE['TRAKT_ACCESS_TOKEN']) && (isset($_COOKIE['TRAKT_REFRESH_TOKEN']) || isset($_POST['refresh_token']))) {
        try {
            $accessToken = $provider->getAccessToken('refresh_token', [
                'refresh_token' => isset($_COOKIE['TRAKT_REFRESH_TOKEN']) ? $_COOKIE['TRAKT_REFRESH_TOKEN'] : $_POST['refresh_token'],
            ]);
            setcookie('TRAKT_ACCESS_TOKEN', $accessToken->getToken(), $accessToken->getExpires());
            setcookie('TRAKT_REFRESH_TOKEN', $accessToken->getRefreshToken(), $accessToken->getExpires() + (30 * 24 * 60 * 60));
            return [
                "access_token" => $accessToken->getToken(),
                "refresh_token" => $accessToken->getRefreshToken(),
                "expires" => $accessToken->getExpires(),
            ];
        } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {
            return ($e->getMessage());
        }
    }
    return [];
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

/**
 *    ___ ___ __  __ _  ___
 *   / __|_ _|  \/  | |/ / |
 *   \__ \| || |\/| | ' <| |__
 *   |___/___|_|  |_|_|\_\____|
 *
 */

$router->get('/simklauth', function () {
    $provider = SimklServiceProvider::getOauthProvider();
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
            $config = json_decode(json_encode(SimklServiceProvider::getConfig()));
            $data = [
                "code" => $_GET['code'],
                "client_id" => $config->clientId,
                "client_secret" => $config->clientSecret,
                "redirect_uri" => $config->redirectUri,
                "grant_type" => 'authorization_code',
            ];
            $ch = curl_init($config->urlAccessToken);
            curl_setopt_array($ch, [
                CURLOPT_HEADER => 'Content-Type: application/json',
                CURLOPT_CUSTOMREQUEST => "POST",
                CURLOPT_POSTFIELDS => json_encode($data),
                CURLOPT_RETURNTRANSFER => 1,
            ]);
            $result = json_decode(curl_exec($ch), true);

            curl_close($ch);

            if (isset($result['error'])) {
                throw (new Exception($result['error']));
            }

            $expires = strtotime('+1 year');
            setcookie('SIMKL_ACCESS_TOKEN', $result['access_token'], $expires);
            $javascript = "";
            foreach (explode(',', env('APP_CLIENT')) as $opener) {
                $javascript .= <<<JAVASCRIPT
                    window.opener.postMessage({at:"{$result['access_token']}",ex:"{$expires}",ci:"{$config->clientId}",simkl:true}, "$opener");
JAVASCRIPT;
            }
            return "<script>$javascript</script>";
        } catch (Exception $e) {
            // Failed to get the access token or user details.
            return ($e->getMessage());
        }
    }
});

/**
 *     _             _    _
 *    /_\  _ _  _ _ (_)__| |_
 *   / _ \| ' \| ' \| / _|  _|
 *  /_/ \_\_||_|_||_|_\__|\__|
 *
 */

$router->get('/annictauth', function () {
    $provider = AnnictServiceProvider::getOauthProvider();
    if (!isset($_GET['code'])) {
        $authorizationUrl = $provider->getAuthorizationUrl([
            "response_type" => 'code',
            'scope' => 'read write',
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

            setcookie('ANNICT_ACCESS_TOKEN', $accessToken->getToken(), $accessToken->getExpires());
            setcookie('ANNICT_REFRESH_TOKEN', $accessToken->getRefreshToken(), $accessToken->getExpires() + (30 * 24 * 60 * 60));
            $javascript = "";
            $clientId = env('ANNICT_CLIENT_ID');
            foreach (explode(',', env('APP_CLIENT')) as $opener) {
                $javascript .= <<<JAVASCRIPT
                    window.opener.postMessage({at:"{$accessToken->getToken()}",ci:"{$clientId}",annict:true}, "$opener");
JAVASCRIPT;
            }
            return "<script>$javascript</script>";
        } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {
            // Failed to get the access token or user details.
            return ($e->getMessage());
        }
    }
});

/**
 *  __  __                       ___        _
 * |  \/  |__ _ _ _  __ _ __ _  | _ ) __ _| |__ __ _
 * | |\/| / _` | ' \/ _` / _` | | _ \/ _` | / / _` |
 * |_|  |_\__,_|_||_\__, \__,_| |___/\__,_|_\_\__,_|
 *                      |___/
 */

$router->get('/mangabaka/auth', function () {
    $code_verifier = isset($_SESSION['mangabaka_verifier']) ? $_SESSION['mangabaka_verifier'] : rtrim(strtr(base64_encode(random_bytes(64)), "+/", "-_"), "=");
    $_SESSION['mangabaka_verifier'] = $code_verifier;
    $code_challenge = rtrim(strtr(base64_encode(hash('sha256', $code_verifier, true)), '+/', '-_'), '=');

    $provider = MangabakaServiceProvider::getOauthProvider();
    if (!isset($_GET['code'])) {
        $authorizationUrl = $provider->getAuthorizationUrl([
            "response_type" => 'code',
            'scope' => 'openid profile library.read library.write',
            'code_challenge' => $code_challenge,
            'code_challenge_method' => 'S256',
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

            setcookie('MANGABAKA_ACCESS_TOKEN', $accessToken->getToken(), $accessToken->getExpires());
            setcookie('MANGABAKA_REFRESH_TOKEN', $accessToken->getRefreshToken(), $accessToken->getExpires() + (30 * 24 * 60 * 60));
            $javascript = "";
            $clientId = env('MANGABAKA_CLIENT_ID');
            foreach (explode(',', env('APP_CLIENT')) as $opener) {
                $javascript .= <<<JAVASCRIPT
                    window.opener.postMessage({at:"{$accessToken->getToken()}",rt:"{$accessToken->getRefreshToken()}",ex:"{$accessToken->getExpires()}",ci:"{$clientId}",mangabaka:true}, "$opener");
JAVASCRIPT;
            }
            return "<script>$javascript</script>";
        } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {

            // Failed to get the access token or user details.
            return ($e->getMessage());
        }
    }
});

/**
 *  ___       _        __  __
 * | _ ) __ _| |____ _|  \/  |__ _ _ _  __ _ __ _
 * | _ \/ _` | / / _` | |\/| / _` | ' \/ _` / _` |
 * |___/\__,_|_\_\__,_|_|  |_\__,_|_||_\__, \__,_|
 *                                     |___/
 */

$router->get('/baka/{id}', function ($id) {
    return BakaServiceProvider::getManga($id);
});
