<?php
/**
 * QUẢN LÝ SẢN PHẨM & DỊCH VỤ (PRODUCTS) - VINFAST SPA CMS
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

// Xử lý ảnh tải lên
function handleImageUpload() {
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['image']['tmp_name'];
        $fileName = $_FILES['image']['name'];
        $fileSize = $_FILES['image']['size'];
        $fileType = $_FILES['image']['type'];
        
        $fileNameCmps = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));
        
        $allowedExtensions = ['jpg', 'gif', 'png', 'jpeg', 'webp'];
        
        if (in_array($fileExtension, $allowedExtensions)) {
            $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
            $uploadFileDir = UPLOADS_DIR;
            
            if(!is_dir($uploadFileDir)) {
                mkdir($uploadFileDir, 0755, true);
            }
            
            $dest_path = $uploadFileDir . $newFileName;
            
            if(move_uploaded_file($fileTmpPath, $dest_path)) {
                return $newFileName;
            }
        }
    }
    return null;
}

// Xử lý Thêm sản phẩm
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_product') {
    $title = trim($_POST['title'] ?? '');
    $slug = trim($_POST['slug'] ?? '');
    $short_description = trim($_POST['short_description'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $price = trim($_POST['price'] ?? '');
    $car_model_id = intval($_POST['car_model_id'] ?? 0);
    $sort_order = intval($_POST['sort_order'] ?? 0);
    
    $image = handleImageUpload();

    if (empty($title) || empty($slug) || $car_model_id <= 0) {
        $toastMessage = 'Vui lòng nhập đầy đủ tiêu đề, slug và chọn dòng xe.';
        $toastType = 'error';
    } else {
        try {
            $db->execute(
                "INSERT INTO products (title, slug, short_description, description, price, image, car_model_id, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [$title, $slug, $short_description, $description, $price, $image, $car_model_id, $sort_order]
            );
            $toastMessage = 'Đã thêm sản phẩm mới thành công!';
            $toastType = 'success';
        } catch (Exception $e) {
            $toastMessage = 'Lỗi: Slug đã tồn tại ở sản phẩm khác.';
            $toastType = 'error';
        }
    }
}

// Xử lý Cập nhật sản phẩm
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'edit_product') {
    $id = intval($_POST['id'] ?? 0);
    $title = trim($_POST['title'] ?? '');
    $slug = trim($_POST['slug'] ?? '');
    $short_description = trim($_POST['short_description'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $price = trim($_POST['price'] ?? '');
    $car_model_id = intval($_POST['car_model_id'] ?? 0);
    $sort_order = intval($_POST['sort_order'] ?? 0);
    
    $newImage = handleImageUpload();

    if ($id > 0 && !empty($title) && !empty($slug) && $car_model_id > 0) {
        try {
            if ($newImage) {
                // Lấy ảnh cũ để xóa
                $old = $db->fetchOne("SELECT image FROM products WHERE id = ?", [$id]);
                if ($old && $old['image'] && file_exists(UPLOADS_DIR . $old['image'])) {
                    unlink(UPLOADS_DIR . $old['image']);
                }
                $db->execute(
                    "UPDATE products SET title = ?, slug = ?, short_description = ?, description = ?, price = ?, image = ?, car_model_id = ?, sort_order = ? WHERE id = ?",
                    [$title, $slug, $short_description, $description, $price, $newImage, $car_model_id, $sort_order, $id]
                );
            } else {
                $db->execute(
                    "UPDATE products SET title = ?, slug = ?, short_description = ?, description = ?, price = ?, car_model_id = ?, sort_order = ? WHERE id = ?",
                    [$title, $slug, $short_description, $description, $price, $car_model_id, $sort_order, $id]
                );
            }
            $toastMessage = 'Đã cập nhật sản phẩm thành công!';
            $toastType = 'success';
        } catch (Exception $e) {
            $toastMessage = 'Lỗi: Slug đã tồn tại ở sản phẩm khác.';
            $toastType = 'error';
        }
    }
}

// Xử lý Xóa sản phẩm
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete_product') {
    $id = intval($_POST['id'] ?? 0);
    if ($id > 0) {
        $old = $db->fetchOne("SELECT image FROM products WHERE id = ?", [$id]);
        if ($old && $old['image'] && file_exists(UPLOADS_DIR . $old['image'])) {
            unlink(UPLOADS_DIR . $old['image']);
        }
        $db->execute("DELETE FROM products WHERE id = ?", [$id]);
        $toastMessage = 'Đã xóa sản phẩm.';
        $toastType = 'success';
    }
}

// Lấy danh sách sản phẩm
$products = $db->fetchAll("
    SELECT p.*, cm.name AS car_name 
    FROM products p 
    LEFT JOIN car_models cm ON p.car_model_id = cm.id 
    ORDER BY p.car_model_id ASC, p.sort_order ASC
");

// Lấy danh sách dòng xe cho dropdown select
$carModels = $db->fetchAll("SELECT id, name FROM car_models ORDER BY sort_order ASC");
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản lý Sản phẩm - <?= SITE_NAME ?></title>
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
            <a href="car-models.php" class="sidebar-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                Quản lý Dòng xe
            </a>
            <a href="products.php" class="sidebar-link active">
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
            <div class="topbar-title">Quản lý các Gói sản phẩm & Dịch vụ</div>
            <div class="topbar-user">
                Xin chào, <strong><?= htmlspecialchars($_SESSION['admin_name']) ?></strong>
            </div>
        </header>

        <div class="admin-content">
            <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 2rem; align-items: start;">
                
                <!-- Danh sách sản phẩm -->
                <div class="content-card">
                    <div class="card-header">
                        <h3>Danh sách sản phẩm hiện có</h3>
                    </div>
                    <div class="table-responsive">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Ảnh</th>
                                    <th>Tên gói sản phẩm</th>
                                    <th>Dòng xe</th>
                                    <th>Giá gói</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (count($products) === 0): ?>
                                    <tr>
                                        <td colspan="5" style="text-align: center; color: var(--admin-text-muted); padding: 3rem 0;">Chưa có sản phẩm nào. Hãy tạo mới bên phải.</td>
                                    </tr>
                                <?php else: ?>
                                    <?php foreach ($products as $p): ?>
                                        <tr>
                                            <td>
                                                <img 
                                                    src="<?= $p['image'] ? UPLOADS_URL . htmlspecialchars($p['image']) : 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=100&q=80' ?>" 
                                                    alt="" 
                                                    style="width: 60px; height: 45px; object-fit: cover; border-radius: 6px; border: 1px solid var(--admin-border);"
                                                >
                                            </td>
                                            <td>
                                                <strong><?= htmlspecialchars($p['title']) ?></strong>
                                                <div style="font-size: 0.75rem; color: var(--admin-text-muted);">Slug: <code><?= htmlspecialchars($p['slug']) ?></code></div>
                                            </td>
                                            <td><span class="car-badge"><?= htmlspecialchars($p['car_name']) ?></span></td>
                                            <td style="color: var(--admin-accent); font-weight: 700;"><?= htmlspecialchars($p['price'] ?: 'Liên hệ') ?></td>
                                            <td>
                                                <button 
                                                    onclick="editProduct(<?= htmlspecialchars(json_encode($p)) ?>)" 
                                                    class="btn-outline" 
                                                    style="padding: 0.35rem 0.6rem; font-size: 0.75rem; border-radius: 8px; margin-right: 0.25rem;"
                                                >
                                                    Sửa
                                                </button>
                                                <form method="POST" onsubmit="return confirm('Bạn có chắc chắn muốn xóa sản phẩm này?');" style="display: inline;">
                                                    <input type="hidden" name="action" value="delete_product">
                                                    <input type="hidden" name="id" value="<?= $p['id'] ?>">
                                                    <button type="submit" class="btn-danger" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; border-radius: 8px;">Xóa</button>
                                                </form>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Form Thêm / Sửa sản phẩm -->
                <div class="content-card">
                    <div class="card-header">
                        <h3 id="formTitle">Thêm sản phẩm mới</h3>
                    </div>
                    <form method="POST" id="productForm" enctype="multipart/form-data" style="padding: 1rem 0;">
                        <input type="hidden" name="action" id="formAction" value="add_product">
                        <input type="hidden" name="id" id="productId" value="">

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label>Tên gói sản phẩm</label>
                            <input type="text" name="title" id="productTitle" class="form-input" placeholder="Ví dụ: Dán phim cách nhiệt 3M Crystalline" required oninput="generateSlug(this.value)">
                        </div>

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label>Slug (Đường dẫn tĩnh)</label>
                            <input type="text" name="slug" id="productSlug" class="form-input" placeholder="Ví dụ: dan-phim-cach-nhiet-3m-crystalline" required>
                        </div>

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label>Dòng xe áp dụng</label>
                            <select name="car_model_id" id="productCarModelId" class="form-select" required>
                                <option value="">-- Chọn dòng xe VinFast --</option>
                                <?php foreach ($carModels as $car): ?>
                                    <option value="<?= $car['id'] ?>"><?= htmlspecialchars($car['name']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label>Giá gói hiển thị</label>
                            <input type="text" name="price" id="productPrice" class="form-input" placeholder="Ví dụ: 15.000.000đ hoặc Liên hệ">
                        </div>

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label>Ảnh sản phẩm</label>
                            <input type="file" name="image" id="productImage" class="form-input">
                            <div id="imagePreviewContainer" style="display: none; margin-top: 0.5rem;">
                                <span style="font-size: 0.75rem; color: var(--admin-text-muted); display: block; margin-bottom: 0.25rem;">Ảnh cũ:</span>
                                <img id="imagePreview" src="" alt="" style="max-width: 150px; border-radius: 8px; border: 1px solid var(--admin-border);">
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label>Mô tả ngắn (Hiển thị ở trang chủ / danh sách)</label>
                            <textarea name="short_description" id="productShortDesc" class="form-textarea" rows="2" placeholder="Tóm tắt ngắn gọn các ưu điểm..."></textarea>
                        </div>

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label>Nội dung quy trình chi tiết (Hỗ trợ HTML)</label>
                            <textarea name="description" id="productDesc" class="form-textarea" rows="6" placeholder="Nhập quy trình thi công, thời gian bảo hành..."></textarea>
                        </div>

                        <div class="form-group" style="margin-bottom: 1.5rem;">
                            <label>Thứ tự sắp xếp</label>
                            <input type="number" name="sort_order" id="productSortOrder" class="form-input" value="0" required>
                        </div>

                        <div style="display: flex; gap: 0.75rem;">
                            <button type="submit" class="btn-primary" style="flex-grow: 1; padding: 0.8rem;">Lưu sản phẩm</button>
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
        if (document.getElementById('formAction').value === 'edit_product') return; // Không đổi slug khi sửa
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
        document.getElementById('productSlug').value = slug;
    }

    function editProduct(product) {
        document.getElementById('formTitle').textContent = 'Chỉnh sửa sản phẩm';
        document.getElementById('formAction').value = 'edit_product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productTitle').value = product.title;
        document.getElementById('productSlug').value = product.slug;
        document.getElementById('productCarModelId').value = product.car_model_id;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productShortDesc').value = product.short_description;
        document.getElementById('productDesc').value = product.description;
        document.getElementById('productSortOrder').value = product.sort_order;
        
        if (product.image) {
            document.getElementById('imagePreview').src = '<?= UPLOADS_URL ?>' + product.image;
            document.getElementById('imagePreviewContainer').style.display = 'block';
        } else {
            document.getElementById('imagePreviewContainer').style.display = 'none';
        }

        document.getElementById('btnCancel').style.display = 'inline-block';
    }

    function cancelEdit() {
        document.getElementById('formTitle').textContent = 'Thêm sản phẩm mới';
        document.getElementById('formAction').value = 'add_product';
        document.getElementById('productId').value = '';
        document.getElementById('productForm').reset();
        document.getElementById('imagePreviewContainer').style.display = 'none';
        document.getElementById('btnCancel').style.display = 'none';
    }
    </script>

</body>
</html>
