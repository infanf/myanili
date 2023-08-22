<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MangaDexController extends Controller
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

    private static $baseUrl = "https://api.mangadex.org/";

    public function redirect(Request $request)
    {
        $url = preg_replace('/^mangadex\//', self::$baseUrl, $request->path());
        $auth = $request->header('Authorization');
        $body = $request->getContent();
        $params = $request->query();
        $method = $request->getMethod();
        $headers = [];
        if ($auth) {
            $headers[] = "Authorization: $auth";
        }
        $headers[] = "Content-Type: " . $request->header('Content-Type');
        $headers[] = "User-Agent: " . $request->header('User-Agent');
        $ch = curl_init($url . ($params ? "?" . http_build_query($params) : ""));
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_CUSTOMREQUEST => $method,
        ]);
        if ($method !== "GET" && $body) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }
        $response = curl_exec($ch);
        curl_close($ch);
        return (new Response($response, curl_getinfo($ch, CURLINFO_HTTP_CODE)))
            ->header('Content-Type', curl_getinfo($ch, CURLINFO_CONTENT_TYPE));
    }
}
