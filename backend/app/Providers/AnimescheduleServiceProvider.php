<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use League\OAuth2\Client\Provider\AbstractProvider;

class AnimescheduleServiceProvider extends ServiceProvider
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

    private const baseUrl = "https://animeschedule.net/api/v3";

    public static function getOauthProvider()
    {
        return new \League\OAuth2\Client\Provider\GenericProvider(self::getConfig());
    }

    public static function getConfig()
    {
        $config = [
            'clientId' => env('ANIMESCHEDULE_CLIENT_ID'),
            'clientSecret' => env('ANIMESCHEDULE_CLIENT_SECRET'),
            'redirectUri' => env('APP_URL') . '/animeschedule/auth',
            'urlAuthorize' => 'https://animeschedule.net/api/v3/oauth2/authorize',
            'urlAccessToken' => 'https://animeschedule.net/api/v3/oauth2/token',
            'urlResourceOwnerDetails' => 'https://animeschedule.net/api/v3/users/oauth/stats',
            // AnimeSchedule only supports the authorization code flow with PKCE.
            'pkceMethod' => AbstractProvider::PKCE_METHOD_S256,
        ];
        return $config;
    }
}
