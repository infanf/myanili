<?php

/** @var \Laravel\Lumen\Routing\Router $router */

$router->group(['prefix' => 'anidb'], function () use ($router) {
    for ($n = 1; $n < 10; $n++) {
        $route = "";
        for ($i = 1; $i <= $n; $i++) {
            $route.="/{p$i}";
        }
        $route = substr($route, 1);
        $router->get($route, [
            'middleware' => 'cors',
            'uses'       => 'AnidbController@redirect',
        ]);
        $router->post($route, [
            'middleware' => 'cors',
            'uses'       => 'AnidbController@redirect',
        ]);
        $router->put($route, [
            'middleware' => 'cors',
            'uses'       => 'AnidbController@redirect',
        ]);
        $router->delete($route, [
            'middleware' => 'cors',
            'uses'       => 'AnidbController@redirect',
        ]);
    }

});