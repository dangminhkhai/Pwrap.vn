<?php
/**
 * TRANG CHI TIẾT SẢN PHẨM - VINFAST SPA
 */
require_once __DIR__ . '/includes/db.php';
$db = Database::getInstance();

$slug = trim($_GET['slug'] ?? '');

if (empty($slug)) {
    header('Location: index.php');
    exit;
}

// Lấy sản phẩm kèm thông tin dòng xe
$product = $db->fetchOne("
    SELECT p.*, cm.name AS car_name, cm.slug AS car_slug 
    FROM products p 
    LEFT JOIN car_models cm ON p.car_model_id = cm.id 
    WHERE p.slug = ?
", [$slug]);

if (!$product) {
    header('Location: index.php');
    exit;
}

// Lấy các sản phẩm khác cùng dòng xe (Sản phẩm liên quan)
$relatedProducts = $db->fetchAll(
    "SELECT * FROM products WHERE car_model_id = ? AND id != ? LIMIT 3",
    [$product['car_model_id'], $product['id']]
);

// Helper chuyển đổi Markdown sang HTML giống Next.js
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

$pageTitle = $product['title'];
$pageDesc = $product['short_description'];
require_once __DIR__ . '/includes/header.php';
?>

<div class="detail-container">
    <!-- HERO GRID (Khớp ảnh mẫu) -->
    <div class="detail-hero-grid" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 2.5rem; margin-bottom: 3rem; align-items: start;">
        
        <!-- Cột ảnh trái -->
        <div class="detail-img-wrapper" style="position: relative; border-radius: 20px; overflow: hidden; aspect-ratio: 4/3; border: 1px solid var(--border-color);">
            <img 
                src="<?= $product['image'] ? UPLOADS_URL . htmlspecialchars($product['image']) : 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80' ?>" 
                alt="<?= htmlspecialchars($product['title']) ?>" 
                class="detail-img"
                style="object-fit: cover; width: 100%; height: 100%; display: block;"
            >
            <div class="car-tag-on-image" style="position: absolute; top: 16px; left: 16px; display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.6); padding: 6px 12px; border-radius: 100px; font-size: 0.75rem; color: #fff; font-weight: 500; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(4px); text-transform: uppercase;">
                <span>📸 HÌNH ẢNH THỰC TẾ TRÊN <?= htmlspecialchars($product['car_name'] ?: 'VINFAST') ?></span>
            </div>
        </div>
        
        <!-- Cột thông tin phải -->
        <div class="detail-info-pane" style="display: flex; flex-direction: column; gap: 1rem;">
            <!-- Nút quay lại kiểu viên thuốc tối màu -->
            <a href="index.php" class="btn-back" style="width: fit-content; background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); padding: 6px 16px; border-radius: 100px; font-size: 0.8rem; font-weight: 500; text-decoration: none; color: #f5f5f7; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Quay lại trang chủ
            </a>
            
            <span class="detail-title-badge" style="color: var(--primary-light); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.5rem;">
                Sản phẩm dành riêng cho xe <?= htmlspecialchars($product['car_name']) ?>
            </span>
            
            <h1 class="detail-title" style="font-size: 2.1rem; font-weight: 900; line-height: 1.2; color: var(--primary-light) !important; text-transform: uppercase; margin: 0;">
                <?= htmlspecialchars($product['title']) ?>
            </h1>
            
            <p style="color: var(--text-muted); line-height: 1.6; font-size: 0.95rem; margin: 0.5rem 0 1rem 0;">
                <?= htmlspecialchars($product['short_description']) ?>
            </p>
            
            <!-- Hộp giá và nút bấm (Bo góc glassmorphism tối màu) -->
            <div class="detail-price-box" style="background: rgba(20, 20, 25, 0.9); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 16px; display: flex; flex-direction: column; gap: 1.25rem;">
                <div class="detail-price-val" style="font-size: 2rem; font-weight: 900; color: var(--accent); margin: 0;">
                    <?= htmlspecialchars($product['price'] ?: 'Liên hệ') ?>
                </div>
                <div style="display: flex; gap: 0.75rem; width: 100%;">
                    <button 
                        onclick="openPopup(<?= htmlspecialchars(json_encode($product['title'])) ?>, <?= htmlspecialchars(json_encode($product['car_name'])) ?>)" 
                        class="btn-action" 
                        style="flex: 1; justify-content: center; background: #ff3d00; color: #fff; border: none; font-weight: 700; padding: 0.8rem 1.5rem; border-radius: 10px; cursor: pointer; text-transform: uppercase; font-size: 0.9rem; transition: all 0.2s;"
                    >
                        Nhận tư vấn
                    </button>
                    <a 
                        href="tel:0833698888" 
                        class="btn-outline" 
                        style="flex: 1; justify-content: center; border: 1px solid #ff3d00; color: #ff3d00; background: transparent; font-weight: 700; padding: 0.8rem 1.5rem; border-radius: 10px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; text-transform: uppercase; font-size: 0.9rem; transition: all 0.2s;"
                    >
                        📞 Liên hệ ngay
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- DETAIL BODY -->
    <div class="detail-body-content" style="margin-top: 4rem;">
        <!-- Thư viện ảnh thực tế -->
        <div style="margin-bottom: 4rem;">
            <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--primary-light) !important; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.02em;">
                Thư viện ảnh thực tế trên <?= htmlspecialchars($product['car_name']) ?>
            </h3>
            <div class="services-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
                <div style="position: relative; border-radius: 14px; overflow: hidden; aspect-ratio: 4/3; border: 1px solid var(--border-color);">
                    <img 
                        src="<?= $product['image'] ? UPLOADS_URL . htmlspecialchars($product['image']) : 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80' ?>" 
                        alt="" 
                        style="width: 100%; height: 100%; object-fit: cover; display: block;"
                    >
                </div>
            </div>
        </div>

        <!-- Quy trình chi tiết (Không dùng collapsible để hiển thị đầy đủ, sạch sẽ như ảnh mẫu) -->
        <div style="margin-bottom: 4rem; border-top: 1px solid var(--border-color); padding-top: 3rem;">
            <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--primary-light) !important; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.02em;">
                Giới thiệu dịch vụ <?= htmlspecialchars(mb_strtolower($product['title'])) ?>
            </h3>
            <div class="rich-text-content" style="line-height: 1.7; font-size: 0.95rem; color: var(--text-main);">
                <?= renderMarkdownToHtml($product['description']) ?>
            </div>
        </div>

        <!-- Sản phẩm liên quan -->
        <?php if (count($relatedProducts) > 0): ?>
            <div style="margin-top: 4rem; border-top: 1px solid var(--border-color); padding-top: 3rem;">
                <h3 style="font-size: 1.3rem; color: var(--primary-light) !important; margin-bottom: 2rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em;">
                    Các sản phẩm khác cho xe <?= htmlspecialchars($product['car_name']) ?>
                </h3>
                <div class="services-grid" style="gap: 2rem;">
                    <?php foreach ($relatedProducts as $p): ?>
                        <?php 
                        $imgUrl = $p['image'] 
                            ? UPLOADS_URL . htmlspecialchars($p['image']) 
                            : 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80';
                        $productUrl = 'product.php?slug=' . urlencode($p['slug']);
                        ?>
                        <div class="service-card" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;">
                            <div class="service-image-container" style="position: relative; aspect-ratio: 16/10; overflow: hidden;">
                                <img 
                                    src="<?= $imgUrl ?>" 
                                    alt="<?= htmlspecialchars($p['title']) ?>" 
                                    class="service-image"
                                    style="object-fit: cover; width: 100%; height: 100%;"
                                    loading="lazy"
                                >
                                <div class="car-tag-on-image" style="position: absolute; top: 12px; left: 12px; display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.7); padding: 4px 10px; border-radius: 100px; font-size: 0.7rem; color: #fff; font-weight: 500;">
                                    <span style="width: 5px; height: 5px; background-color: var(--primary); border-radius: 50%;"></span>
                                    Dành riêng cho <?= htmlspecialchars($product['car_name']) ?>
                                </div>
                            </div>
                            <div class="service-content" style="padding: 1.5rem; display: flex; flex-direction: column; flex-grow: 1; gap: 0.75rem;">
                                <h3 class="service-title" style="font-size: 1.15rem; font-weight: 800; color: var(--primary-light) !important; text-transform: uppercase; margin: 0;">
                                    <a href="<?= $productUrl ?>" style="text-decoration: none; color: inherit;"><?= htmlspecialchars($p['title']) ?></a>
                                </h3>
                                <p class="service-desc" style="color: var(--text-muted); font-size: 0.85rem; line-height: 1.5; margin: 0; flex-grow: 1;">
                                    <?= htmlspecialchars($p['short_description']) ?>
                                </p>
                                <div class="service-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                                    <span class="price-value" style="font-size: 1.15rem; font-weight: 900; color: var(--accent);"><?= htmlspecialchars($p['price'] ?: 'Liên hệ') ?></span>
                                    <a href="<?= $productUrl ?>" class="btn-action" style="background: #ff3d00; color: #fff; border: none; font-weight: 700; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.8rem; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                                        Xem chi tiết &rarr;
                                    </a>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>

<!-- POPUP ĐĂNG KÝ TƯ VẤN -->
<div class="popup-overlay" id="popupOverlay" style="display: none;">
    <div class="popup-card">
        <button class="popup-close-btn" onclick="closePopup()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <h2 style="text-align: center; margin-bottom: 0.5rem; font-size: 1.4rem">📞 Đăng ký tư vấn miễn phí</h2>
        <p style="text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 2rem">Nhập thông tin để nhận tư vấn từ chuyên gia</p>
        <form id="leadForm" onsubmit="submitLead(event)">
            <input type="hidden" id="leadServiceName" value="">
            <input type="hidden" id="leadCarName" value="">
            <div class="form-group" style="margin-bottom: 1rem">
                <label>Họ và tên</label>
                <input type="text" class="popup-input" id="leadName" placeholder="Nhập họ và tên..." required>
            </div>
            <div class="form-group" style="margin-bottom: 1rem">
                <label>Số điện thoại</label>
                <input type="tel" class="popup-input" id="leadPhone" placeholder="Ví dụ: 0912345678" required>
            </div>
            <div id="leadError" style="color: var(--danger); font-size: 0.85rem; margin-bottom: 0.75rem; display: none"></div>
            <button type="submit" id="leadSubmitBtn" class="btn-action" style="width: 100%; padding: 0.9rem; border-radius: 14px; font-size: 1rem; justify-content: center; margin-top: 0.5rem">
                Gửi yêu cầu tư vấn
            </button>
            <div id="leadSuccess" style="text-align: center; color: var(--success); font-size: 0.9rem; margin-top: 1rem; display: none">
                ✅ Đăng ký thành công! Chúng tôi sẽ liên hệ bạn sớm nhất.
            </div>
        </form>
    </div>
</div>

<script>
// Popup Functions
function openPopup(serviceName, carName) {
    document.getElementById('leadServiceName').value = serviceName || '';
    document.getElementById('leadCarName').value = carName || '';
    document.getElementById('popupOverlay').style.display = 'flex';
    document.getElementById('leadSuccess').style.display = 'none';
    document.getElementById('leadError').style.display = 'none';
    document.getElementById('leadForm').reset();
}

function closePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
}

function submitLead(e) {
    e.preventDefault();
    const name = document.getElementById('leadName').value.trim();
    const phone = document.getElementById('leadPhone').value.trim();
    const errorEl = document.getElementById('leadError');
    const successEl = document.getElementById('leadSuccess');
    const btn = document.getElementById('leadSubmitBtn');

    if (!name) { errorEl.textContent = 'Vui lòng nhập họ và tên.'; errorEl.style.display = 'block'; return; }
    if (!/^(0[3|5|7|8|9])([0-9]{8})$/.test(phone)) {
        errorEl.textContent = 'Số điện thoại không hợp lệ (Phải gồm 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).';
        errorEl.style.display = 'block'; return;
    }

    errorEl.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Đang gửi...';

    fetch('api-lead.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: name,
            phone: phone,
            serviceName: document.getElementById('leadServiceName').value,
            carName: document.getElementById('leadCarName').value
        })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            successEl.style.display = 'block';
            btn.textContent = '✅ Đã gửi thành công';
            setTimeout(() => closePopup(), 2500);
        } else {
            errorEl.textContent = data.error || 'Có lỗi xảy ra. Vui lòng thử lại.';
            errorEl.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Gửi yêu cầu tư vấn';
        }
    })
    .catch(() => {
        errorEl.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Gửi yêu cầu tư vấn';
    });
}

document.getElementById('popupOverlay').addEventListener('click', function(e) {
    if (e.target === this) closePopup();
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
