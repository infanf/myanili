<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use App\Providers\TmdbServiceProvider as TmdbServiceProvider;
use Illuminate\Http\Request;

$router->group(['prefix' => 'tmdb'], function () use ($router) {
    $router->get('/poster/{type}/{id}', function (string $type, int $id) {
        $poster = TmdbServiceProvider::getPoster($id, $type);

        return response()->json($poster);
    });
});