<?php
namespace App\Http\Middleware;

use Closure;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $corsAllowed = explode(',', env('APP_CLIENT'));

        if (isset($_SERVER['HTTP_REFERER'])) {
            foreach ($corsAllowed as $origin) {
                if (strpos($_SERVER['HTTP_REFERER'], $origin) !== false) {
                    $corsAllowed = $origin;
                    break;
                }
            }
        } else {
            $corsAllowed = "*";
        }
        $headers = [
            'Access-Control-Allow-Origin' => $corsAllowed,
            'Access-Control-Allow-Methods' => 'POST, GET, OPTIONS, PUT, DELETE',
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Max-Age' => '86400',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With',
        ];

        if ($request->isMethod('OPTIONS')) {
            return response()->json('{"method":"OPTIONS"}', 200, $headers);
        }

        $response = $next($request);
        foreach ($headers as $key => $value) {
            $response->header($key, $value);
        }

        return $response;
    }
}
