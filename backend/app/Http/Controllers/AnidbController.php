<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AnidbController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->initCache();
    }

    private $cache;

    private static $baseUrl = "http://api.anidb.net:9001/";

    public function redirect(Request $request)
    {
        // doesn't work on production due to rate limiting
        // return [];
        $url = preg_replace('/^anidb\//', self::$baseUrl, $request->path());
        $auth = $request->header('Authorization');
        $body = $request->getContent();
        $params = $request->query();
        $method = $request->getMethod();
        $headers = [];
        if ($auth) {
            $headers[] = "Authorization: $auth";
        }
        $headers[] = "Content-Type: " . $request->header('Content-Type');
        $headers[] = "Accept: " . $request->header('Accept');
        $headers[] = "Accept-Encoding: gzip";
        $headers[] = "User-Agent: " . $request->header('User-Agent');
        if ($params) {
            $url .= "?" . http_build_query($params);
        }
        $response = $this->getCache($url);
        if ($response) {
            return (new Response($response, 200))
                ->header('Content-Type', 'application/xml')
                ->header('X-MyAniLi-From-Cache', 'true');
        }
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_ENCODING => "gzip",
        ]);
        if ($method !== "GET" && $body) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }
        $response = curl_exec($ch);
        curl_close($ch);
        $this->setCache($url, $response);
        return (new Response($response, curl_getinfo($ch, CURLINFO_HTTP_CODE)))
            ->header('Content-Type', curl_getinfo($ch, CURLINFO_CONTENT_TYPE));
    }

    private function initCache()
    {
        // create sqlite cache if not exists
        $this->cache = new \SQLite3('anidb_cache.sqlite');
        $this->cache->exec("CREATE TABLE IF NOT EXISTS cache (url VARCHAR(32) PRIMARY KEY, data TEXT, timestamp INTEGER)");
    }

    /**
     * @param string $url
     * @param string $data
     * @throws \Exception
     * @return void
     */
    private function setCache($url, $data)
    {
        if (!$this->cache) {
            $this->initCache();
        }
        $url = md5($url);
        $timestamp = time();
        $data = base64_encode($data);
        $stmt = $this->cache->prepare("INSERT OR REPLACE INTO cache (url, data, timestamp) VALUES (:url, :data, :timestamp)");
        $stmt->bindValue(':url', $url);
        $stmt->bindValue(':data', $data);
        $stmt->bindValue(':timestamp', $timestamp);
        $stmt->execute();
    }

    private function getCache($url)
    {
        if (!$this->cache) {
            $this->initCache();
        }
        $url = md5($url);
        $stmt = $this->cache->prepare("SELECT data, timestamp FROM cache WHERE url = :url");
        $stmt->bindValue(':url', $url);
        $result = $stmt->execute();
        $row = $result->fetchArray(SQLITE3_ASSOC);
        if ($row && $row['timestamp'] > time() - 60 * 60 * 24) {
            return base64_decode($row['data']);
        }
        return null;
    }
}
