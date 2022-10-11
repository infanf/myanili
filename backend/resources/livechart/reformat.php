<?php
$filename = $argv[1];
$filepath = getcwd() . '/' . $filename;
$fileHandler = fopen($filepath, 'r');
$fileContent = fread($fileHandler, filesize($filepath));
fclose($fileHandler);
$animes = json_decode($fileContent, true);
function cmp($a, $b) {
    return $a["_key"] - $b["_key"];
}
usort($animes, "cmp");
$fileHandler = fopen($filepath, 'w');
fwrite($fileHandler, json_encode($animes, JSON_PRETTY_PRINT));
fclose($fileHandler);
