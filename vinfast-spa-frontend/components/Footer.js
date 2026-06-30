import Link from 'next/link';

async function getCarModels() {
  const STRAPI_URL = 'http://localhost:1337';
  try {
    const res = await fetch(`${STRAPI_URL}/api/car-models?sort[0]=order:asc&fields[0]=name&fields[1]=slug`, { next: { revalidate: 60 } });
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Lỗi lấy danh mục xe cho Footer:', error);
    return [];
  }
}

export default async function Footer() {
  const carModels = await getCarModels();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Cột 1: Giới thiệu thương hiệu */}
        <div className="footer-col brand-col">
          <Link href="/" className="logo" style={{ marginBottom: '1.25rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check" style={{color: 'var(--primary-light)'}}><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/><path d="m9 12 2 2 4-4"/></svg>
            VINFAST <span>SPA</span>
          </Link>
          <p className="footer-text">
            Hệ thống chăm sóc & nâng cấp xe điện VinFast chuyên nghiệp. Đơn vị hàng đầu về thi công dán phim cách nhiệt 3M Crystalline và PPF bảo vệ sơn TPU tự phục hồi xước chính hãng.
          </p>
          <div className="footer-hours">
            <span className="hours-title">Giờ mở cửa:</span> 8:30 - 17:30 (Tất cả các ngày trong tuần)
          </div>
        </div>

        {/* Cột 2: Danh mục dòng xe */}
        <div className="footer-col links-col">
          <h3 className="footer-col-title">Danh Mục Dòng Xe</h3>
          <ul className="footer-links-list">
            {carModels.slice(0, 6).map((car) => (
              <li key={car.id}>
                <Link href={`/${car.slug}`} className="footer-link">
                  Nâng cấp xe {car.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 3: Liên hệ */}
        <div className="footer-col contact-col">
          <h3 className="footer-col-title">Thông Tin Liên Hệ</h3>
          <ul className="footer-contact-list">
            <li>
              <a href="tel:0833698888" className="footer-contact-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Hotline: 0833698888
              </a>
            </li>
            <li>
              <a href="https://zalo.me/0833698888" target="_blank" rel="noopener noreferrer" className="footer-contact-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                Zalo: 0833698888
              </a>
            </li>
            <li>
              <a href="https://m.me/danbaovenoingoaithatoto" target="_blank" rel="noopener noreferrer" className="footer-contact-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                Messenger: danbaovenoingoaithatoto
              </a>
            </li>
            <li className="footer-address">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              Địa chỉ: Số 11 - C02 - KĐT Geleximco - Lê Trọng Tấn - P.Dương Nội - Hà Nội
            </li>
          </ul>
        </div>
      </div>

      {/* Thanh bản quyền bên dưới */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© {new Date().getFullYear()} VinFast Spa. Tất cả quyền được bảo lưu.</p>
          <div className="footer-bottom-links">
            <Link href="/">Chính sách bảo mật</Link>
            <span className="divider">|</span>
            <Link href="/">Điều khoản dịch vụ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
