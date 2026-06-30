<?php
require_once __DIR__ . '/db.php';
$db = Database::getInstance();

// Lấy danh sách dòng xe cho menu header
$carModels = $db->fetchAll("SELECT id, name, slug, is_hot FROM car_models ORDER BY sort_order ASC");

// Xác định trang hiện tại
$currentPage = basename($_SERVER['SCRIPT_NAME'], '.php');
?>
<!DOCTYPE html>
<html lang="vi" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($pageTitle) ? htmlspecialchars($pageTitle) . ' | ' . SITE_NAME : SITE_NAME . ' - Chăm sóc & Nâng cấp xe VinFast' ?></title>
    <meta name="description" content="<?= isset($pageDesc) ? htmlspecialchars($pageDesc) : 'Hệ thống chăm sóc & nâng cấp xe điện VinFast chuyên nghiệp. Dán phim cách nhiệt 3M, PPF bảo vệ sơn, phủ Ceramic.' ?>">
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <!-- Header chuẩn theo cấu trúc của style.css -->
    <header class="header">
        <div class="header-inner">
            
            <!-- Logo -->
            <a href="index.php" class="header-logo">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary)"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/><path d="m9 12 2 2 4-4"/></svg>
                <div>
                    <span class="header-logo-text">VINFAST <strong>SPA</strong></span>
                    <span class="header-logo-sub">CHĂM SÓC XE CHUYÊN NGHIỆP</span>
                </div>
            </a>

            <!-- Điều hướng chính -->
            <nav class="nav">
                <a href="index.php" class="nav-link <?= $currentPage === 'index' ? 'active' : '' ?>">
                    Trang chủ
                </a>
                <div class="nav-dropdown-container">
                    <span class="nav-link dropdown-trigger">
                        Danh mục xe
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="dropdown-icon"><path d="m6 9 6 6 6-6"/></svg>
                    </span>
                    <div class="nav-dropdown-menu">
                        <?php foreach ($carModels as $car): ?>
                            <a href="car.php?slug=<?= urlencode($car['slug']) ?>" class="dropdown-item"><?= htmlspecialchars($car['name']) ?></a>
                        <?php endforeach; ?>
                    </div>
                </div>
            </nav>

            <!-- Thanh tìm kiếm & Actions -->
            <div class="header-actions">
                <div class="search-container">
                    <div class="search-input-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        <input type="text" class="search-input" id="globalSearch" placeholder="Tìm kiếm sản phẩm..." autocomplete="off">
                    </div>
                    <div class="search-results" id="searchResults"></div>
                </div>
                
                <button class="btn-theme-toggle" id="themeToggle" aria-label="Đổi giao diện">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" id="themeIcon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                </button>
                
                <button class="btn-mobile-menu" id="mobileMenuBtn" aria-label="Menu">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                </button>
            </div>

        </div>
    </header>

    <!-- Mobile Menu Drawer -->
    <div class="mobile-menu-drawer" id="mobileDrawer" style="display: none;">
        <div class="mobile-nav-links">
            <a href="index.php" class="mobile-nav-link">Trang chủ</a>
            <div class="mobile-nav-group">
                <span class="mobile-nav-group-title">Danh mục dòng xe</span>
                <div class="mobile-nav-grid">
                    <?php foreach ($carModels as $car): ?>
                        <a href="car.php?slug=<?= urlencode($car['slug']) ?>" class="mobile-category-link">
                            <?= htmlspecialchars($car['name']) ?>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </a>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>

    <main class="main-container">
