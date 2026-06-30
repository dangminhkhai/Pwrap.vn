<?php
/**
 * QUẢN LÝ DÒNG XE (CAR MODELS) - VINFAST SPA CMS
 */
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';

session_name(SESSION_NAME);
session_start();

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

$db = Database::getInstance();
$toastMessage = '';
$toastType = 'success';

// Xử lý Thêm dòng xe
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_car') {
    $name = trim($_POST['name'] ?? '');
    $slug = trim($_POST['slug'] ?? '');
    $is_hot = isset($_POST['is_hot']) ? 1 : 0;
    $sort_order = intval($_POST['sort_order'] ?? 0);

    if (empty($name) || empty($slug)) {
        $toastMessage = 'Vui lòng nhập đầy đủ tên và slug.';
        $toastType = 'error';
    } else {
        // Tạo slug tự động nếu trùng lặp
        try {
            $db->execute("INSERT INTO car_models (name, slug, is_hot, sort_order) VALUES (?, ?, ?, ?)", [$name, $slug, $is_hot, $sort_order]);
            $toastMessage = 'Đã thêm dòng xe mới thành công!';
            $toastType = 'success';
        } catch (Exception $e) {
            $toastMessage = 'Lỗi: Slug đã tồn tại.';
            $toastType = 'error';
        }
    }
}

// Xử lý Cập nhật dòng xe
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'edit_car') {
    $id = intval($_POST['id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $slug = trim($_POST['slug'] ?? '');
    $is_hot = isset($_POST['is_hot']) ? 1 : 0;
    $sort_order = intval($_POST['sort_order'] ?? 0);

    if ($id > 0 && !empty($name) && !empty($slug)) {
        try {
            $db->execute("UPDATE car_models SET name = ?, slug = ?, is_hot = ?, sort_order = ? WHERE id = ?", [$name, $slug, $is_hot, $sort_order, $id]);
            $toastMessage = 'Đã cập nhật dòng xe thành công!';
            $toastType = 'success';
        } catch (Exception $e) {
            $toastMessage = 'Lỗi: Slug đã tồn tại ở dòng xe khác.';
            $toastType = 'error';
        }
    }
}

// Xử lý Xóa dòng xe
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete_car') {
    $id = intval($_POST['id'] ?? 0);
    if ($id > 0) {
        $db->execute("DELETE FROM car_models WHERE id = ?", [$id]);
        $toastMessage = 'Đã xóa dòng xe.';
        $toastType = 'success';
    }
}

// Lấy danh sách dòng xe
$carModels = $db->fetchAll("SELECT * FROM car_models ORDER BY sort_order ASC");
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản lý Dòng xe - <?= SITE_NAME ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="admin-body">

    <!-- Sidebar -->
    <aside class="admin-sidebar">
        <div class="sidebar-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--admin-primary-light)"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/><path d="m9 12 2 2 4-4"/></svg>
            VINFAST <span>SPA</span>
        </div>
        <nav class="sidebar-nav">
            <a href="index.php" class="sidebar-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                Dashboard & Leads
            </a>
            <a href="car-models.php" class="sidebar-link active">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                Quản lý Dòng xe
            </a>
            <a href="products.php" class="sidebar-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                Quản lý Sản phẩm
            </a>
            <a href="blogs.php" class="sidebar-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                Bài viết Cẩm nang
            </a>
            <div style="margin-top: auto; padding-top: 2rem;">
                <a href="logout.php" class="sidebar-link" style="color: var(--admin-danger);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                    Đăng xuất
                </a>
            </div>
        </nav>
    </aside>

    <!-- Main Content Area -->
    <div class="admin-main">
        <header class="admin-topbar">
            <div class="topbar-title">Quản lý các Dòng xe VinFast</div>
            <div class="topbar-user">
                Xin chào, <strong><?= htmlspecialchars($_SESSION['admin_name']) ?></strong>
            </div>
        </header>

        <div class="admin-content">
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: start;">
                
                <!-- Bảng danh sách dòng xe -->
                <div class="content-card">
                    <div class="card-header">
                        <h3>Danh sách dòng xe hiện tại</h3>
                    </div>
                    <div class="table-responsive">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Thứ tự</th>
                                    <th>Tên dòng xe</th>
                                    <th>Slug</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($carModels as $car): ?>
                                    <tr>
                                        <td><?= $car['sort_order'] ?></td>
                                        <td><strong><?= htmlspecialchars($car['name']) ?></strong></td>
                                        <td><code><?= htmlspecialchars($car['slug']) ?></code></td>
                                        <td>
                                            <?php if ($car['is_hot']): ?>
                                                <span class="badge-pending">Nổi bật (HOT)</span>
                                            <?php else: ?>
                                                <span class="badge-closed">Bình thường</span>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <button 
                                                onclick="editCar(<?= htmlspecialchars(json_encode($car)) ?>)" 
                                                class="btn-outline" 
                                                style="padding: 0.35rem 0.6rem; font-size: 0.75rem; border-radius: 8px; margin-right: 0.25rem;"
                                            >
                                                Sửa
                                            </button>
                                            <form method="POST" onsubmit="return confirm('Xóa dòng xe sẽ mất các liên kết sản phẩm. Bạn muốn tiếp tục?');" style="display: inline;">
                                                <input type="hidden" name="action" value="delete_car">
                                                <input type="hidden" name="id" value="<?= $car['id'] ?>">
                                                <button type="submit" class="btn-danger" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; border-radius: 8px;">Xóa</button>
                                            </form>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Form Thêm / Sửa -->
                <div class="content-card">
                    <div class="card-header">
                        <h3 id="formTitle">Thêm dòng xe mới</h3>
                    </div>
                    <form method="POST" id="carForm" style="padding: 1rem 0;">
                        <input type="hidden" name="action" id="formAction" value="add_car">
                        <input type="hidden" name="id" id="carId" value="">

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label>Tên dòng xe</label>
                            <input type="text" name="name" id="carName" class="form-input" placeholder="Ví dụ: VinFast VF 3" required oninput="generateSlug(this.value)">
                        </div>

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label>Slug (Đường dẫn tĩnh)</label>
                            <input type="text" name="slug" id="carSlug" class="form-input" placeholder="Ví dụ: vinfast-vf3" required>
                        </div>

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label>Thứ tự hiển thị</label>
                            <input type="number" name="sort_order" id="carSortOrder" class="form-input" value="0" required>
                        </div>

                        <div class="form-group" style="margin-bottom: 1.5rem; flex-direction: row; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" name="is_hot" id="carIsHot" style="width: 16px; height: 16px; cursor: pointer;">
                            <label for="carIsHot" style="cursor: pointer; margin-bottom: 0;">Đánh dấu là dòng xe nổi bật (HOT)</label>
                        </div>

                        <div style="display: flex; gap: 0.75rem;">
                            <button type="submit" class="btn-primary" style="flex-grow: 1; padding: 0.8rem;">Lưu thông tin</button>
                            <button type="button" onclick="cancelEdit()" id="btnCancel" class="btn-outline" style="display: none; padding: 0.8rem;">Hủy</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <?php if ($toastMessage): ?>
        <div id="toast" class="toast toast-<?= $toastType ?>">
            <?= htmlspecialchars($toastMessage) ?>
        </div>
        <script>
            setTimeout(() => {
                const toast = document.getElementById('toast');
                if (toast) {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateY(20px)';
                    setTimeout(() => toast.remove(), 300);
                }
            }, 3000);
        </script>
    <?php endif; ?>

    <script>
    function generateSlug(text) {
        if (document.getElementById('formAction').value === 'edit_car') return; // Không đổi slug khi sửa
        const slug = text.toLowerCase()
            .replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ần|ẩ|ẫ|ậ/g, 'a')
            .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, 'e')
            .replace(/í|ì|ỉ|ĩ|ị/g, 'i')
            .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, 'o')
            .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ỡ|ự/g, 'u')
            .replace(/ý|ỳ|ỷ|ỹ|ỵ/g, 'y')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        document.getElementById('carSlug').value = slug;
    }

    function editCar(car) {
        document.getElementById('formTitle').textContent = 'Chỉnh sửa dòng xe: ' + car.name;
        document.getElementById('formAction').value = 'edit_car';
        document.getElementById('carId').value = car.id;
        document.getElementById('carName').value = car.name;
        document.getElementById('carSlug').value = car.slug;
        document.getElementById('carSortOrder').value = car.sort_order;
        document.getElementById('carIsHot').checked = car.is_hot == 1;
        document.getElementById('btnCancel').style.display = 'inline-block';
    }

    function cancelEdit() {
        document.getElementById('formTitle').textContent = 'Thêm dòng xe mới';
        document.getElementById('formAction').value = 'add_car';
        document.getElementById('carId').value = '';
        document.getElementById('carForm').reset();
        document.getElementById('btnCancel').style.display = 'none';
    }
    </script>

</body>
</html>
