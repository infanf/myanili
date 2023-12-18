<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AnimePlanetServiceProvider extends ServiceProvider
{
    private static $baseUrl = "https://www.anime-planet.com";

    public static function getRating(string $slug, string $type = "anime") {
        $url = self::$baseUrl . "/{$type}/{$slug}";
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        // curl_setopt($ch, CURLOPT_USERAGENT, "MyAniLi (myani.li)");
        curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0");
        // follow redirects
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        $response = curl_exec($ch);
        if (!$response || curl_getinfo($ch, CURLINFO_HTTP_CODE) >= 400) {
            return [
                'votes' => 0,
                'score' => 0,
                'error' => \curl_getinfo($ch, CURLINFO_HTTP_CODE) >= 400 ? 'HTTP ' . \curl_getinfo($ch, CURLINFO_HTTP_CODE) : 'Unknown error',
            ];
        }
        $doc = new \DOMDocument();
        @$doc->loadHTML($response);
        $xpath = new \DOMXPath($doc);
        $rating = $xpath->query("//div[@class='avgRating']");
        if ($rating->length === 0) {
            return [
                'votes' => 0,
                'score' => 0,
            ];
        }
        $title = $rating->item(0)->getAttribute('title');
        $matches = [];
        preg_match('/([0-9.]+) out of 5 from ([0-9,]+) votes/', $title, $matches);
        if (count($matches) !== 3) {
            return [
                'votes' => 0,
                'score' => 0,
            ];
        }
        return [
            'votes' => (int) str_replace(',', '', $matches[2]),
            'score' => (float) $matches[1],
        ];
    }
}
