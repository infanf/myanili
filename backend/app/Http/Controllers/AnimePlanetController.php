<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AnimePlanetController extends Controller
{
    private static $baseUrl = "https://www.anime-planet.com";

    public function getRating(string $slug, string $type = "anime") {
        $url = self::$baseUrl . "/{$type}/{$slug}";
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
