<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class TmdbServiceProvider extends ServiceProvider
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

    private const baseUrl = "https://api.themoviedb.org";

    public static function getPoster(int $tmdbId, string $type = "tv")
    {
        $url = static::baseUrl . "/3/$type/$tmdbId/images?api_key=" . env('TMDB_API_KEY');
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_USERAGENT, "MyAniLi");
        $result = json_decode(curl_exec($ch));
        return $result;
    }
}
