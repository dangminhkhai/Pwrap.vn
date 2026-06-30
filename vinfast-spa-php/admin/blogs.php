<?php
/**
 * QUẢN LÝ BÀI VIẾT CẨM NANG (BLOGS) - VINFAST SPA CMS
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

// Xử lý ảnh bìa tải lên
function handleCoverUpload() {
    if (isset($_FILES['cover']) && $_FILES['cover']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['cover']['tmp_name'];
        $fileName = $_FILES['cover']['name'];
        
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

// Xử lý Thêm bài viết
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_blog') {
    $title = trim($_POST['title'] ?? '');
    $slug = trim($_POST['slug'] ?? '');
    $seo_desc = trim($_POST['seo_desc'] ?? '');
    $content = trim($_POST['content'] ?? '');
    
    $cover = handleCoverUpload();

    if (empty($title) || empty($slug)) {
        $toastMessage = 'Vui lòng nhập đầy đủ tiêu đề và slug.';
        $toastType = 'error';
    } else {
        try {
            $db->execute(
                "INSERT INTO blogs (title, slug, seo_desc, content, cover) VALUES (?, ?, ?, ?, ?)",
                [$title, $slug, $seo_desc, $content, $cover]
            );
            $toastMessage = 'Đã xuất bản bài viết mới thành công!';
            $toastType = 'success';
        } catch (Exception $e) {
            $toastMessage = 'Lỗi: Slug đã tồn tại ở bài viết khác.';
            $toastType = 'error';
        }
    }
}

// Xử lý Cập nhật bài viết
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'edit_blog') {
    $id = intval($_POST['id'] ?? 0);
    $title = trim($_POST['title'] ?? '');
    $slug = trim($_POST['slug'] ?? '');
    $seo_desc = trim($_POST['seo_desc'] ?? '');
    $content = trim($_POST['content'] ?? '');
    
    $newCover = handleCoverUpload();

    if ($id > 0 && !empty($title) && !empty($slug)) {
        try {
            if ($newCover) {
                // Xóa ảnh cũ
                $old = $db->fetchOne("SELECT cover FROM blogs WHERE id = ?", [$id]);
                if ($old && $old['cover'] && file_exists(UPLOADS_DIR . $old['cover'])) {
                    unlink(UPLOADS_DIR . $old['cover']);
                }
                $db->execute(
                    "UPDATE blogs SET title = ?, slug = ?, seo_desc = ?, content = ?, cover = ? WHERE id = ?",
                    [$title, $slug, $seo_desc, $content, $newCover, $id]
                );
            } else {
                $db->execute(
                    "UPDATE blogs SET title = ?, slug = ?, seo_desc = ?, content = ? WHERE id = ?",
                    [$title, $slug, $seo_desc, $content, $id]
                );
            }
            $toastMessage = 'Đã cập nhật bài viết thành công!';
            $toastType = 'success';
        } catch (Exception $e) {
            $toastMessage = 'Lỗi: Slug đã tồn tại ở bài viết khác.';
            $toastType = 'error';
        }
    }
}

// Xử lý Xóa bài viết
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete_blog') {
    $id = intval($_POST['id'] ?? 0);
    if ($id > 0) {
        $old = $db->fetchOne("SELECT cover FROM blogs WHERE id = ?", [$id]);
        if ($old && $old['cover'] && file_exists(UPLOADS_DIR . $old['cover'])) {
            unlink(UPLOADS_DIR . $old['cover']);
        }
        $db->execute("DELETE FROM blogs WHERE id = ?", [$id]);
        $toastMessage = 'Đã xóa bài viết.';
        $toastType = 'success';
    }
}

// Lấy danh sách bài viết
$blogs = $db->fetchAll("SELECT * FROM blogs ORDER BY created_at DESC");
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản lý Bài viết - <?= SITE_NAME ?></title>
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
            <a href="products.php" class="sidebar-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                Quản lý Sản phẩm
            </a>
            <a href="blogs.php" class="sidebar-link active">
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
            <div class="topbar-title">Bài viết Cẩm nang & Tư vấn chăm sóc xe</div>
            <div class="topbar-user">
                Xin chào, <strong><?= htmlspecialchars($_SESSION['admin_name']) ?></strong>
            </div>
        </header>

        <div class="admin-content">
            <div style="display: grid; grid-template-columns: 1.2fr 1.1fr; gap: 2rem; align-items: start;">
                
                <!-- Danh sách bài viết -->
                <div class="content-card">
                    <div class="card-header">
                        <h3>Danh sách bài viết</h3>
                    </div>
                    <div class="table-responsive">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Ảnh bìa</th>
                                    <th>Tiêu đề bài viết</th>
                                    <th>Ngày đăng</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (count($blogs) === 0): ?>
                                    <tr>
                                        <td colspan="4" style="text-align: center; color: var(--admin-text-muted); padding: 3rem 0;">Chưa có bài viết nào. Hãy tạo mới bên phải.</td>
                                    </tr>
                                <?php else: ?>
                                    <?php foreach ($blogs as $b): ?>
                                        <tr>
                                            <td>
                                                <img 
                                                    src="<?= $b['cover'] ? UPLOADS_URL . htmlspecialchars($b['cover']) : 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=100&q=80' ?>" 
                                                    alt="" 
                                                    style="width: 70px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid var(--admin-border);"
                                                >
                                            </td>
                                            <td>
                                                <strong><?= htmlspecialchars($b['title']) ?></strong>
                                                <div style="font-size: 0.75rem; color: var(--admin-text-muted);">Slug: <code><?= htmlspecialchars($b['slug']) ?></code></div>
                                            </td>
                                            <td style="font-size: 0.8rem; color: var(--admin-text-muted);"><?= date('d/m/Y', strtotime($b['created_at'])) ?></td>
                                            <td>
                                                <button 
                                                    onclick="editBlog(<?= htmlspecialchars(json_encode($b)) ?>)" 
                                                    class="btn-outline" 
                                                    style="padding: 0.35rem 0.6rem; font-size: 0.75rem; border-radius: 8px; margin-right: 0.25rem;"
                                                >
                                                    Sửa
                                                </button>
                                                <form method="POST" onsubmit="return confirm('Bạn có chắc chắn muốn xóa bài viết này?');" style="display: inline;">
                                                    <input type="hidden" name="action" value="delete_blog">
                                                    <input type="hidden" name="id" value="<?= $b['id'] ?>">
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

                <!-- Form Thêm / Sửa bài viết -->
                <div class="content-card">
                    <div class="card-header">
                        <h3 id="formTitle">Tạo bài viết mới</h3>
                    </div>
                    <form method="POST" id="blogForm" enctype="multipart/form-data" style="padding: 1rem 0;">
                        <input type="hidden" name="action" id="formAction" value="add_blog">
                        <input type="hidden" name="id" id="blogId" value="">

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label>Tiêu đề bài viết</label>
                            <input type="text" name="title" id="blogTitle" class="form-input" placeholder="Ví dụ: Cách chọn phim cách nhiệt phù hợp..." required oninput="generateSlug(this.value)">
                        </div>

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label>Slug (Đường dẫn tĩnh)</label>
                            <input type="text" name="slug" id="blogSlug" class="form-input" placeholder="Ví dụ: cach-chon-phim-cach-nhiet" required>
                        </div>

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label>Ảnh bìa bài viết</label>
                            <input type="file" name="cover" id="blogCover" class="form-input">
                            <div id="coverPreviewContainer" style="display: none; margin-top: 0.5rem;">
                                <span style="font-size: 0.75rem; color: var(--admin-text-muted); display: block; margin-bottom: 0.25rem;">Ảnh cũ:</span>
                                <img id="coverPreview" src="" alt="" style="max-width: 150px; border-radius: 8px; border: 1px solid var(--admin-border);">
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label>Mô tả SEO ngắn</label>
                            <input type="text" name="seo_desc" id="blogSeoDesc" class="form-input" placeholder="Nhập câu tóm tắt bài viết để hiển thị trên Google / Mạng xã hội...">
                        </div>

                        <div class="form-group" style="margin-bottom: 1.5rem;">
                            <label>Nội dung bài viết (Hỗ trợ định dạng HTML)</label>
                            <textarea name="content" id="blogContent" class="form-textarea" rows="12" placeholder="Nhập nội dung bài viết chi tiết..." required></textarea>
                        </div>

                        <div style="display: flex; gap: 0.75rem;">
                            <button type="submit" class="btn-primary" style="flex-grow: 1; padding: 0.8rem;">Xuất bản bài viết</button>
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
        if (document.getElementById('formAction').value === 'edit_blog') return; // Không đổi slug khi sửa
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
        document.getElementById('blogSlug').value = slug;
    }

    function editBlog(blog) {
        document.getElementById('formTitle').textContent = 'Chỉnh sửa bài viết';
        document.getElementById('formAction').value = 'edit_blog';
        document.getElementById('blogId').value = blog.id;
        document.getElementById('blogTitle').value = blog.title;
        document.getElementById('blogSlug').value = blog.slug;
        document.getElementById('blogSeoDesc').value = blog.seo_desc;
        document.getElementById('blogContent').value = blog.content;
        
        if (blog.cover) {
            document.getElementById('coverPreview').src = '<?= UPLOADS_URL ?>' + blog.cover;
            document.getElementById('coverPreviewContainer').style.display = 'block';
        } else {
            document.getElementById('coverPreviewContainer').style.display = 'none';
        }

        document.getElementById('btnCancel').style.display = 'inline-block';
    }

    function cancelEdit() {
        document.getElementById('formTitle').textContent = 'Tạo bài viết mới';
        document.getElementById('formAction').value = 'add_blog';
        document.getElementById('blogId').value = '';
        document.getElementById('blogForm').reset();
        document.getElementById('coverPreviewContainer').style.display = 'none';
        document.getElementById('btnCancel').style.display = 'none';
    }
    </script>

</body>
</html>
