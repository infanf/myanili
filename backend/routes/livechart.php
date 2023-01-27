<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use Illuminate\Http\Request;

$router->group(['prefix' => 'livechart'], function () use ($router) {
    $router->get('/img', function (Request $request) {
        $imageUrl = $request->get('url');
        $image = file_get_contents(str_replace('.webp','jpg?style=small&format=webp',$imageUrl));
        $response = new \Illuminate\Http\Response($image, 200);
        $response->header('Content-Type', 'image/webp');
        return $response;
    });
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