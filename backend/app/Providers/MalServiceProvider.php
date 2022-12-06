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

    public static function getOauthProvider()
    {
        $config = [
            'clientId' => env('MAL_CLIENT_ID'),
            'clientSecret' => env('MAL_CLIENT_SECRET'),
            'redirectUri' => env('APP_URL') . '/auth',
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
        curl_setopt($ch, CURLOPT_USERAGENT, "MyAniLi");
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$_COOKIE['MAL_ACCESS_TOKEN']}"]);
        return curl_exec($ch);
    }

    private static function post(string $url, $params = [], $requestType = "POST")
    {
        if (!isset($_COOKIE['MAL_ACCESS_TOKEN'])) {
            return '{"auth": false}';
        }
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_USERAGENT, "MyAniLi");
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$_COOKIE['MAL_ACCESS_TOKEN']}"]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $requestType);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        // curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
        return curl_exec($ch);
    }

    private static function put(string $url, $params = [])
    {
        return self::post($url, $params, "PUT");
    }

    private static function delete(string $url, $params = [])
    {
        return self::post($url, $params, "DELETE");
    }

    public static function getMediaDetails(int $id, string $type, array $fields = [])
    {
        $params = ['fields' => implode(',', $fields)];
        $response = json_decode(
            self::get(
                implode('/', [self::baseUrl, $type, $id]),
                $params
            ), true
        );
        return $response;
    }

    public static function putMediaDetails(int $id, string $type, $request)
    {
        $requestParams = $request->all();
        $response = json_decode(
            self::put(
                implode('/', [self::baseUrl, $type, $id, 'my_list_status']),
                $requestParams
            ), true
        );
        return $response;
    }

    public static function deleteMediaFromList(int $id, string $type)
    {
        $response = json_decode(
            self::delete(
                implode('/', [self::baseUrl, $type, $id, 'my_list_status']),
            ), true
        );
        return $response;
    }

    public static function getMyList($status = null, $limit = 50, $offset = 0)
    {
        $fields = [
            "num_episodes",
            "start_season",
            "start_date",
            "end_date",
            "status",
            "alternative_titles",
            "media_type",
            "genres",
            "broadcast",
            "list_status{comments}",
        ];

        $params = [
            "fields" => implode(',', $fields),
            "sort" => "anime_start_date",
            "limit" => min(intval($limit), 1000) ?: 1000,
            "offset" => $offset,
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
        return $list;
    }

    public static function getMyMangaList($status = null, $limit = 50, $offset = 0)
    {
        $fields = [
            "num_volumes",
            "num_chapters",
            "authors{first_name,last_name}",
            "start_date",
            "end_date",
            "status",
            "alternative_titles",
            "media_type",
            "genres",
            "list_status{comments}",
        ];
        $params = [
            "fields" => implode(',', $fields),
            "limit" => min(intval($limit), 1000) ?: 1000,
            "offset" => $offset,
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
        return $list;
    }

    public static function getListSeason(int $year, int $season)
    {
        $seasons = ['winter', 'spring', 'summer', 'fall'];
        $fields = [
            "num_episodes",
            "start_season",
            "media_type",
            "start_date",
            "broadcast",
            "end_date",
            "alternative_titles",
            "my_list_status{comments,start_date,finish_date}",
            "nsfw",
            "rating",
            "popularity",
            "genres",
            "num_list_users",
            "synopsis",
            "studios",
            "source",
        ];
        $params = [
            "fields" => implode(',', $fields),
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
        $fields = [
            "id",
            "title",
            "main_picture",
            "alternative_titles",
            "start_date",
            "end_date",
            "synopsis",
            "mean",
            "rank",
            "popularity",
            "num_list_users",
            "num_scoring_users",
            "nsfw",
            "created_at",
            "updated_at",
            "media_type",
            "status",
            "genres",
            "my_list_status{comments,start_date,finish_date}",
            "num_episodes",
            "start_season",
            "broadcast",
            "source",
            "average_episode_duration",
            "rating",
            "pictures",
            "background",
            "related_anime{status}",
            "related_manga{status}",
            "recommendations",
            "studios",
            "statistics",
            "opening_themes",
            "ending_themes",
        ];
        $response = static::getMediaDetails($id, 'anime', $fields);
        return $response;
    }

    public static function getMangaDetails(int $id)
    {
        $fields = [
            "id",
            "title",
            "main_picture",
            "alternative_titles",
            "start_date",
            "end_date",
            "synopsis",
            "mean",
            "rank",
            "popularity",
            "num_list_users",
            "num_scoring_users",
            "nsfw",
            "created_at",
            "updated_at",
            "media_type",
            "status",
            "genres",
            "my_list_status{comments,start_date,finish_date}",
            "serialization",
            "num_chapters",
            "num_volumes",
            "pictures",
            "background",
            "related_anime",
            "related_manga",
            "recommendations",
            "authors{first_name,last_name}",
            "statistics",
        ];
        return static::getMediaDetails($id, 'manga', $fields);
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

    public static function getList(string $type, string $query, $limit = 50, $offset = 0)
    {
        $type = $type === 'manga' ? 'manga' : 'anime';
        $fields = [
            "num_episodes",
            "start_season",
            "media_type",
            "start_date",
            "end_date",
            "alternative_titles",
            "my_list_status{comments,start_date,finish_date}",
            "mean",
            "genres",
            "status",
            "nsfw",
        ];

        $params = [
            "fields" => implode(',', $fields),
            "limit" => min(intval($limit), 500) ?: 500,
            "offset" => $offset,
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
        return $list;
    }

    public static function getMaintenance()
    {
        $ch = curl_init('https://myanimelist.net/');
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        $body = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code >= 500) return true;
        if (strpos($body, 'is currently under scheduled maintenance') !== false) return true;
        return false;

    }
}