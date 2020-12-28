<?php
require __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

session_start();

function http_protocol()
{
    $isSecure = false;
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') {
        $isSecure = true;
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https' || !empty($_SERVER['HTTP_X_FORWARDED_SSL']) && $_SERVER['HTTP_X_FORWARDED_SSL'] == 'on') {
        $isSecure = true;
    }
    return $isSecure ? 'https' : 'http';
}

$verifier_bytes = random_bytes(64);
$code_verifier = $_SESSION['verifier'] ?: rtrim(strtr(base64_encode($verifier_bytes), "+/", "-_"), "=");
$_SESSION['verifier'] = $code_verifier;
// Very important, "raw_output" must be set to true or the challenge
// will not match the verifier.
// $challenge_bytes = hash("sha256", $code_verifier, true);
// $code_challenge = rtrim(strtr(base64_encode($challenge_bytes), "+/", "-_"), "=");
$code_challenge = $code_verifier;