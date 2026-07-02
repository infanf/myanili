<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use App\Providers\AnimescheduleServiceProvider as AnimescheduleServiceProvider;

$router->group(['prefix' => 'animeschedule'], function () use ($router) {
    // OAuth2 login (authorization code flow with PKCE)
    $router->get('auth', function () {
        $provider = AnimescheduleServiceProvider::getOauthProvider();
        // Surface authorization errors instead of blindly re-initiating the
        // flow, which would bounce between us and AnimeSchedule forever.
        if (isset($_GET['error'])) {
            exit('AnimeSchedule authorization error: '
                . htmlspecialchars($_GET['error'])
                . ' ' . htmlspecialchars($_GET['error_description'] ?? ''));
        }
        if (!isset($_GET['code'])) {
            // Scopes must match the ones enabled for this application in the
            // AnimeSchedule account API settings. Configure via env (comma
            // separated); defaults to the documented "stats" scope.
            $scopes = array_values(array_filter(array_map(
                'trim',
                explode(',', env('ANIMESCHEDULE_SCOPES', 'stats'))
            )));
            $authorizationUrl = $provider->getAuthorizationUrl([
                'scope' => $scopes,
            ]);
            $_SESSION['oauth2state'] = $provider->getState();
            $_SESSION['oauth2pkceCode'] = $provider->getPkceCode();
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
                if (isset($_SESSION['oauth2pkceCode'])) {
                    $provider->setPkceCode($_SESSION['oauth2pkceCode']);
                }
                $accessToken = $provider->getAccessToken('authorization_code', [
                    'code' => $_GET['code'],
                ]);

                setcookie('ANIMESCHEDULE_ACCESS_TOKEN', $accessToken->getToken(), $accessToken->getExpires());
                setcookie('ANIMESCHEDULE_REFRESH_TOKEN', $accessToken->getRefreshToken(), $accessToken->getExpires() + (30 * 24 * 60 * 60));
                $at = $accessToken->getToken();
                $rt = $accessToken->getRefreshToken();
                $ex = $accessToken->getExpires();
                $javascript = "";
                foreach (explode(',', env('APP_CLIENT')) as $opener) {
                    $javascript .= <<<JAVASCRIPT
                        window.opener.postMessage({at:"{$at}",rt:"{$rt}",ex:"{$ex}",animeschedule:true}, "$opener");
    JAVASCRIPT;
                }
                return "<script>$javascript</script>";
            } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {

                // Failed to get the access token or user details.
                return ($e->getMessage());
            }
        }
    });

    // Refresh an OAuth2 access token (client secret must stay server-side)
    $router->post('refresh', function () {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $refreshToken = $body['refresh_token'] ?? '';
        if (!$refreshToken) {
            return response()->json(['error' => 'missing refresh_token'], 400);
        }
        try {
            $provider = AnimescheduleServiceProvider::getOauthProvider();
            $accessToken = $provider->getAccessToken('refresh_token', [
                'refresh_token' => $refreshToken,
            ]);
            return response()->json([
                'at' => $accessToken->getToken(),
                'rt' => $accessToken->getRefreshToken() ?: $refreshToken,
                'ex' => $accessToken->getExpires(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 401);
        }
    });

    // Proxy for public anime data. The application token is a secret and must not
    // be exposed to the frontend, so all non-OAuth reads go through here.
    $router->get('anime[/{route}]', function ($route = null) {
        $base = 'https://animeschedule.net/api/v3/anime';
        $url = $route
            ? "$base/" . rawurlencode($route)
            : $base . '?' . http_build_query($_GET);
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => 1,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . env('ANIMESCHEDULE_APP_TOKEN'),
                'Accept: application/json',
            ],
        ]);
        $result = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return response($result, $status ?: 502)->header('Content-Type', 'application/json');
    });
});
