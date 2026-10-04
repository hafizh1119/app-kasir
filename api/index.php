<?php

// Vercel hanya mengizinkan tulis ke /tmp
foreach (['framework/views', 'framework/cache', 'framework/sessions', 'logs'] as $d) {
    if (! is_dir("/tmp/storage/$d")) {
        mkdir("/tmp/storage/$d", 0777, true);
    }
}

// Sajikan file statis (hasil build Vite) langsung dari PHP
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$root = realpath(__DIR__ . '/../public');
$file = $root ? realpath($root . $path) : false;

if ($file && str_starts_with($file, $root . DIRECTORY_SEPARATOR)
    && is_file($file) && ! str_ends_with($file, '.php')) {
    $types = [
        'js'    => 'application/javascript',
        'css'   => 'text/css',
        'svg'   => 'image/svg+xml',
        'png'   => 'image/png',
        'jpg'   => 'image/jpeg',
        'ico'   => 'image/x-icon',
        'woff'  => 'font/woff',
        'woff2' => 'font/woff2',
        'json'  => 'application/json',
    ];
    header('Content-Type: ' . ($types[pathinfo($file, PATHINFO_EXTENSION)] ?? 'application/octet-stream'));
    header('Cache-Control: public, max-age=31536000, immutable');
    readfile($file);
    exit;
}

require __DIR__ . '/../public/index.php';