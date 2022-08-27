<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use App\Providers\BakaServiceProvider as BakaServiceProvider;

$router->group(['prefix' => 'baka'], function () use ($router) {
    $router->get('manga/{id}', function ($id) {
        return BakaServiceProvider::getManga($id);
    });

    $router->get('search/{title}', function (string $title) {
        return BakaServiceProvider::searchManga($title);
    });

    for ($n = 1; $n < 10; $n++) {
        $route = "v1";
        for ($i = 1; $i <= $n; $i++) {
            $route.="/{p$i}";
        }
        $router->get($route, [
            'middleware' => 'cors',
            'uses'       => 'BakaController@redirect',
        ]);
        $router->post($route, [
            'middleware' => 'cors',
            'uses'       => 'BakaController@redirect',
        ]);
        $router->put($route, [
            'middleware' => 'cors',
            'uses'       => 'BakaController@redirect',
        ]);
        $router->delete($route, [
            'middleware' => 'cors',
            'uses'       => 'BakaController@redirect',
        ]);
    }
});
