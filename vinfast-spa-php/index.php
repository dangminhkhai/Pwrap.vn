<?php
/**
 * TRANG CHỦ - VINFAST SPA
 */
require_once __DIR__ . '/includes/db.php';
$db = Database::getInstance();

// Lấy dòng xe
$carModels = $db->fetchAll("SELECT * FROM car_models ORDER BY sort_order ASC");

// Lấy tất cả sản phẩm kèm tên dòng xe
$products = $db->fetchAll("
    SELECT p.*, cm.name AS car_name, cm.slug AS car_slug 
    FROM products p 
    LEFT JOIN car_models cm ON p.car_model_id = cm.id 
    ORDER BY p.sort_order ASC
");

// Lấy bài viết mới nhất
$blogs = $db->fetchAll("SELECT * FROM blogs ORDER BY created_at DESC LIMIT 6");

// Nhóm sản phẩm theo car_model_id
$productsByCarId = [];
foreach ($products as $p) {
    $productsByCarId[$p['car_model_id']][] = $p;
}

$pageTitle = 'Trang chủ';
require_once __DIR__ . '/includes/header.php';
?>

<!-- HERO SECTION -->
<section class="hero">
    <h1>Cá Nhân Hóa Nâng Cấp Cho <span style="color: var(--accent)">Từng Dòng Xe VinFast</span></h1>
    <p>Chọn dòng xe của bạn để xem hình ảnh thi công thực tế và các sản phẩm trọn gói tối ưu nhất.</p>
</section>

<!-- CAR SELECTOR SECTION -->
<section class="car-selector-container">
    <h2 class="section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-light)"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
        Bước 1: Chọn dòng xe của bạn
    </h2>
    <div class="car-tabs" id="carTabs">
        <?php foreach ($carModels as $i => $car): ?>
            <div class="car-tab <?= $i === 0 ? 'active' : '' ?>" data-car-id="<?= $car['id'] ?>" onclick="selectCar(<?= $car['id'] ?>, this)">
                <?php if ($car['is_hot']): ?>
                    <span class="hot-badge">HOT</span>
                <?php endif; ?>
                <span class="car-name"><?= htmlspecialchars($car['name']) ?></span>
            </div>
        <?php endforeach; ?>
    </div>
</section>

<!-- PRODUCTS GRID SECTION -->
<section style="margin-bottom: 4rem">
    <h2 class="section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-light)"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        Bước 2: Các gói sản phẩm & dịch vụ khuyên dùng
    </h2>

    <div class="services-grid" id="servicesGrid">
        <!-- Rendered by JavaScript -->
    </div>

    <div id="viewAllBtnWrapper" style="display: none; justify-content: center; margin-top: 2.5rem;">
        <a id="viewAllBtn" href="#" class="btn-outline" style="padding: 0.8rem 2rem; border-radius: 14px; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 0.5rem;">
            Xem trang riêng dòng xe
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
    </div>
</section>

<!-- BLOG SECTION -->
<?php if (count($blogs) > 0): ?>
<section class="blog-home-section">
    <h2 class="section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-light)"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        Cẩm nang & Tư vấn chăm sóc xe
    </h2>
    <div class="blog-grid">
        <?php foreach ($blogs as $blog): ?>
            <a href="blog.php?slug=<?= urlencode($blog['slug']) ?>" class="blog-card">
                <div class="blog-cover-container" style="position: relative">
                    <img 
                        src="<?= $blog['cover'] ? 'uploads/' . htmlspecialchars($blog['cover']) : 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80' ?>" 
                        alt="<?= htmlspecialchars($blog['title']) ?>" 
                        class="blog-cover" 
                        loading="lazy"
                    >
                </div>
                <div class="blog-content">
                    <h3 class="blog-title"><?= htmlspecialchars($blog['title']) ?></h3>
                    <p class="blog-excerpt"><?= htmlspecialchars($blog['seo_desc'] ?: 'Xem chi tiết cẩm nang hướng dẫn chăm sóc xe từ chuyên gia...') ?></p>
                </div>
            </a>
        <?php endforeach; ?>
    </div>
</section>
<?php endif; ?>

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
const allProducts = <?= json_encode($products, JSON_UNESCAPED_UNICODE) ?>;
const carModelsData = <?= json_encode($carModels, JSON_UNESCAPED_UNICODE) ?>;

let selectedCarId = carModelsData.length > 0 ? carModelsData[0].id : null;

function selectCar(carId, el) {
    selectedCarId = carId;
    document.querySelectorAll('.car-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    renderProducts();
}

function renderProducts() {
    const grid = document.getElementById('servicesGrid');
    const viewAllWrapper = document.getElementById('viewAllBtnWrapper');
    const viewAllBtn = document.getElementById('viewAllBtn');

    const filtered = allProducts.filter(p => p.car_model_id == selectedCarId);
    const selectedCar = carModelsData.find(c => c.id == selectedCarId);

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="background: var(--card-bg); border: 1px solid var(--border-color); padding: 3rem 1rem; border-radius: 24px; text-align: center; color: var(--text-muted); width: 100%; grid-column: 1 / -1;">
            Chưa có sản phẩm nào được cấu hình cho dòng xe này trong trang quản trị.
        </div>`;
        viewAllWrapper.style.display = 'none';
        return;
    }

    let html = '';
    filtered.forEach(p => {
        const imgUrl = p.image 
            ? 'uploads/' + p.image 
            : 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80';
        const productUrl = 'product.php?slug=' + encodeURIComponent(p.slug);

        html += `
        <div class="service-card">
            <a href="${productUrl}" class="service-image-container" style="position: relative; display: block">
                <img src="${imgUrl}" alt="${p.title}" class="service-image" loading="lazy">
                <div class="car-tag-on-image">
                    <span style="width:6px;height:6px;background:var(--primary);border-radius:50%;display:inline-block"></span>
                    Dành riêng cho ${selectedCar ? selectedCar.name : ''}
                </div>
            </a>
            <div class="service-content">
                <h3 class="service-title">
                    <a href="${productUrl}" style="text-decoration:none;color:inherit">${p.title}</a>
                </h3>
                <p class="service-desc">${p.short_description || ''}</p>
                <div class="service-footer">
                    <div>
                        <span class="price-value" style="font-size:1.2rem;font-weight:800;color:var(--primary-light)">${p.price || 'Liên hệ'}</span>
                    </div>
                    <a href="${productUrl}" class="btn-action">
                        Xem chi tiết
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </a>
                </div>
            </div>
        </div>`;
    });

    grid.innerHTML = html;

    if (selectedCar && filtered.length > 0) {
        viewAllBtn.href = 'car.php?slug=' + encodeURIComponent(selectedCar.slug);
        viewAllBtn.innerHTML = 'Xem trang riêng dòng xe ' + selectedCar.name + ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
        viewAllWrapper.style.display = 'flex';
    }
}

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

renderProducts();
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
