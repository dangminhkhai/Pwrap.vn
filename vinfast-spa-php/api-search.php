<?php
/**
 * API tìm kiếm sản phẩm và bài viết (GET)
 */
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/includes/db.php';

$q = trim($_GET['q'] ?? '');

if (mb_strlen($q) < 2) {
    echo json_encode(['products' => [], 'blogs' => []]);
    exit;
}

$db = Database::getInstance();
$searchTerm = '%' . $q . '%';

// Tìm sản phẩm
$products = $db->fetchAll(
    "SELECT p.title, p.slug, cm.name AS car_name, cm.slug AS car_slug 
     FROM products p 
     LEFT JOIN car_models cm ON p.car_model_id = cm.id 
     WHERE p.title LIKE ? OR cm.name LIKE ? 
     LIMIT 8",
    [$searchTerm, $searchTerm]
);

// Tìm bài viết
$blogs = $db->fetchAll(
    "SELECT title, slug, seo_desc 
     FROM blogs 
     WHERE title LIKE ? OR seo_desc LIKE ? 
     LIMIT 5",
    [$searchTerm, $searchTerm]
);

// Tạo URL
foreach ($products as &$p) {
    $p['url'] = SITE_URL . '/product.php?slug=' . urlencode($p['slug']);
}

foreach ($blogs as &$b) {
    $b['url'] = SITE_URL . '/blog.php?slug=' . urlencode($b['slug']);
}

echo json_encode(['products' => $products, 'blogs' => $blogs], JSON_UNESCAPED_UNICODE);
