<?php
/**
 * TRANG RIÊNG DÒNG XE - VINFAST SPA
 */
require_once __DIR__ . '/includes/db.php';
$db = Database::getInstance();

$slug = trim($_GET['slug'] ?? '');

if (empty($slug)) {
    header('Location: index.php');
    exit;
}

// Lấy thông tin dòng xe
$car = $db->fetchOne("SELECT * FROM car_models WHERE slug = ?", [$slug]);

if (!$car) {
    header('Location: index.php');
    exit;
}

// Lấy danh sách sản phẩm thuộc dòng xe này
$products = $db->fetchAll("SELECT * FROM products WHERE car_model_id = ? ORDER BY sort_order ASC", [$car['id']]);

// Helper chuyển đổi Markdown sang HTML cho phần mô tả dài (SEO) giống Next.js
function renderMarkdownToHtml($content) {
    if (!$content) return '<p>Nội dung đang được cập nhật...</p>';
    
    $html = $content;
    $html = str_replace("\r\n", "\n", $html);
    
    // Xử lý tiêu đề
    $html = preg_replace('/^### (.*$)/im', '<h3>$1</h3>', $html);
    $html = preg_replace('/^## (.*$)/im', '<h2>$1</h2>', $html);
    $html = preg_replace('/^# (.*$)/im', '<h1>$1</h1>', $html);
    
    // Xử lý chữ đậm & nghiêng
    $html = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $html);
    $html = preg_replace('/\*(.*?)\*/', '<em>$1</em>', $html);
    
    // Xử lý danh sách
    $html = preg_replace('/^\s*-\s+(.*$)/im', '<li>$1</li>', $html);
    
    // Gom nhóm thẻ <li> lại thành <ul>
    $html = preg_replace('/(<li>.*<\/li>)/im', '<ul>$1</ul>', $html);
    $html = str_replace("</ul>\n<ul>", "\n", $html);
    
    // Xử lý đoạn văn
    $paragraphs = explode("\n\n", $html);
    foreach ($paragraphs as &$p) {
        $trimmed = trim($p);
        if (!$trimmed) continue;
        if (strpos($trimmed, '<h') === 0 || strpos($trimmed, '<ul') === 0 || strpos($trimmed, '<li') === 0) {
            $p = $trimmed;
        } else {
            $p = '<p>' . nl2br($trimmed) . '</p>';
        }
    }
    return implode("\n", $paragraphs);
}

$pageTitle = 'Nâng cấp xe ' . $car['name'];
$pageDesc = $car['description'] ?: 'Các gói nâng cấp, dán phim cách nhiệt, PPF bảo vệ sơn dành riêng cho dòng xe ' . $car['name'];
require_once __DIR__ . '/includes/header.php';
?>

<!-- Quay lại trang chủ -->
<a href="<?= SITE_URL ?>/" class="btn-back" style="margin-bottom: 2rem; display: inline-flex;">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
    Quay lại trang chủ
</a>

<!-- BANNER DANH MỤC (Khớp 100% bản mẫu Next.js) -->
<?php
$bannerUrl = $car['banner'] ? UPLOADS_URL . htmlspecialchars($car['banner']) : null;
?>
<div 
    class="detail-container category-banner-container" 
    style="
      padding: 5rem 2rem; 
      margin-bottom: 3rem; 
      text-align: center; 
      border-radius: 24px;
      position: relative;
      overflow: hidden;
      <?php if ($bannerUrl): ?>
          background-image: linear-gradient(to bottom, rgba(8, 8, 10, 0.45) 0%, rgba(8, 8, 10, 0.9) 100%), url('<?= $bannerUrl ?>');
      <?php else: ?>
          background-color: var(--card-bg);
      <?php endif; ?>
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      border: none;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    "
>
    <span style="color: var(--primary-light); text-transform: uppercase; font-size: 0.85rem; font-weight: 800; letter-spacing: 0.15em; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">Danh mục sản phẩm</span>
    <h1 style="font-size: 2.8rem; color: var(--primary-light); font-weight: 900; marginTop: 0.5rem; marginBottom: 1.25rem; text-shadow: 0 2px 12px rgba(0,0,0,0.6); margin-top: 0.5rem;">
        <?= htmlspecialchars($car['name']) ?>
    </h1>
    <p style="color: rgba(255, 255, 255, 0.9); max-width: 750px; margin: 0 auto; line-height: 1.7; font-size: 1.05rem; text-shadow: 0 2px 8px rgba(0,0,0,0.6); font-weight: 500;">
        <?= htmlspecialchars($car['description'] ?: 'Tổng hợp toàn bộ các gói nâng cấp phụ kiện, dán phim chống nóng và dán PPF bảo vệ chính hãng cho xe điện ' . $car['name'] . '.') ?>
    </p>
</div>

<!-- DANH SÁCH SẢN PHẨM & TÌM KIẾM CỤC BỘ (Khớp 100% CategoryProductsList.js) -->
<div style="margin-bottom: 4rem;">
    <!-- Tiêu đề & Thanh tìm kiếm nhỏ -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 2rem;">
        <h2 class="section-title" style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-grid" style="color: var(--primary-light)"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            Sản phẩm hiện có (<span id="productCount"><?= count($products) ?></span>)
        </h2>

        <!-- Thanh tìm kiếm nhỏ riêng cho danh mục -->
        <div class="category-search-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search" style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
                type="text"
                id="categorySearchInput"
                placeholder="Tìm kiếm sản phẩm..."
                class="category-search-input"
                oninput="filterCategoryProducts(this.value)"
            />
        </div>
    </div>

    <!-- Lưới sản phẩm -->
    <div class="services-grid" id="categoryServicesGrid">
        <!-- Được lọc qua JS -->
    </div>
    
    <div id="noProductsMsg" style="display: none; background: var(--card-bg); border: 1px solid var(--border-color); padding: 4rem 2rem; borderRadius: 24px; text-align: center; color: var(--text-muted); border-radius: 24px;">
        Không tìm thấy sản phẩm nào phù hợp với từ khóa của bạn.
    </div>
</div>

<!-- MÔ TẢ DÀI SEO COLLAPSIBLE (Khớp 100% CollapsibleContent.js) -->
<?php if ($car['show_long_description'] && !empty($car['long_description'])): ?>
    <div style="margin-top: 4rem; border-top: 1px solid var(--border-color); padding-top: 3rem;">
        <h3 style="font-size: 1.4rem; color: var(--primary-light); padding-bottom: 0.5rem; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.03em;">
            Thông tin chi tiết & Tư vấn nâng cấp <?= htmlspecialchars($car['name']) ?>
        </h3>
        
        <div class="collapsible-container">
            <div class="collapsible-content-wrapper" id="collapsibleWrapper" style="max-height: 250px; overflow: hidden;">
                <div class="rich-text-content">
                    <?= renderMarkdownToHtml($car['long_description']) ?>
                </div>
            </div>
            <div class="collapsible-fade-overlay" id="collapsibleFade"></div>
            <div class="collapsible-btn-wrapper">
                <button class="btn-collapsible-toggle" id="btnToggleCollapsible" onclick="toggleCollapsible()">
                    <span>Xem thêm chi tiết</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" id="collapsibleIcon"><path d="m6 9 6 6 6-6"/></svg>
                </button>
            </div>
        </div>
    </div>
<?php endif; ?>

<script>
const categoryProducts = <?= json_encode($products, JSON_UNESCAPED_UNICODE) ?>;
const carName = <?= json_encode($car['name'], JSON_UNESCAPED_UNICODE) ?>;
const carSlug = <?= json_encode($car['slug'], JSON_UNESCAPED_UNICODE) ?>;
const SITE_URL = '<?= SITE_URL ?>';
const UPLOADS_URL = '<?= UPLOADS_URL ?>';

function filterCategoryProducts(query) {
    const cleanQuery = query.toLowerCase().trim();
    const tokens = cleanQuery.split(/\s+/).filter(t => t.length > 0);

    const filtered = categoryProducts.filter(p => {
        if (tokens.length === 0) return true;
        const title = p.title.toLowerCase();
        return tokens.every(t => title.includes(t));
    });

    const grid = document.getElementById('categoryServicesGrid');
    const noMsg = document.getElementById('noProductsMsg');
    const countEl = document.getElementById('productCount');

    countEl.textContent = filtered.length;

    if (filtered.length === 0) {
        grid.style.display = 'none';
        noMsg.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    noMsg.style.display = 'none';

    let html = '';
    filtered.forEach(p => {
        const imgUrl = p.image ? UPLOADS_URL + p.image : 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80';
        const pUrl = SITE_URL + '/product.php?slug=' + encodeURIComponent(p.slug);
        
        html += `
        <div class="service-card">
            <a href="${pUrl}" class="service-image-container" style="position: relative; display: block">
                <img src="${imgUrl}" alt="${p.title}" class="service-image" loading="lazy">
                <div class="car-tag-on-image">
                    <span style="width: 6px; height: 6px; backgroundColor: var(--primary); borderRadius: 50%"></span>
                    Dành riêng cho ${carName}
                </div>
            </a>
            <div class="service-content">
                <h3 class="service-title">
                    <a href="${pUrl}" style="text-decoration: none; color: inherit">${p.title}</a>
                </h3>
                <p class="service-desc">${p.short_description || ''}</p>
                <div class="service-footer">
                    <div>
                        <span class="price-value" style="font-size: 1.2rem; font-weight: 800; color: var(--primary-light)">${p.price || 'Liên hệ'}</span>
                    </div>
                    <a href="${pUrl}" class="btn-action">
                        Xem chi tiết
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </a>
                </div>
            </div>
        </div>`;
    });
    grid.innerHTML = html;
}

// Collapsible logic
let isExpanded = false;
function toggleCollapsible() {
    const wrapper = document.getElementById('collapsibleWrapper');
    const fade = document.getElementById('collapsibleFade');
    const icon = document.getElementById('collapsibleIcon');
    const text = document.querySelector('#btnToggleCollapsible span');

    isExpanded = !isExpanded;
    if (isExpanded) {
        wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
        fade.style.display = 'none';
        icon.style.transform = 'rotate(180deg)';
        text.textContent = 'Thu gọn chi tiết';
    } else {
        wrapper.style.maxHeight = '250px';
        fade.style.display = 'block';
        icon.style.transform = 'rotate(0deg)';
        text.textContent = 'Xem thêm chi tiết';
    }
}

// Khởi chạy lọc ban đầu
filterCategoryProducts('');
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
