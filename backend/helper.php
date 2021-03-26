<?php
require __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

session_start();

$code_verifier = $_SESSION['verifier'] ?: rtrim(strtr(base64_encode(random_bytes(64)), "+/", "-_"), "=");
$_SESSION['verifier'] = $code_verifier;
// Very important, "raw_output" must be set to true or the challenge
// will not match the verifier.
// $challenge_bytes = hash("sha256", $code_verifier, true);
// $code_challenge = rtrim(strtr(base64_encode($challenge_bytes), "+/", "-_"), "=");
$code_challenge = $code_verifier;

$config = [
    'clientId' => $_ENV['CLIENT_ID'],
    'clientSecret' => $_ENV['CLIENT_SECRET'],
    'redirectUri' => env('APP_URL') . preg_replace('/[?#].+$/', '', $_SERVER['REQUEST_URI']),
    'urlAuthorize' => 'https://myanimelist.net/v1/oauth2/authorize',
    'urlAccessToken' => 'https://myanimelist.net/v1/oauth2/token',
    'urlResourceOwnerDetails' => 'https://myanimelist.net/v1/oauth2/resource',
];

$provider = new \League\OAuth2\Client\Provider\GenericProvider($config);
