<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AnnictServiceProvider extends ServiceProvider
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

    private const baseUrl = "https://annict.com/oauth";

    public static function getOauthProvider()
    {
        return new \League\OAuth2\Client\Provider\GenericProvider(self::getConfig());
    }

    public static function getConfig()
    {
        $config = [
            'clientId' => env('ANNICT_CLIENT_ID'),
            'clientSecret' => env('ANNICT_CLIENT_SECRET'),
            'redirectUri' => env('APP_URL') . '/annictauth',
            'urlAuthorize' => 'https://annict.com/oauth/authorize',
            'urlAccessToken' => 'https://annict.com/oauth/token',
            'urlResourceOwnerDetails' => 'https://annict.com/',
        ];
        return $config;
    }
}
