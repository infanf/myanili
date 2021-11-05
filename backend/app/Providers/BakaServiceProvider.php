<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

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
        if (isset($matches['votes']) && isset($matches['score'])) {
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

    public static function searchManga(string $title, int $page = 1, int $perpage = 100)
    {
        $url = "https://www.mangaupdates.com/series.html?page={$page}&perpage={$perpage}&search={$title}";
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_USERAGENT, "MyAniLi (myani.li)");
        $response = curl_exec($ch);
        $mangas = [
            'link' => $url,
            'page' => $page,
            'more' => false,
            'mangas' => [],
        ];
        if (!$response || curl_getinfo($ch, CURLINFO_HTTP_CODE) >= 400) {
            return $mangas;
        }
        $doc = new \DOMDocument();
        @$doc->loadHTML($response);
        $finder = new \DOMXPath($doc);
        $mangas['more'] = !!($finder->query("//a[text() = 'Next Page']")->item(0)->textContent);
        $nodes = $finder->query("//*[@id='main_content']//div[contains(@class, 'col-12 col-lg-6 p-3 text')]");
        foreach ($nodes as $node) {
            $manga = [];
            $link = $finder->query(".//div[contains(@class, 'col text p-1 pl-3')]//a[contains(@alt, 'Series Info')]", $node)->item(0);
            $manga['title'] = $link->nodeValue ?? '';
            $manga['link'] = $link->getAttribute('href');
            $img = $finder->query(".//img", $node)->item(0);
            $manga['image'] = str_replace('/thumb', '', $img ? $img->getAttribute('src') : '');
            $manga['id'] = \intval(preg_replace('/^.+id=(\d+)$/', '$1', $manga['link']));
            $genres = $finder->query(".//div[contains(@class, 'textsmall')]/a", $node)->item(0);
            $manga['genres'] = explode(', ', $genres?$genres->getAttribute('title') : '');
            $manga['description'] = $finder->query(".//div[contains(@class, 'text flex-grow-1')]", $node)->item(0)->nodeValue ?? '';
            $yearRating = $finder->query(".//div[contains(@class, 'd-flex flex-column h-100')]/div[@class='text']", $node)->item(1)->nodeValue ?? '';
            preg_match('/^(?P<year>\d{4})( - (?P<rating>[\d\.]+))?/', $yearRating, $matches);
            $manga['year'] = \intval($matches['year'] ?? 0);
            $manga['rating'] = \floatval($matches['rating'] ?? 0);
            $mangas['mangas'][] = $manga;
        }
        return $mangas;
    }
}
