<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class BangumiServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public static function getUserInfo(string $authHeader): array
    {
        $ch = curl_init('https://api.bgm.tv/v0/me');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: ' . $authHeader,
                'Accept: application/json',
                'User-Agent: myanili/2.0 (https://github.com/infanf/myanili)',
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
            'clientId'                => env('BANGUMI_CLIENT_ID'),
            'clientSecret'            => env('BANGUMI_CLIENT_SECRET'),
            'redirectUri'             => env('APP_URL') . '/bangumi/auth',
            'urlAuthorize'            => 'https://bgm.tv/oauth/authorize',
            'urlAccessToken'          => 'https://bgm.tv/oauth/access_token',
            'urlResourceOwnerDetails' => 'https://api.bgm.tv/v0/me',
        ];
        return new \League\OAuth2\Client\Provider\GenericProvider($config);
    }
}
