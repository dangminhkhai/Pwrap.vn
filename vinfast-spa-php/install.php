<?php
/**
 * INSTALL SCRIPT - Tạo Database SQLite + Tài khoản Admin
 */

require_once __DIR__ . '/includes/config.php';

$message = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Kết nối SQLite (Tự động tạo file database.sqlite nếu chưa có)
        $pdo = new PDO("sqlite:" . DB_PATH, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);

        // Tạo bảng admins
        $pdo->exec("CREATE TABLE IF NOT EXISTS `admins` (
            `id` INTEGER PRIMARY KEY AUTOINCREMENT,
            `username` VARCHAR(100) NOT NULL UNIQUE,
            `password` VARCHAR(255) NOT NULL,
            `display_name` VARCHAR(100) NOT NULL DEFAULT 'Admin',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // Tạo bảng car_models (Được cập nhật thêm trường mô tả SEO & Banner như Next.js/Strapi)
        $pdo->exec("CREATE TABLE IF NOT EXISTS `car_models` (
            `id` INTEGER PRIMARY KEY AUTOINCREMENT,
            `name` VARCHAR(100) NOT NULL,
            `slug` VARCHAR(120) NOT NULL UNIQUE,
            `description` TEXT,
            `long_description` TEXT,
            `show_long_description` TINYINT(1) DEFAULT 0,
            `banner` VARCHAR(500),
            `is_hot` TINYINT(1) DEFAULT 0,
            `sort_order` INTEGER DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // Tạo bảng products
        $pdo->exec("CREATE TABLE IF NOT EXISTS `products` (
            `id` INTEGER PRIMARY KEY AUTOINCREMENT,
            `title` VARCHAR(255) NOT NULL,
            `slug` VARCHAR(255) NOT NULL UNIQUE,
            `short_description` TEXT,
            `description` TEXT,
            `price` VARCHAR(100),
            `image` VARCHAR(500),
            `car_model_id` INTEGER,
            `sort_order` INTEGER DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // Tạo bảng blogs
        $pdo->exec("CREATE TABLE IF NOT EXISTS `blogs` (
            `id` INTEGER PRIMARY KEY AUTOINCREMENT,
            `title` VARCHAR(255) NOT NULL,
            `slug` VARCHAR(255) NOT NULL UNIQUE,
            `seo_desc` VARCHAR(500),
            `content` TEXT,
            `cover` VARCHAR(500),
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // Tạo bảng leads
        $pdo->exec("CREATE TABLE IF NOT EXISTS `leads` (
            `id` INTEGER PRIMARY KEY AUTOINCREMENT,
            `name` VARCHAR(100) NOT NULL,
            `phone` VARCHAR(20) NOT NULL,
            `service_name` VARCHAR(255),
            `car_name` VARCHAR(100),
            `lead_status` VARCHAR(50) DEFAULT 'Chưa liên hệ',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // Tạo tài khoản admin mặc định
        $adminUser = $_POST['admin_user'] ?? 'admin';
        $adminPass = $_POST['admin_pass'] ?? 'admin123';
        $adminName = $_POST['admin_name'] ?? 'Quản trị viên';
        $hashedPass = password_hash($adminPass, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM admins WHERE username = ?");
        $stmt->execute([$adminUser]);
        if ($stmt->fetchColumn() == 0) {
            $stmt = $pdo->prepare("INSERT INTO admins (username, password, display_name) VALUES (?, ?, ?)");
            $stmt->execute([$adminUser, $hashedPass, $adminName]);
        }

        // Tạo dữ liệu mẫu - Dòng xe kèm mô tả dài (SEO)
        $carModels = [
            ['VinFast VF 3', 'vinfast-vf3', 'Dòng xe SUV điện mini cực kỳ cá tính của VinFast. Lựa chọn dán phim cách nhiệt và PPF bảo vệ để tối ưu trải nghiệm sử dụng.', '## Tư vấn nâng cấp phụ kiện cho VinFast VF3\n\nVinFast VF3 là mẫu xe điện cỡ nhỏ được rất nhiều khách hàng trẻ tuổi yêu thích. Để tối ưu hóa trải nghiệm lái xe và bảo vệ chiếc xe yêu quý, dưới đây là các gói nâng cấp khuyên dùng:\n\n### 1. Dán phim cách nhiệt 3M Crystalline\nDo diện tích kính của xe khá lớn so với tổng thể cabin, việc dán phim cách nhiệt cao cấp là tối quan trọng để giữ cabin mát mẻ, tiết kiệm điện năng cho hệ thống điều hòa.\n\n### 2. Dán PPF bảo vệ sơn ngoại thất\nLớp sơn nguyên bản của VF3 khá mỏng. Dán phim PPF TPU giúp chống xước dăm, đá bắn hiệu quả, giữ vẻ đẹp bóng bẩy như mới.', 1, null, 1, 1],
            ['VinFast VF 5', 'vinfast-vf5', 'Mẫu xe đô thị gầm cao VF5 rộng rãi, hiện đại. Nâng cấp các gói cách nhiệt và PPF nội ngoại thất chuyên nghiệp.', '## Tư vấn các gói chăm sóc xe VinFast VF5\n\nVinFast VF5 đang là dòng xe chạy dịch vụ và gia đình phổ biến nhất. Các gói dịch vụ thiết yếu giúp tối ưu công năng:\n\n### 1. Phim cách nhiệt chống nóng\nChống nóng hiệu quả giúp hành khách luôn dễ chịu.\n\n### 2. Dán PPF các chi tiết bóng trong nội thất\nBảo vệ các phần taplo dễ trầy xước trong quá trình sử dụng hàng ngày.', 1, null, 1, 2],
        ];

        $stmt = $pdo->prepare("INSERT OR IGNORE INTO car_models (name, slug, description, long_description, show_long_description, banner, is_hot, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($carModels as $car) {
            $stmt->execute($car);
        }

        // Tạo dữ liệu mẫu - Sản phẩm
        $sampleProducts = [
            ['Dán phim cách nhiệt 3M Crystalline - VF3', 'dan-phim-cach-nhiet-3m-crystalline-vf3', 'Phim cách nhiệt 3M Crystalline chống nóng lên đến 97% tia hồng ngoại, bảo vệ sức khỏe và nâng cao trải nghiệm lái xe.', '<h3>Quy trình thi công dán phim cách nhiệt 3M Crystalline:</h3><p>1. Vệ sinh kính xe chuyên sâu loại bỏ bụi bẩn.</p><p>2. Đo đạc và cắt phim theo phom kính xe VF3.</p><p>3. Sấy phom phim cách nhiệt ôm sát mặt cong của kính.</p><p>4. Thi công dán phim trong phòng kín tiêu chuẩn máy lạnh để tránh bụi.</p><p>5. Kiểm tra chất lượng bằng đèn hồng ngoại trước khi bàn giao.</p>', '5.500.000đ', null, 1, 1],
            ['Dán PPF bảo vệ sơn xe VF3', 'dan-ppf-bao-ve-son-vf3', 'Phim PPF TPU tự phục hồi xước, bảo vệ toàn diện lớp sơn gốc khỏi bụi đá, côn trùng, tia UV.', '<h3>Ưu điểm khi dán PPF TPU cho xe VF3:</h3><p>- Khả năng tự phục hồi các vết xước dăm khi gặp nhiệt độ cao.</p><p>- Chống ố vàng, kháng axit từ mưa và chất bẩn.</p><p>- Tăng độ bóng cho sơn xe lên đến 30%.</p>', '15.000.000đ', null, 1, 2],
            ['Dán phim cách nhiệt 3M Crystalline - VF5', 'dan-phim-cach-nhiet-3m-crystalline-vf5', 'Phim cách nhiệt 3M Crystalline cao cấp dành riêng cho VinFast VF 5, chống nóng tối ưu.', '<h3>Quy trình thi công tiêu chuẩn cho xe VF5:</h3><p>Được thực hiện bởi các kỹ thuật viên chuyên nghiệp với phòng dán phim khép kín tránh bụi tuyệt đối.</p>', '6.500.000đ', null, 2, 1],
            ['Dán PPF nội thất xe VF5', 'dan-ppf-noi-that-vf5', 'Bộ PPF nội thất bảo vệ taplo, tay nắm cửa, bệ cửa khỏi trầy xước.', '<h3>Bảo vệ không gian nội thất xe VF5:</h3><p>Chất liệu PPF siêu trong suốt giúp giữ nguyên vẻ đẹp nguyên bản của taplo bóng và màn hình giải trí, chống trầy tuyệt đối.</p>', '3.500.000đ', null, 2, 2],
        ];

        $stmt = $pdo->prepare("INSERT OR IGNORE INTO products (title, slug, short_description, description, price, image, car_model_id, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($sampleProducts as $p) {
            $stmt->execute($p);
        }

        // Tạo dữ liệu mẫu - Bài viết
        $sampleBlogs = [
            ['Hướng dẫn chọn phim cách nhiệt cho xe VinFast', 'huong-dan-chon-phim-cach-nhiet-vinfast', 'Tìm hiểu các tiêu chí quan trọng khi chọn phim cách nhiệt cho xe điện VinFast để đạt hiệu quả chống nóng tối ưu.', '<h3>1. Tại sao cần dán phim cách nhiệt?</h3><p>Phim cách nhiệt giúp giảm nhiệt độ trong xe lên đến 60%, tiết kiệm năng lượng điều hòa và bảo vệ nội thất xe khỏi tia UV.</p><h3>2. Các loại phim cách nhiệt phổ biến</h3><p>Hiện nay có 3 loại chính: phim nhuộm màu, phim kim loại, và phim ceramic. Trong đó, phim 3M Crystalline thuộc dòng ceramic cao cấp nhất.</p>'],
            ['PPF là gì? Có nên dán PPF cho xe VinFast?', 'ppf-la-gi-co-nen-dan-ppf-vinfast', 'Tổng hợp kiến thức về phim bảo vệ sơn PPF, ưu nhược điểm và chi phí dán PPF cho các dòng xe VinFast.', '<h3>PPF là gì?</h3><p>PPF (Paint Protection Film) là lớp phim trong suốt dán lên bề mặt sơn xe, có khả năng tự phục hồi các vết xước nhỏ dưới tác dụng của nhiệt.</p><h3>Có nên dán PPF?</h3><p>Nếu bạn muốn bảo vệ giá trị xe và giữ lớp sơn nguyên bản, PPF là giải pháp tối ưu nhất hiện nay.</p>'],
        ];

        $stmt = $pdo->prepare("INSERT OR IGNORE INTO blogs (title, slug, seo_desc, content) VALUES (?, ?, ?, ?)");
        foreach ($sampleBlogs as $b) {
            $stmt->execute($b);
        }

        // Tạo thư mục uploads
        if (!is_dir(UPLOADS_DIR)) {
            mkdir(UPLOADS_DIR, 0755, true);
        }

        $success = true;
        $message = '✅ Cài đặt thành công! Bạn có thể đăng nhập trang quản trị tại <a href="admin/">Trang quản trị</a>';

    } catch (PDOException $e) {
        $message = '❌ Lỗi: ' . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cài đặt - VinFast Spa CMS</title>
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Be Vietnam Pro', sans-serif; }
        body { background: #08080a; color: #f5f5f7; min-height: 100vh; display: flex; align-items: center; justify-content: center;
            background-image: radial-gradient(circle at 10% 20%, rgba(255, 61, 0, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(255, 183, 0, 0.03) 0%, transparent 40%); }
        .install-card { background: rgba(20, 20, 25, 0.85); border: 1px solid rgba(255,255,255,0.06); border-radius: 28px; padding: 3rem; width: 95%; max-width: 500px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
        .install-card h1 { font-size: 1.8rem; font-weight: 800; background: linear-gradient(135deg, #ff5c28 30%, #ffb700); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; text-align: center; }
        .install-card p.sub { color: #a1a1a6; font-size: 0.9rem; text-align: center; margin-bottom: 2rem; }
        .form-group { margin-bottom: 1.25rem; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #a1a1a6; margin-bottom: 0.5rem; }
        .form-group input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); color: #f5f5f7; padding: 0.8rem 1rem; border-radius: 12px; font-size: 0.95rem; transition: all 0.25s; }
        .form-group input:focus { outline: none; border-color: #ff5c28; box-shadow: 0 0 10px rgba(255,61,0,0.15); background: rgba(255,255,255,0.05); }
        .btn-install { width: 100%; background: linear-gradient(135deg, #ff3d00, #ff5c28); color: white; border: none; padding: 0.9rem; border-radius: 14px; font-size: 1rem; font-weight: 700; cursor: pointer; margin-top: 0.5rem; transition: all 0.3s; }
        .btn-install:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255,61,0,0.3); }
        .message { margin-top: 1.5rem; padding: 1rem; border-radius: 12px; font-size: 0.9rem; text-align: center; }
        .message.success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #10b981; }
        .message.error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; }
        .message a { color: #ff5c28; text-decoration: none; font-weight: 700; }
        .message a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="install-card">
        <h1>⚡ VinFast Spa CMS</h1>
        <p class="sub">Cài đặt hệ thống (Bản SQLite chạy ngay)</p>

        <?php if ($success): ?>
            <div class="message success"><?= $message ?></div>
        <?php else: ?>
            <form method="POST">
                <div class="form-group">
                    <label>Tên đăng nhập Admin</label>
                    <input type="text" name="admin_user" value="admin" required>
                </div>
                <div class="form-group">
                    <label>Mật khẩu Admin</label>
                    <input type="password" name="admin_pass" value="admin123" required>
                </div>
                <div class="form-group">
                    <label>Tên hiển thị</label>
                    <input type="text" name="admin_name" value="Quản trị viên" required>
                </div>
                <button type="submit" class="btn-install">🚀 Khởi tạo cơ sở dữ liệu</button>
            </form>
        <?php endif; ?>
    </div>
</body>
</html>
