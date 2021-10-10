<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use App\Providers\AnisearchServiceProvider as AnisearchServiceProvider;
use Illuminate\Http\Request;

$router->group(['prefix' => 'anisearch'], function () use ($router) {
    $router->get('anime/search/{text}', function (string $text) {
        return AnisearchServiceProvider::searchAnime($text);
    });

    $router->get('anime/search/{text}/{page}', function (string $text, int $page = 1) {
        return AnisearchServiceProvider::searchAnime($text, $page);
    });

    $router->get('manga/search/{text}', function (string $text) {
        return AnisearchServiceProvider::searchManga($text);
    });

    $router->get('manga/search/{text}/{page}', function (string $text, int $page = 1) {
        return AnisearchServiceProvider::searchManga($text, $page);
    });

    $router->get('{type}/rating/{id}', function (string $type, int $id) {
        return AnisearchServiceProvider::getRating($id, $type);
    });
});