<?php
require 'helper.php';

// If we don't have an authorization code then get one
if (!isset($_GET['code'])) {

    // Fetch the authorization URL from the provider; this returns the
    // urlAuthorize option and generates and applies any necessary parameters
    // (e.g. state).
    $authorizationUrl = $provider->getAuthorizationUrl([
        code_challenge => $code_challenge
    ]);

    // Get the state generated for you and store it to the session.
    $_SESSION['oauth2state'] = $provider->getState();

    // Redirect the user to the authorization URL.
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

        $_SESSION['ACCESS_TOKEN']=$accessToken->getToken();
        $_SESSION['REFRESH_TOKEN']=$accessToken->getRefreshToken();
        $_SESSION['EXPIRES_IN']=$accessToken->getExpires();
        $_SESSION['EXPIRED']=$accessToken->hasExpired();
        exit;
    } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {

        // Failed to get the access token or user details.
        exit($e->getMessage());

    }

}