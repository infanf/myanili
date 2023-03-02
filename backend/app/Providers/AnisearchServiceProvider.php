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
            $anime['episodes'] = strpos($matches['episodes'], '+') ? 0 : intval($matches['episodes'] ?? 0);
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
            preg_match('/(?P<type>[^,]+),\s*(?P<volumes>[\d\?\+]*)(\/(?P<chapters>[\d\?\+]*))?\s*(\((?P<year>\d+)\))?/', $meta, $matches);
            $manga['type'] = $matches['type'] ?? '';
            $manga['chapters'] = strpos($matches['chapters'], '+') ? 0 : intval($matches['chapters']) ?? 0;
            $manga['volumes'] = strpos($matches['volumes'], '+') ? 0 : intval($matches['volumes']) ?? 0;
            $manga['year'] = $matches['year'] ?? '';
            $rating = $finder->query("{$node->getNodePath()}//*[@class='rating']/*[@class='star0']")->item(0);
            $manga['rating'] = floatval($rating ? $rating->getAttribute('title') : '');
            $mangas['nodes'][] = $manga;
        }
        return $mangas;
    }

    public static function getRating(int $id, string $type = "anime")
    {
        $url = static::$baseUrl . "{$type}/{$id}";
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_USERAGENT, "MyAniLi (myani.li)");
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        $response = curl_exec($ch);
        $doc = new \DOMDocument();
        @$doc->loadHTML($response);
        $finder = new \DOMXPath($doc);
        $ldJson = $finder->query("//script[@type='application/ld+json']")->item(0)->nodeValue ?? null;
        $rating = 0;
        $ratings = 0;
        try {
            $json = json_decode($ldJson, true);
            $rating = $json['aggregateRating']['ratingValue'] ?? 0;
            $ratings = $json['aggregateRating']['ratingCount'] ?? 0;
        } catch (\Exception $e) {
        }
        if (intval($ratings) === 1 && floatval($rating) === 2.5) {
            return [
                "nom" => 0,
                "norm" => 0,
                "ratings" => 0,
            ];
        }
        return [
            "nom" => floatval($rating),
            "norm" => floatval($rating) * 20,
            "ratings" => intval($ratings),
        ];
    }

    public static function getRelations(int $id, string $type = "anime")
    {
        $url = static::$baseUrl . "{$type}/{$id}/relations";
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_USERAGENT, "MyAniLi (myani.li)");
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_COOKIE, "page_relation_mode=overall");
        $response = curl_exec($ch);
        $doc = new \DOMDocument();
        @$doc->loadHTML($response);
        $finder = new \DOMXPath($doc);
        $relations = [];
        $types = ['anime', 'manga', 'movie'];
        foreach ($types as $type) {
            $relationRows = $finder->query("//*[@id=\"relations_{$type}\"]//tbody/tr") ?? [];
            foreach ($relationRows as $row) {
                $relation = [];
                $relation['type'] = $type;
                $titleCol = $finder->query("{$row->getNodePath()}/th[@class=\"showpop\"]")->item(0);
                $titleLink = $finder->query("{$titleCol->getNodePath()}/a")->item(0);
                $relation['title'] = $titleLink->nodeValue ?? '';
                $link = $titleLink->getAttribute('href');
                $relation['link'] = $link ? static::$baseUrl . $link : '';
                $linkArray = explode('/', $link);
                $relation['id'] = intval(array_pop($linkArray));
                $tooltip = $titleCol->getAttribute('data-tooltip');
                preg_match('/<img src="(?P<poster>[^"]+)"/', $tooltip, $matches);
                $relation['poster'] = $matches['poster'] ?? '';
                $relation['relation'] = $finder->query("{$titleCol->getNodePath()}/span")->item(0)->nodeValue ?? '';
                if ($relation['relation'] === '?') {
                    $relation['relation'] = "Adaption";
                }
                $mediaTypeYear = $finder->query("{$row->getNodePath()}/td[@title=\"Type / Episodes / Year\"]")->item(0)->nodeValue ?? '';
                preg_match('/(?P<type>[^,]+),\s*(?P<episodes>[\d\?\+]*)(\/(?P<chapters>[\d\?\+]*))?\s*(\((?P<year>\d+)\))?/', $mediaTypeYear, $matches);
                $relation['media_type'] = $matches['type'] ?? '';
                $relation['episodes'] = strpos($matches['episodes'], '+') ? 0 : intval($matches['episodes']) ?? 0;
                $relation['volumes'] = isset($matches['chapters']) ? strpos($matches['chapters'], '+') ? 0 : intval($matches['chapters']) ?? 0 : 0;
                $relation['year'] = $matches['year'] ?? '';
                $mainGenres = $finder->query("{$row->getNodePath()}/td[@title=\"Main genres\"]") ?? [];
                $relation['genres'] = array_map(function ($node) {
                    return $node->nodeValue;
                }, iterator_to_array($mainGenres));
                $relations[] = $relation;
            }
        }
        return $relations;
    }
}
