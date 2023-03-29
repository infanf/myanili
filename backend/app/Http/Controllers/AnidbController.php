<?php

namespace App\Http\Controllers;

use App\Http\Middleware\CorsMiddleware;
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
        //
    }

    private static $config = [
        'http' => [
            'base_uri' => 'http://api.anidb.net:9001/',
            'client' => 'myanilist',
            'clientver' => 2,
            'protover' => 1,
        ],
        'udp' => [
            'base_uri' => 'udp://api.anidb.net:9000',
            'client' => 'myanili',
            'clientver' => 1,
            'protover' => 3,
        ],
    ];

    public function httpapi(Request $request) {
        $url = preg_replace('/^anidb\//', self::$config['http']['base_uri'], $request->path());
        $auth = $request->header('Authorization');
        $body = $request->getContent();
        $params = $request->query();
        foreach(['client', 'clientver', 'protover'] as $key) {
            if (self::$config['http'][$key]) {
                $params[$key] = self::$config['http'][$key];
            }
        }
        $method = $request->getMethod();
        $headers = [];
        if ($auth) {
            $headers[] = "Authorization: $auth";
        }
        $headers[] = "Content-Type: " . $request->header('Content-Type');
        if ($params) {
            $url .= "?" . http_build_query($params);
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
        return (new Response($response, curl_getinfo($ch, CURLINFO_HTTP_CODE) ))
        ->header('Content-Type', curl_getinfo($ch, CURLINFO_CONTENT_TYPE));
    }

    private function login($username, $password): string | false {
        $params = [
            'user' => $username,
            'pass' => $password,
        ];
        foreach(['client', 'clientver', 'protover'] as $key) {
            if (self::$config['udp'][$key]) {
                $params[$key] = self::$config['udp'][$key];
            }
        }
        $fp = stream_socket_client(self::$config['udp']['base_uri'], $errno, $errstr, 30);
        $request = "AUTH " . http_build_query($params);
        fwrite($fp, $request);
        $response = fread($fp, 4096);
        fclose($fp);
        if (!\str_starts_with($response, '20')) {
            return false;
        }
        \preg_match('/^20\d (?P<auth_token>\w+) (.+)$/', $response, $matches);
        return $matches['auth_token'] ?? false;
    }

    public function auth(Request $request) {
        $username = $request->input('username');
        $password = $request->input('password');
        $auth = $this->login($username, $password);
        if (!$auth) {
            return response()->json([
                'error' => 'Invalid username or password',
            ], 401);
        }
        return response()->json([
            'auth' => $auth,
        ]);
    }

    public function getAnime(Request $request) {
        $aid = $request->query('aid');
        $fp = stream_socket_client(self::$config['udp']['base_uri'], $errno, $errstr, 30);
        $request = "ANIME lid=1&s=ivCHP";
        fwrite($fp, $request);
        $response = fread($fp, 4096);
        fclose($fp);
        return $response;
    }
}
