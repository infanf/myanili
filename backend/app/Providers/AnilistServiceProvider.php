<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AnilistServiceProvider extends ServiceProvider
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

    private const baseUrl = "https://anilist.co/api/v2";

    public static function getOauthProvider()
    {
        $config = [
            'clientId' => env('ANILIST_CLIENT_ID'),
            'clientSecret' => env('ANILIST_CLIENT_SECRET'),
            'redirectUri' => env('APP_URL') . '/anilistauth',
            'urlAuthorize' => 'https://anilist.co/api/v2/oauth/authorize',
            'urlAccessToken' => 'https://anilist.co/api/v2/oauth/token',
            'urlResourceOwnerDetails' => 'https://anilist.co/api/v2',
        ];
        return new \League\OAuth2\Client\Provider\GenericProvider($config);
    }
}
