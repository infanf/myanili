<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use App\Providers\TraktServiceProvider as TraktServiceProvider;
use GuzzleHttp\Psr7\Request;

$router->group(['prefix' => 'trakt'], function () use ($router) {
    $router->get('auth', function () {
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

    $router->post('auth', function () {
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

    $router->get('/{id}', function (string $id) {
        $traktId = null;
        $type = null;
        $malId = intval($id);
        if (!$malId) {
            return response()->json([
                'error' => 'Invalid ID',
            ], 400);
        }
        $traktShows = json_decode(file_get_contents('../resources/trakt-shows.json'), true);
        $traktMovies = json_decode(file_get_contents('../resources/trakt-movies.json'), true);
        $filteredShows = array_filter($traktShows, fn ($show) => $show['mal'] === $malId);
        $filteredMovies = array_filter($traktMovies, fn ($movie) => $movie['mal'] === $malId);
        if (count($filteredShows) === 1) {
            $traktShow = current($filteredShows);
            return response()->json([
                'id' => $traktShow['trakt'],
                'type' => 'show',
                'season' => $traktShow['season'],
                'title' => $traktShow['title'],
            ]);
        }
        if (count($filteredMovies) === 1) {
            $traktMovie = current($filteredMovies);
            return response()->json([
                'id' => $traktMovie['trakt'],
                'type' => 'movie',
                'title' => $traktShow['title'],
            ]);
        }
        return response()->json([
            'error' => 'Not found',
        ], 404);
    });
});
