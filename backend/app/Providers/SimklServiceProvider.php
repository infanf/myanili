<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class SimklServiceProvider extends ServiceProvider
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

    private const baseUrl = "https://api.simkl.com/oauth";

    public static function getOauthProvider()
    {
        return new \League\OAuth2\Client\Provider\GenericProvider(self::getConfig());
    }

    public static function getConfig()
    {
        $config = [
            'clientId' => env('SIMKL_CLIENT_ID'),
            'clientSecret' => env('SIMKL_CLIENT_SECRET'),
            'redirectUri' => env('APP_URL') . '/simklauth',
            'urlAuthorize' => 'https://simkl.com/oauth/authorize',
            'urlAccessToken' => 'https://api.simkl.com/oauth/token',
            'urlResourceOwnerDetails' => 'https://api.simkl.com/',
        ];
        return $config;
    }
}
