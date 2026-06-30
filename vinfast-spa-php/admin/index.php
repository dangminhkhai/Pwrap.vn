<?php
/**
 * DASHBOARD & QUẢN LÝ LEADS - VINFAST SPA CMS
 */
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';

session_name(SESSION_NAME);
session_start();

// Kiểm tra đăng nhập
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

$db = Database::getInstance();
$toastMessage = '';
$toastType = 'success';

// Xử lý cập nhật trạng thái Lead (Đăng ký tư vấn)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_lead_status') {
    $leadId = intval($_POST['lead_id'] ?? 0);
    $newStatus = trim($_POST['lead_status'] ?? '');

    if ($leadId > 0 && in_array($newStatus, ['Chưa liên hệ', 'Đã tư vấn', 'Đã chốt dịch vụ'])) {
        $db->execute("UPDATE leads SET lead_status = ? WHERE id = ?", [$newStatus, $leadId]);
        $toastMessage = 'Cập nhật trạng thái khách hàng thành công!';
        $toastType = 'success';
    } else {
        $toastMessage = 'Dữ liệu không hợp lệ.';
        $toastType = 'error';
    }
}

// Xử lý xóa Lead
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete_lead') {
    $leadId = intval($_POST['lead_id'] ?? 0);
    if ($leadId > 0) {
        $db->execute("DELETE FROM leads WHERE id = ?", [$leadId]);
        $toastMessage = 'Đã xóa thông tin đăng ký tư vấn.';
        $toastType = 'success';
    }
}

// Thống kê tổng số
$stats = [
    'total_leads' => $db->count("SELECT COUNT(*) FROM leads"),
    'pending_leads' => $db->count("SELECT COUNT(*) FROM leads WHERE lead_status = 'Chưa liên hệ'"),
    'done_leads' => $db->count("SELECT COUNT(*) FROM leads WHERE lead_status = 'Đã tư vấn'"),
    'success_leads' => $db->count("SELECT COUNT(*) FROM leads WHERE lead_status = 'Đã chốt dịch vụ'"),
    'total_cars' => $db->count("SELECT COUNT(*) FROM car_models"),
    'total_products' => $db->count("SELECT COUNT(*) FROM products"),
    'total_blogs' => $db->count("SELECT COUNT(*) FROM blogs"),
];

// Lấy danh sách leads mới nhất
$leads = $db->fetchAll("SELECT * FROM leads ORDER BY created_at DESC");
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CMS Dashboard - <?= SITE_NAME ?></title>
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
            <a href="index.php" class="sidebar-link active">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                Dashboard & Leads
            </a>
            <a href="car-models.php" class="sidebar-link">
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
            <div class="topbar-title">Dashboard & Quản lý Đăng ký tư vấn</div>
            <div class="topbar-user">
                Xin chào, <strong><?= htmlspecialchars($_SESSION['admin_name']) ?></strong>
            </div>
        </header>

        <div class="admin-content">
            <!-- Thống kê Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(255, 61, 0, 0.1); color: var(--admin-primary);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <div class="stat-value"><?= $stats['total_leads'] ?></div>
                    <div class="stat-label">Tổng số đăng ký</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: var(--admin-warning);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    </div>
                    <div class="stat-value"><?= $stats['pending_leads'] ?></div>
                    <div class="stat-label">Chưa liên hệ</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--admin-success);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <div class="stat-value"><?= $stats['success_leads'] ?></div>
                    <div class="stat-label">Đã chốt dịch vụ</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(255, 183, 0, 0.1); color: var(--admin-accent);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/></svg>
                    </div>
                    <div class="stat-value"><?= $stats['total_products'] ?></div>
                    <div class="stat-label">Sản phẩm & Dịch vụ</div>
                </div>
            </div>

            <!-- Bảng quản lý đăng ký tư vấn -->
            <div class="content-card">
                <div class="card-header">
                    <h3>Danh sách khách hàng đăng ký tư vấn</h3>
                </div>
                <div class="table-responsive">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Khách hàng</th>
                                <th>Số điện thoại</th>
                                <th>Dịch vụ đăng ký</th>
                                <th>Dòng xe</th>
                                <th>Thời gian</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (count($leads) === 0): ?>
                                <tr>
                                    <td colspan="8" style="text-align: center; color: var(--admin-text-muted); padding: 3rem 0;">Chưa có lượt đăng ký tư vấn nào.</td>
                                </tr>
                            <?php else: ?>
                                <?php foreach ($leads as $lead): ?>
                                    <tr>
                                        <td>#<?= $lead['id'] ?></td>
                                        <td><strong><?= htmlspecialchars($lead['name']) ?></strong></td>
                                        <td>
                                            <a href="tel:<?= htmlspecialchars($lead['phone']) ?>" style="color: var(--admin-primary-light); text-decoration: none; font-weight: 600;">
                                                <?= htmlspecialchars($lead['phone']) ?>
                                            </a>
                                        </td>
                                        <td><?= htmlspecialchars($lead['service_name']) ?></td>
                                        <td><span class="car-badge"><?= htmlspecialchars($lead['car_name']) ?></span></td>
                                        <td style="font-size: 0.8rem; color: var(--admin-text-muted);"><?= date('d/m/Y H:i', strtotime($lead['created_at'])) ?></td>
                                        <td>
                                            <!-- Widget đổi trạng thái trực tiếp và lưu bằng nút -->
                                            <form method="POST" style="display: flex; align-items: center; gap: 0.5rem;">
                                                <input type="hidden" name="action" value="update_lead_status">
                                                <input type="hidden" name="lead_id" value="<?= $lead['id'] ?>">
                                                <select name="lead_status" class="form-select" style="padding: 0.35rem 0.5rem; font-size: 0.8rem; width: 130px;">
                                                    <option value="Chưa liên hệ" <?= $lead['lead_status'] === 'Chưa liên hệ' ? 'selected' : '' ?>>Chưa liên hệ</option>
                                                    <option value="Đã tư vấn" <?= $lead['lead_status'] === 'Đã tư vấn' ? 'selected' : '' ?>>Đã tư vấn</option>
                                                    <option value="Đã chốt dịch vụ" <?= $lead['lead_status'] === 'Đã chốt dịch vụ' ? 'selected' : '' ?>>Đã chốt dịch vụ</option>
                                                </select>
                                                <button type="submit" class="btn-primary" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; border-radius: 8px;">Lưu</button>
                                            </form>
                                        </td>
                                        <td>
                                            <form method="POST" onsubmit="return confirm('Bạn có chắc chắn muốn xóa lượt đăng ký này?');" style="display: inline;">
                                                <input type="hidden" name="action" value="delete_lead">
                                                <input type="hidden" name="lead_id" value="<?= $lead['id'] ?>">
                                                <button type="submit" class="btn-danger" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; border-radius: 8px; display: inline-flex; align-items: center; gap: 0.2rem;">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                                    Xóa
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
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

</body>
</html>
