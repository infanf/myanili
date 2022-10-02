<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use Illuminate\Http\Request;

$router->group(['prefix' => 'livechart'], function () use ($router) {
    $router->get('/{id}', function (Request $request, $id) {
        $livechart = json_decode(file_get_contents('../resources/livechart.json'), true);
        if (!isset($livechart[$id])) {
            return response()->json([
                'error' => 'Anime not found',
            ], 404);
        }
        $anime = $livechart[$id];
        return response()->json($anime);
    });
});