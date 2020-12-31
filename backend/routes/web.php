<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use App\Providers\AppServiceProvider as AppServiceProvider;
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

$router->get('/auth', function () {
    $code_verifier = isset($_SESSION['verifier']) ? $_SESSION['verifier'] : rtrim(strtr(base64_encode(random_bytes(64)), "+/", "-_"), "=");
    $_SESSION['verifier'] = $code_verifier;
    $provider = AppServiceProvider::getOauthProvider();
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
            setcookie('REFRESH_TOKEN', $accessToken->getRefreshToken(), $accessToken->getExpires());
            // $_SESSION['ACCESS_TOKEN'] = $accessToken->getToken();
            // $_SESSION['REFRESH_TOKEN'] = $accessToken->getRefreshToken();
            // $_SESSION['EXPIRES_IN'] = $accessToken->getExpires();
            // $_SESSION['EXPIRED'] = $accessToken->hasExpired();
            $opener = env('APP_CLIENT');
            $javascript = <<<JAVASCRIPT
            window.opener.postMessage(true, "$opener");
JAVASCRIPT;
            return "<script>$javascript</script>";
        } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {

            // Failed to get the access token or user details.
            return ($e->getMessage());
        }
    }
});

$router->get('/list', function () {
    return AppServiceProvider::getMyList();
});

$router->get('/list/{status}', function ($status) {
    return AppServiceProvider::getMyList($status);
});

$router->get('/anime/{id}', function ($id) {
    return AppServiceProvider::getAnimeDetails($id);
});

$router->put('/anime/{id}', function ($id, Request $request) {
    return AppServiceProvider::putAnimeDetails($id, $request);
});

$router->get('/animes/season/{year}/{season}', function (int $year, int $season) {
    return AppServiceProvider::getListSeason($year, $season);
});

$router->get('/me', function () {
    return AppServiceProvider::getMe();
});

$router->get('/logoff', function () {
    setcookie('MAL_ACCESS_TOKEN', '', 0);
    setcookie('REFRESH_TOKEN', '', 0);
});

$router->get('/', function () use ($router) {
    return $router->app->version();
});

$router->get('/debug', function () use ($router) {
    return $_SESSION['ACCESS_TOKEN'];
});
