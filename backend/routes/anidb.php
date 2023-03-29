<?php

/** @var \Laravel\Lumen\Routing\Router $router */

$router->group(['prefix' => 'anidb'], function () use ($router) {
    $router->get('httpapi', 'AnidbController@httpapi');
    $router->group(['prefix' => 'v3'], function () use ($router) {
        $router->post('auth', 'AnidbController@auth');
        $router->get('anime/{aid}', 'AnidbController@getAnime');
        // $router->put('/{path:.*}', 'AnidbController@redirect');
        // $router->delete('/{path:.*}', 'AnidbController@redirect');
    });
});
