<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use App\Providers\AnilistServiceProvider as AnilistServiceProvider;

$router->group(['prefix' => 'anilist'], function () use ($router) {
    $router->get('auth', function () {
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
});
