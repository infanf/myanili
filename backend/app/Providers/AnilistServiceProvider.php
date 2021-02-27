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
            'clientId' => env('ANILIST_CLIENT_ID'),
            'clientSecret' => env('ANILIST_CLIENT_SECRET'),
            'redirectUri' => http_protocol() . '://' . $_SERVER['HTTP_HOST'] . '/anilistauth',
            'urlAuthorize' => 'https://anilist.co/api/v2/oauth/authorize',
            'urlAccessToken' => 'https://anilist.co/api/v2/oauth/token',
            'urlResourceOwnerDetails' => 'https://anilist.co/api/v2',
        ];
        return new \League\OAuth2\Client\Provider\GenericProvider($config);
    }
}
