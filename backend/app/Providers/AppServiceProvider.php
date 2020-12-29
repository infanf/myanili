<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
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

    private const baseUrl = "https://api.myanimelist.net/v2";

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
            'clientId' => env('MAL_CLIENT_ID'),
            'clientSecret' => env('MAL_CLIENT_SECRET'),
            'redirectUri' => http_protocol() . '://' . $_SERVER['HTTP_HOST'] . preg_replace('/[?#].+$/', '', $_SERVER['REQUEST_URI']),
            'urlAuthorize' => 'https://myanimelist.net/v1/oauth2/authorize',
            'urlAccessToken' => 'https://myanimelist.net/v1/oauth2/token',
            'urlResourceOwnerDetails' => 'https://myanimelist.net/v1/oauth2/resource',
        ];
        return new \League\OAuth2\Client\Provider\GenericProvider($config);
    }

    private static function get(string $url, $params = null)
    {
        if ($params) {
            $url = $url . '?' . http_build_query($params);
        }

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$_SESSION['ACCESS_TOKEN']}"]);
        return curl_exec($ch);
    }

    public static function getMyList($status = null)
    {
        $params = ["fields" => "list_status", "limit" => 1000];
        if ($status) {
            $params['status'] = $status;
        }
        $response = json_decode(
            self::get(
                self::baseUrl . '/users/@me/animelist',
                $params
            ), true
        );
        $list = $response['data'];
        while ($response['paging'] && isset($response['paging']['next'])) {
            $response = json_decode(self::get($response['paging']['next']), true);
            $list = array_merge($list, $response['data']);
        }
        return $list;
    }

    public static function getAnimeDetails(int $id){
        $params = ['fields' => 'id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status{comments},num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics,opening_themes,ending_themes'];
        $response = json_decode(
            self::get(
                self::baseUrl . '/anime/' . $id,
                $params
            ), true
        );
        return $response;
    }
}
