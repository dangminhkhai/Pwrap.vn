<?php
/**
 * CẤU HÌNH CƠ SỞ DỮ LIỆU - VINFAST SPA CMS
 */

// Sử dụng SQLite cho bản chạy thử nhanh chóng, không cần cài đặt MySQL
define('DB_TYPE', 'sqlite'); 
define('DB_PATH', __DIR__ . '/../database.sqlite');

// Thông tin website
define('SITE_NAME', 'VinFast Spa');
define('SITE_URL', 'http://localhost:8000');
define('UPLOADS_DIR', __DIR__ . '/../uploads/');
define('UPLOADS_URL', SITE_URL . '/uploads/');

// Bảo mật
define('SESSION_NAME', 'vfspa_session');

// Bật/tắt hiển thị lỗi
define('DEBUG_MODE', true);

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Timezone
date_default_timezone_set('Asia/Ho_Chi_Minh');
