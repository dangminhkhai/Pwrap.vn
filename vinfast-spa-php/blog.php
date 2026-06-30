<?php
/**
 * TRANG CHI TIẾT BÀI VIẾT CẨM NANG - VINFAST SPA
 */
require_once __DIR__ . '/includes/db.php';
$db = Database::getInstance();

$slug = trim($_GET['slug'] ?? '');

if (empty($slug)) {
    header('Location: index.php');
    exit;
}

// Lấy bài viết
$blog = $db->fetchOne("SELECT * FROM blogs WHERE slug = ?", [$slug]);

if (!$blog) {
    header('Location: index.php');
    exit;
}

// Lấy các bài viết khác
$otherBlogs = $db->fetchAll("SELECT * FROM blogs WHERE id != ? ORDER BY created_at DESC LIMIT 3", [$blog['id']]);

$pageTitle = $blog['title'];
$pageDesc = $blog['seo_desc'];
require_once __DIR__ . '/includes/header.php';
?>

<div class="detail-container" style="max-width: 900px; margin: 0 auto;">
    <!-- Ảnh bìa bài viết -->
    <div style="width: 100%; aspect-ratio: 16/9; overflow: hidden; position: relative;">
        <img 
            src="<?= $blog['cover'] ? UPLOADS_URL . htmlspecialchars($blog['cover']) : 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80' ?>" 
            alt="<?= htmlspecialchars($blog['title']) ?>" 
            style="width: 100%; height: 100%; object-fit: cover;"
        >
    </div>

    <!-- Nội dung bài viết -->
    <div class="detail-body-content" style="padding: 3rem 2.5rem;">
        <a href="<?= SITE_URL ?>/" class="btn-back" style="margin-bottom: 1.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Quay lại trang chủ
        </a>

        <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: block; margin-bottom: 0.5rem;">
            📅 Ngày đăng: <?= date('d/m/Y', strtotime($blog['created_at'])) ?>
        </span>

        <h1 class="blog-title" style="font-size: 2.2rem; font-weight: 900; line-height: 1.25; margin-bottom: 2rem;">
            <?= htmlspecialchars($blog['title']) ?>
        </h1>

        <div class="rich-text-content">
            <!-- Hỗ trợ hiển thị nội dung chứa thẻ HTML -->
            <?= $blog['content'] ?>
        </div>
    </div>
</div>

<!-- BÀI VIẾT KHÁC -->
<?php if (count($otherBlogs) > 0): ?>
<section style="max-width: 900px; margin: 5rem auto 4rem auto;">
    <h2 class="section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-light)"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>
        Các cẩm nang & tư vấn chăm sóc xe khác
    </h2>
    <div class="blog-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
        <?php foreach ($otherBlogs as $b): ?>
            <a href="<?= SITE_URL ?>/blog.php?slug=<?= urlencode($b['slug']) ?>" class="blog-card">
                <div class="blog-cover-container" style="position: relative">
                    <img 
                        src="<?= $b['cover'] ? UPLOADS_URL . htmlspecialchars($b['cover']) : 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80' ?>" 
                        alt="<?= htmlspecialchars($b['title']) ?>" 
                        class="blog-cover" 
                        loading="lazy"
                    >
                </div>
                <div class="blog-content">
                    <h3 class="blog-title" style="font-size: 0.95rem;"><?= htmlspecialchars($b['title']) ?></h3>
                </div>
            </a>
        <?php endforeach; ?>
    </div>
</section>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
