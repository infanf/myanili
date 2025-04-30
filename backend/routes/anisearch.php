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
                // 'scope' => 'ratings.anime ratings.manga user.profile',
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
                        window.opener.postMessage({at:"{$accessToken->getToken()}",rt:"{$accessToken->getRefreshToken()}",ci:"{$clientId}",anisearch:true}, "$opener");
    JAVASCRIPT;
                }
                return "<script>$javascript</script>";
            } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {

                // Failed to get the access token or user details.
                return ($e->getMessage());
            }
        }
    });

    $router->post('token', function (Request $request) {
        $refreshToken = $request->input('refresh_token');
        $token = AnisearchServiceProvider::getOauthProvider()->getAccessToken('refresh_token', [
            'refresh_token' => $refreshToken,
            'grant_type' => 'refresh_token',
        ]);
        return response()->json([
            'access_token' => $token->getToken(),
            'refresh_token' => $token->getRefreshToken(),
            'expires' => $token->getExpires(),
        ], 201);
    });

    $router->post('logoff', function (Request $request) {
        $refreshToken = $request->input('refresh_token');
        $revokeUrl = "https://www.anisearch.com/oauth/revoke";
        $clientId = env('ANISEARCH_CLIENT_ID');
        $clientSecret = env('ANISEARCH_CLIENT_SECRET');
        $authHeader = base64_encode($clientId . ':' . $clientSecret);

        $ch = curl_init($revokeUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'token' => $refreshToken,
            'token_type_hint' => 'refresh_token'
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Basic ' . $authHeader,
            'Content-Type: application/x-www-form-urlencoded'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            return response()->json(['error' => 'Failed to revoke token'], $httpCode);
        }

        return response()->json([], 204);
    });
});
