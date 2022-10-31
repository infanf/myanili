<?php

error_reporting(E_ERROR | E_PARSE);

$showsUrl = "https://anitrakt.huere.net/db/db_index_shows.php";
// parse HTML
$showsHtml = file_get_contents($showsUrl);
$showsDom = new DOMDocument();
$showsDom->loadHTML($showsHtml);
$showsXpath = new DOMXPath($showsDom);
$showsTr = $showsXpath->query("//tbody/tr");
$shows = [];
foreach ($showsTr as $show) {
    $showTd = $showsXpath->query("td", $show);
    $traktLink = $showsXpath->query("a", $showTd->item(0))?->item(0)?->getAttribute("href");
    $traktId = preg_match("/\/shows\/([0-9]+)/", $traktLink, $matches) ? $matches[1] : null;
    if (!$traktId) {
        continue;
    }
    $showTdMal = $showTd->item(1);
    $rawHtml = $showsDom->saveHTML($showTdMal);
    $lines = explode("<br>", $rawHtml);
    foreach ($lines as $line) {
        $malId = preg_match("/\/anime\/([0-9]+)/", $line, $matches) ? $matches[1] : null;
        if (!$malId) {
            continue;
        }
        $seasonNo = preg_match("/^(\<td\>)?\s*S([0-9]+)/", $line, $matches) ? $matches[2] : 1;
        $shows[] = [
            "trakt" => intval($traktId),
            "season" => intval($seasonNo),
            "mal" => intval($malId),
        ];
    }
}

//export JSON
file_put_contents("../trakt-shows.json", json_encode($shows));

$moviesUrl = "https://anitrakt.huere.net/db/db_index_movies.php";
// parse HTML
$moviesHtml = file_get_contents($moviesUrl);
$moviesDom = new DOMDocument();
$moviesDom->loadHTML($moviesHtml);
$moviesXpath = new DOMXPath($moviesDom);
$moviesTr = $moviesXpath->query("//tbody/tr");
$movies = [];
foreach ($moviesTr as $movie) {
    $movieTd = $moviesXpath->query("td", $movie);
    $traktLink = $moviesXpath->query("a", $movieTd->item(0))?->item(0)?->getAttribute("href");
    $traktId = preg_match("/\/movies\/([0-9]+)/", $traktLink, $matches) ? $matches[1] : null;
    if (!$traktId) {
        continue;
    }
    $malLink = $moviesXpath->query("a", $movieTd->item(1))?->item(0)?->getAttribute("href");
    $malId = preg_match("/\/anime\/([0-9]+)/", $malLink, $matches) ? $matches[1] : null;
    if (!$malId) {
        continue;
    }
    $movies[] = [
        "trakt" => intval($traktId),
        "mal" => intval($malId),
    ];
}

//export JSON
file_put_contents("../trakt-movies.json", json_encode($movies));