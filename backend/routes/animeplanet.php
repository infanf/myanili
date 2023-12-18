<?php

use App\Providers\AnimePlanetServiceProvider as AnimePlanetServiceProvider;

/** @var \Laravel\Lumen\Routing\Router $router */
$router->group(['prefix' => 'animeplanet'], function () use ($router) {
    $router->get('rating/{slug}', function ($slug) {
        return AnimePlanetServiceProvider::getRating($slug);
    });
});
