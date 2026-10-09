<?php

declare(strict_types=1);

$storagePath = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR.'antrein-storage';

foreach ([
    'app/private',
    'app/public',
    'framework/cache/data',
    'framework/sessions',
    'framework/testing',
    'framework/views',
    'logs',
] as $directory) {
    $path = $storagePath.DIRECTORY_SEPARATOR.$directory;

    if (! is_dir($path) && ! mkdir($path, 0775, true) && ! is_dir($path)) {
        throw new RuntimeException('Unable to prepare temporary Laravel storage.');
    }
}

$_ENV['LARAVEL_STORAGE_PATH'] = $storagePath;
$_SERVER['LARAVEL_STORAGE_PATH'] = $storagePath;
putenv('LARAVEL_STORAGE_PATH='.$storagePath);

require __DIR__.'/../public/index.php';
