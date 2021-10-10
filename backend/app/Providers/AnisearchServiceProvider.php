<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AnisearchServiceProvider extends ServiceProvider
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

    static $baseUrl = "https://www.anisearch.com/";

    public static function searchAnime(string $title, int $page = 1)
    {
        $url = static::$baseUrl . "anime/index/page-{$page}?char=all&text={$title}&smode=2&sort=title&order=asc&view=1&title=en,fr,de,it,pl,ru,es,tr&titlex=1,2";
        $animes = [
            'page' => $page,
            'pages' => 1,
            'link' => $url,
            'nodes' => [],
        ];
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_USERAGENT, "MyAniLi (myani.li)");
        $response = curl_exec($ch);
        $doc = new \DOMDocument();
        @$doc->loadHTML($response);
        $finder = new \DOMXPath($doc);
        $nodes = $finder->query("//ul[contains(@class, 'gallery')]/li[contains(@class, 'btype0')]");
        $pages = $finder->query("//div[@class='pagenav-info']")->item(0)->textContent ?? null;
        if ($pages) {
            preg_match('/\d+ of (\d+)/', $pages, $matches);
            $animes['pages'] = intval($matches[1] ?? 1);
        }
        foreach ($nodes as $node) {
            $anime = [];
            $anime['title'] = $finder->query("{$node->getNodePath()}//span[contains(@class, 'title')]")->item(0)->nodeValue ?? '';
            $anime['studio'] = $finder->query("{$node->getNodePath()}//span[contains(@class, 'company')]")->item(0)->nodeValue ?? '';
            $anime['genre'] = $finder->query("{$node->getNodePath()}//div[contains(@class, 'genre')]")->item(0)->nodeValue ?? '';
            $anime['description'] = $finder->query("{$node->getNodePath()}//div[contains(@class, 'text scrollbox')]")->item(0)->nodeValue ?? '';
            $link = $finder->query("{$node->getNodePath()}/a")->item(0);
            $anime['link'] = $link ? static::$baseUrl . $link->getAttribute('href') : '';
            $anime['id'] = intval($link ? explode(',', explode('/', $link->getAttribute('href'))[1])[0] : '');
            $anime['image'] = $link ? "https://cdn.anisearch.com/images/" . $link->getAttribute('data-bg') : '';
            $anime['source'] = $finder->query("{$node->getNodePath()}//div[@class='type'][@title='Type']")->item(0)->nodeValue ?? '';
            $anime['duration'] = intval(str_replace('~', '', $finder->query("{$node->getNodePath()}//div[@class='episodes'][@title='Minutes']")->item(0)->nodeValue ?? ''));
            $meta = $finder->query("{$node->getNodePath()}//span[@class='details']/span[@class='date']")->item(0)->nodeValue ?? '';
            preg_match('/(?P<type>[^,]+),\s*(?P<episodes>[\d\?\+]*)\s*(\((?P<year>\d+)\))?/', $meta, $matches);
            $anime['type'] = $matches['type'] ?? '';
            $anime['episodes'] = intval($matches['episodes']) ?? null;
            $anime['year'] = $matches['year'] ?? '';
            $rating = $finder->query("{$node->getNodePath()}//*[@class='rating']/*[@class='star0']")->item(0);
            $anime['rating'] = floatval($rating ? $rating->getAttribute('title') : '');
            $animes['nodes'][] = $anime;
        }
        return $animes;
    }

    public static function searchManga(string $title, int $page = 1)
    {
        $url = static::$baseUrl . "manga/index/page-{$page}?char=all&text={$title}&smode=2&sort=title&order=asc&view=1&title=en,fr,de,it,pl,ru,es,tr&titlex=1,2";
        $mangas = [
            'page' => $page,
            'pages' => 1,
            'link' => $url,
            'nodes' => [],
        ];
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_USERAGENT, "MyAniLi (myani.li)");
        $response = curl_exec($ch);
        $doc = new \DOMDocument();
        @$doc->loadHTML($response);
        $finder = new \DOMXPath($doc);
        $nodes = $finder->query("//ul[contains(@class, 'gallery')]/li[contains(@class, 'btype0')]");
        $pages = $finder->query("//div[@class='pagenav-info']")->item(0)->textContent ?? null;
        if ($pages) {
            preg_match('/\d+ of (\d+)/', $pages, $matches);
            $mangas['pages'] = intval($matches[1] ?? 1);
        }
        foreach ($nodes as $node) {
            $manga = [];
            $manga['title'] = $finder->query("{$node->getNodePath()}//span[contains(@class, 'title')]")->item(0)->nodeValue ?? '';
            $manga['publisher'] = $finder->query("{$node->getNodePath()}//span[contains(@class, 'company')]")->item(0)->nodeValue ?? '';
            $manga['genre'] = $finder->query("{$node->getNodePath()}//div[contains(@class, 'genre')]")->item(0)->nodeValue ?? '';
            $manga['description'] = $finder->query("{$node->getNodePath()}//div[contains(@class, 'text scrollbox')]")->item(0)->nodeValue ?? '';
            $link = $finder->query("{$node->getNodePath()}/a")->item(0);
            $manga['link'] = $link ? static::$baseUrl . $link->getAttribute('href') : '';
            $manga['id'] = intval($link ? explode(',', explode('/', $link->getAttribute('href'))[1])[0] : '');
            $manga['image'] = $link ? "https://cdn.anisearch.com/images/" . $link->getAttribute('data-bg') : '';
            $manga['source'] = $finder->query("{$node->getNodePath()}//div[@class='type'][@title='Type']")->item(0)->nodeValue ?? '';
            $meta = $finder->query("{$node->getNodePath()}//span[@class='details']/span[@class='date']")->item(0)->nodeValue ?? '';
            preg_match('/(?P<type>[^,]+),\s*(?P<chapters>[\d\?\+]*)(\/(?P<volumes>[\d\?\+]*))?\s*(\((?P<year>\d+)\))?/', $meta, $matches);
            $manga['type'] = $matches['type'] ?? '';
            $manga['chapters'] = intval($matches['chapters']) ?? null;
            $manga['volumes'] = intval($matches['volumes']) ?? null;
            $manga['year'] = $matches['year'] ?? '';
            $rating = $finder->query("{$node->getNodePath()}//*[@class='rating']/*[@class='star0']")->item(0);
            $manga['rating'] = floatval($rating ? $rating->getAttribute('title') : '');
            $mangas['nodes'][] = $manga;
        }
        return $mangas;
    }

    public static function getRating(int $id, string $type = "anime")
    {
        $url = static::$baseUrl . "{$type}/{$id}/";
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_USERAGENT, "MyAniLi (myani.li)");
        $response = curl_exec($ch);
        $doc = new \DOMDocument();
        @$doc->loadHTML($response);
        $finder = new \DOMXPath($doc);
        $rating = $finder->query('//*[@id="ratingstats"]/tbody/tr[2]/td[1]/span')->item(0)->nodeValue ?? 0;
        $distribution = $finder->query('//*[@id="rating-stats"]/li/div[@class="value"]') ?? [];
        return [
            "nom" => floatval($rating),
            "norm" => floatval($rating) * 20,
            "ratings" => array_sum(array_map(function ($node) {
                return intval($node->nodeValue);
            }, iterator_to_array($distribution))),
        ];
    }

    // public static function getManga(int $id)
    // {
    //     $url = "https://www.mangaupdates.com/series.html?id={$id}";
    //     $ch = curl_init($url);
    //     curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    //     curl_setopt($ch, CURLOPT_USERAGENT, "MyAniLi (myani.li)");
    //     $response = curl_exec($ch);
    //     if (!$response || curl_getinfo($ch, CURLINFO_HTTP_CODE) >= 400) {
    //         return [
    //             'votes' => 0,
    //             'score' => 0,
    //         ];
    //     }
    //     $text = preg_replace('/\s*<[^>]*>\s*|\s+/', ' ', $response);
    //     preg_match('/\((?P<votes>\d+) votes\) Bayesian Average: (?P<score>[\d\.]+)/', $text, $matches);
    //     if (isset($matches['votes'])&&isset($matches['score'])) {
    //         return [
    //             'votes' => \intval($matches['votes']),
    //             'score' => floatval($matches['score']),
    //         ];
    //     }
    //     return [
    //             'votes' => 0,
    //             'score' => 0,
    //         ];
    // }
}
