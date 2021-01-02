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
        $config = [
            'clientId' => env('TRAKT_CLIENT_ID'),
            'clientSecret' => env('TRAKT_CLIENT_SECRET'),
            'redirectUri' => http_protocol() . '://' . $_SERVER['HTTP_HOST'] . '/traktauth',
            'urlAuthorize' => 'https://api.trakt.tv/oauth/authorize',
            'urlAccessToken' => 'https://api.trakt.tv/oauth/token',
            'urlResourceOwnerDetails' => 'https://api.trakt.tv',
        ];
        return new \League\OAuth2\Client\Provider\GenericProvider($config);
    }
}
