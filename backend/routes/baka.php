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
});
