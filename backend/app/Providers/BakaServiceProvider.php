<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use DOMDocument;

class BakaServiceProvider extends ServiceProvider
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

    public static function getManga(int $id)
    {
        $url = "https://www.mangaupdates.com/series.html?id={$id}";
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_USERAGENT, "MyAniLi (myani.li)");
        $response = curl_exec($ch);
        if (!$response || curl_getinfo($ch, CURLINFO_HTTP_CODE) >= 400) {
            return [
                'votes' => 0,
                'score' => 0,
            ];
        }
        $text = preg_replace('/\s*<[^>]*>\s*|\s+/', ' ', $response);
        preg_match('/\((?P<votes>\d+) votes\) Bayesian Average: (?P<score>[\d\.]+)/', $text, $matches);
        if (isset($matches['votes'])&&isset($matches['score'])) {
            return [
                'votes' => \intval($matches['votes']),
                'score' => floatval($matches['score']),
            ];
        }
        return [
                'votes' => 0,
                'score' => 0,
            ];
    }
}
