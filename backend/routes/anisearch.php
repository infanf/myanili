<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use App\Providers\AnisearchServiceProvider as AnisearchServiceProvider;
use Illuminate\Http\Request;

$router->group(['prefix' => 'anisearch'], function () use ($router) {
    $router->get('anime/search/{text}', function (string $text) {
        return AnisearchServiceProvider::searchAnime($text);
    });

    $router->get('anime/search/{text}/{page}', function (string $text, int $page = 1) {
        return AnisearchServiceProvider::searchAnime($text, $page);
    });

    $router->get('manga/search/{text}', function (string $text) {
        return AnisearchServiceProvider::searchManga($text);
    });

    $router->get('manga/search/{text}/{page}', function (string $text, int $page = 1) {
        return AnisearchServiceProvider::searchManga($text, $page);
    });

    $router->get('{type}/rating/{id}', function (string $type, int $id) {
        return AnisearchServiceProvider::getRating($id, $type);
    });

    $router->get('{type}/relations/{id}', function (string $type, int $id) {
        return AnisearchServiceProvider::getRelations($id, $type);
    });

    $router->get('auth', function () {
        $provider = AnisearchServiceProvider::getOauthProvider();
        if (!isset($_GET['code'])) {
            $authorizationUrl = $provider->getAuthorizationUrl([
                "response_type" => 'code',
                'scope' => 'ratings.anime ratings.manga',
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

                setcookie('ANISEARCH_ACCESS_TOKEN', $accessToken->getToken(), $accessToken->getExpires());
                setcookie('ANISEARCH_REFRESH_TOKEN', $accessToken->getRefreshToken(), $accessToken->getExpires() + (30 * 24 * 60 * 60));
                $javascript = "";
                $clientId = env('ANISEARCH_CLIENT_ID');
                foreach (explode(',', env('APP_CLIENT')) as $opener) {
                    $javascript .= <<<JAVASCRIPT
                        window.opener.postMessage({at:"{$accessToken->getToken()}",ci:"{$clientId}",anisearch:true}, "$opener");
    JAVASCRIPT;
                }
                return "<script>$javascript</script>";
            } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {

                // Failed to get the access token or user details.
                return ($e->getMessage());
            }
        }
    });
});
