<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class TraktServiceProvider extends ServiceProvider
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

    private const baseUrl = "https://api.trakt.tv";

    public static function getOauthProvider()
    {
        $config = [
            'clientId' => env('TRAKT_CLIENT_ID'),
            'clientSecret' => env('TRAKT_CLIENT_SECRET'),
            'redirectUri' => env('APP_URL') . '/traktauth',
            'urlAuthorize' => 'https://api.trakt.tv/oauth/authorize',
            'urlAccessToken' => 'https://api.trakt.tv/oauth/token',
            'urlResourceOwnerDetails' => 'https://api.trakt.tv',
        ];
        return new \League\OAuth2\Client\Provider\GenericProvider($config);
    }
}
