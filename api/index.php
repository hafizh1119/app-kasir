<?php

// Vercel hanya mengizinkan tulis ke /tmp
foreach (['framework/views', 'framework/cache', 'framework/sessions', 'logs'] as $d) {
    if (! is_dir("/tmp/storage/$d")) {
        mkdir("/tmp/storage/$d", 0777, true);
    }
}

require __DIR__ . '/../public/index.php';