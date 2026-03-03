<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class MangabakaServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    public static function getUserInfo(string $authHeader): array
    {
        $ch = curl_init('https://mangabaka.org/auth/oauth2/userinfo');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: ' . $authHeader,
                'Accept: application/json',
            ],
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return ['body' => $response, 'status' => $httpCode];
    }

    public static function getOauthProvider()
    {
        $config = [
            'clientId' => env('MANGABAKA_CLIENT_ID'),
            'clientSecret' => env('MANGABAKA_CLIENT_SECRET'),
            'redirectUri' => env('APP_URL') . '/mangabaka/auth',
            'urlAuthorize' => 'https://mangabaka.org/auth/oauth2/authorize',
            'urlAccessToken' => 'https://mangabaka.org/auth/oauth2/token',
            'urlResourceOwnerDetails' => 'https://mangabaka.org/auth/oauth2/userinfo',
        ];
        return new \League\OAuth2\Client\Provider\GenericProvider($config);
    }
}
