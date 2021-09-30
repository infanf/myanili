<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use App\Providers\SimklServiceProvider as SimklServiceProvider;

$router->group(['prefix' => 'simkl'], function () use ($router) {
    $router->get('auth', function () {
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
});
