<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class MalServiceProvider extends ServiceProvider
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

    public static function getOauthProvider($https = false)
    {
        function http_protocol($https)
        {
            $isSecure = false;
            if ($https || isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') {
                $isSecure = true;
            } elseif (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https' || !empty($_SERVER['HTTP_X_FORWARDED_SSL']) && $_SERVER['HTTP_X_FORWARDED_SSL'] == 'on') {
                $isSecure = true;
            }
            return $isSecure ? 'https' : 'http';
        }
        $config = [
            'clientId' => env('MAL_CLIENT_ID'),
            'clientSecret' => env('MAL_CLIENT_SECRET'),
            'redirectUri' => http_protocol($https) . '://' . $_SERVER['HTTP_HOST'] . '/auth',
            'urlAuthorize' => 'https://myanimelist.net/v1/oauth2/authorize',
            'urlAccessToken' => 'https://myanimelist.net/v1/oauth2/token',
            'urlResourceOwnerDetails' => 'https://myanimelist.net/v1/oauth2/resource',
        ];
        return new \League\OAuth2\Client\Provider\GenericProvider($config);
    }

    private static function get(string $url, $params = null)
    {
        if (!isset($_COOKIE['MAL_ACCESS_TOKEN'])) {
            return '{"auth": false}';
        }

        if ($params) {
            $url = $url . '?' . http_build_query($params);
        }

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$_COOKIE['MAL_ACCESS_TOKEN']}"]);
        return curl_exec($ch);
    }

    private static function put(string $url, $params = null)
    {
        if (!isset($_COOKIE['MAL_ACCESS_TOKEN'])) {
            return '{"auth": false}';
        }
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$_COOKIE['MAL_ACCESS_TOKEN']}"]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        // curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
        return curl_exec($ch);
    }

    public static function getMyList($status = null)
    {
        $params = [
            "fields" => "num_episodes,start_season,start_date,end_date,alternative_titles,list_status{comments}",
            "sort" => "anime_start_date",
            "limit" => 1000,
            "nsfw" => 1,
        ];
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

    public static function getMyMangaList($status = null)
    {
        $params = [
            "fields" => "num_volumes,num_chapters,authors{first_name,last_name},start_date,end_date,alternative_titles,list_status{comments}",
            "limit" => 1000,
            "nsfw" => 1,
        ];
        if ($status) {
            $params['status'] = $status;
        }
        $response = json_decode(
            self::get(
                self::baseUrl . '/users/@me/mangalist',
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

    public static function getListSeason(int $year, int $season)
    {
        $seasons = ['winter', 'spring', 'summer', 'fall'];
        $params = [
            "fields" => "num_episodes,start_season,media_type,start_date,end_date,alternative_titles,my_list_status{comments}",
            "limit" => 500,
            "nsfw" => 1,
        ];
        $response = json_decode(
            self::get(
                self::baseUrl . "/anime/season/$year/{$seasons[$season]}",
                $params
            ), true
        );
        $list = $response['data'];
        while ($response['paging'] && isset($response['paging']['next'])) {
            $response = json_decode(self::get($response['paging']['next']), true);
            $list = array_merge($list, $response['data']);
        }
        usort($list, function ($a, $b) {
            return strcmp($a['node']['title'], $b['node']['title']);
        });
        return $list;
    }

    public static function getAnimeDetails(int $id)
    {
        $params = ['fields' => 'id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status{comments},num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics,opening_themes,ending_themes'];
        $response = json_decode(
            self::get(
                self::baseUrl . '/anime/' . $id,
                $params
            ), true
        );
        // \var_dump($response); die;
        if (isset($response['opening_themes'])) {
            foreach ($response['opening_themes'] as $key => $op) {
                if ($song = self::getSong($op['id'])) {
                    $response['opening_themes'][$key]['spotify'] = $song;
                }
            }
        }

        if (isset($response['ending_themes'])) {
            foreach ($response['ending_themes'] as $key => $op) {
                if ($song = self::getSong($op['id'])) {
                    $response['ending_themes'][$key]['spotify'] = $song;
                }
            }
        }

        return $response;
    }

    public static function putAnimeDetails(int $id, $request)
    {
        $requestParams = $request->all();
        $response = json_decode(
            self::put(
                self::baseUrl . '/anime/' . $id . '/my_list_status',
                $requestParams
            ), true
        );
        return $response;
    }

    public static function getMangaDetails(int $id)
    {
        $params = ['fields' => 'id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status{comments},serialization,num_chapters,num_volumes,pictures,background,related_anime,related_manga,recommendations,authors{first_name,last_name},statistics'];
        $response = json_decode(
            self::get(
                self::baseUrl . '/manga/' . $id,
                $params
            ), true
        );
        return $response;
    }

    public static function putMangaDetails(int $id, $request)
    {
        $requestParams = $request->all();
        $response = json_decode(
            self::put(
                self::baseUrl . '/manga/' . $id . '/my_list_status',
                $requestParams
            ), true
        );
        return $response;
    }

    public static function getMe()
    {
        $response = json_decode(
            self::get(
                self::baseUrl . '/users/@me',
            ), true
        );
        return $response;
    }

    public static function getSong(int $id)
    {
        $songs = \file_get_contents(dirname(dirname(__DIR__)) . '/resources/songs.json');
        try {
            $songsArray = json_decode($songs, true);
            return (isset($songsArray[intval($id)])) ? $songsArray[intval($id)] : false;
        } catch (Exception $e) {
            return false;
        }
    }

    public static function getList(string $type, string $query)
    {
        $type = $type === 'manga' ? 'manga' : 'anime';

        $params = [
            "fields" => "num_episodes,start_season,media_type,start_date,end_date,alternative_titles,my_list_status{comments},mean",
            "limit" => 500,
            "q" => $query,
            "nsfw" => 1,
        ];
        $response = json_decode(
            self::get(
                self::baseUrl . "/" . $type,
                $params
            ), true
        );
        $list = $response['data'];
        // while ($response['paging'] && isset($response['paging']['next'])) {
        //     $response = json_decode(self::get($response['paging']['next']), true);
        //     $list = array_merge($list, $response['data']);
        // }
        return $list;
    }
}
