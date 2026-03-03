<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class ShikimoriServiceProvider extends ServiceProvider
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

    public static function getOauthProvider()
    {
        $config = [
            'clientId' => env('SHIKIMORI_CLIENT_ID'),
            'clientSecret' => env('SHIKIMORI_CLIENT_SECRET'),
            'redirectUri' => env('APP_URL') . '/shikimori/auth',
            'urlAuthorize' => 'https://shikimori.io/oauth/authorize',
            'urlAccessToken' => 'https://shikimori.io/oauth/token',
            'urlResourceOwnerDetails' => 'https://shikimori.io/api/users/whoami',
            // Add HTTP client options with custom User-Agent
            'httpClient' => [
                'headers' => [
                    'User-Agent' => 'MyAniLi'
                ]
            ]
        ];
        return new \League\OAuth2\Client\Provider\GenericProvider($config);
    }
}
