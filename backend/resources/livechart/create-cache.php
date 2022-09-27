<?php

// TODO: build a nosql database solution for this

echo "Creating livechart cache file...\n";
$outputFileHandler = fopen('../livechart.json', 'w');
$files = glob('animes-*.json');
$allAnimes = [];
foreach ($files as $file) {
    $fileHandler = fopen($file, 'r');
    $fileContent = fread($fileHandler, filesize($file));
    $animes = json_decode($fileContent, true);
    foreach ($animes as $anime) {
        if (isset($anime["mal"])) {
            $allAnimes[0 + $anime["mal"]] = $anime;
        }
    }
}
ksort($allAnimes);
fwrite($outputFileHandler, json_encode($allAnimes));
echo "Done\n";
