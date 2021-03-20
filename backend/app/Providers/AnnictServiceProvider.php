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
        return new \League\OAuth2\Client\Provider\GenericProvider(self::getConfig());
    }

    public static function getConfig()
    {
        $config = [
            'clientId' => env('ANNICT_CLIENT_ID'),
            'clientSecret' => env('ANNICT_CLIENT_SECRET'),
            'redirectUri' => http_protocol() . '://' . $_SERVER['HTTP_HOST'] . '/annictauth',
            'urlAuthorize' => 'https://annict.com/oauth/authorize',
            'urlAccessToken' => 'https://annict.com/oauth/token',
            'urlResourceOwnerDetails' => 'https://annict.com/',
        ];
        return $config;
    }
}
