import Link from 'next/link';
import CollapsibleContent from '../../../components/CollapsibleContent';
import ActionButtons from '../../../components/ActionButtons';

const formatDisplayPrice = (carDetail) => {
  if (!carDetail) return 'Liên hệ';
  
  const hasMin = carDetail.minPrice && carDetail.minPrice.trim() !== '';
  const hasMax = carDetail.maxPrice && carDetail.maxPrice.trim() !== '';
  
  // 1. Nếu có cả min và max -> hiển thị khoảng giá min - max
  if (hasMin && hasMax) {
    const min = parseInt(carDetail.minPrice.replace(/\D/g, ''), 10);
    const max = parseInt(carDetail.maxPrice.replace(/\D/g, ''), 10);
    const minStr = isNaN(min) ? carDetail.minPrice : min.toLocaleString('vi-VN');
    const maxStr = isNaN(max) ? carDetail.maxPrice : max.toLocaleString('vi-VN');
    return `${minStr} - ${maxStr} đ`;
  }
  
  // 2. Nếu chỉ có min -> hiển thị 1 giá
  if (hasMin) {
    const min = parseInt(carDetail.minPrice.replace(/\D/g, ''), 10);
    return isNaN(min) ? carDetail.minPrice : `${min.toLocaleString('vi-VN')} đ`;
  }
  
  return 'Liên hệ';
};

export default async function ServiceDetailPage({ params }) {
  const resolvedParams = await params;
  const { carSlug, serviceSlug } = resolvedParams;

  const STRAPI_URL = 'http://localhost:1337';

  // 1. Lấy thông tin chi tiết dịch vụ gốc
  const resService = await fetch(`${STRAPI_URL}/api/services?filters[slug][$eq]=${serviceSlug}&populate=*`, { cache: 'no-store' });
  const serviceData = await resService.json();
  const service = serviceData.data?.[0];

  if (!service) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: 'var(--primary-light)', marginBottom: '1rem' }}>Không tìm thấy dịch vụ!</h2>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Quay lại trang chủ</Link>
      </div>
    );
  }

  // 2. Lấy thông tin xe
  const resCar = await fetch(`${STRAPI_URL}/api/car-models?filters[slug][$eq]=${carSlug}`, { cache: 'no-store' });
  const carData = await resCar.json();
  const car = carData.data?.[0];

  // 3. Lấy thông tin liên kết riêng của xe này (giá & ảnh riêng)
  let carDetail = null;
  if (car) {
    const resDetail = await fetch(
      `${STRAPI_URL}/api/car-service-details?filters[car_model][id][$eq]=${car.id}&filters[service][id][$eq]=${service.id}&populate=*`,
      { cache: 'no-store' }
    );
    const detailData = await resDetail.json();
    carDetail = detailData.data?.[0];
  }

  // Lấy các dịch vụ khác cùng dòng xe
  let relatedDetails = [];
  if (car) {
    const resRelated = await fetch(
      `${STRAPI_URL}/api/car-service-details?filters[car_model][id][$eq]=${car.id}&filters[service][id][$ne]=${service.id}&populate[service][fields][0]=name&populate[service][fields][1]=slug&populate[service][fields][2]=description&populate[customImage]=true`,
      { cache: 'no-store' }
    );
    const relatedData = await resRelated.json();
    relatedDetails = relatedData.data || [];
  }

  // Cấu hình hình ảnh hiển thị
  let displayImage = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80';
  if (carDetail?.customImage?.url) {
    displayImage = `${STRAPI_URL}${carDetail.customImage.url}`;
  } else if (service.gallery?.[0]?.url) {
    displayImage = `${STRAPI_URL}${service.gallery[0].url}`;
  }

  // Xử lý khối văn bản (Blocks) của Strapi v5 thành HTML
  const renderRichText = (blocks) => {
    if (!blocks) return '<p>Nội dung đang được cập nhật...</p>';
    if (typeof blocks === 'string') return blocks;

    return blocks.map(block => {
      if (block.type === 'paragraph') {
        const text = block.children?.map(child => child.text).join('') || '';
        return `<p>${text}</p>`;
      }
      if (block.type === 'heading') {
        const text = block.children?.map(child => child.text).join('') || '';
        const level = block.level || 3;
        return `<h${level}>${text}</h${level}>`;
      }
      return '';
    }).join('');
  };

  return (
    <div className="detail-container">
      {/* HERO GRID */}
      <div className="detail-hero-grid">
        <div className="detail-img-wrapper" style={{ position: 'relative' }}>
          <img src={displayImage} alt={service.name} className="detail-img" />
          <div className="car-tag-on-image">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles" style={{color: 'var(--primary-light)'}}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/></svg>
            Hình ảnh thực tế trên {car?.name || 'VinFast'}
          </div>
        </div>
        
        <div className="detail-info-pane">
          <Link href="/" className="btn-back">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            Quay lại trang chủ
          </Link>
          <span className="detail-title-badge" style={{background: 'rgba(255,106,0,0.1)', color: 'var(--primary-light)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', width: 'fit-content', marginBottom: '1rem', fontWeight: 600}}>
            Gói dịch vụ dành riêng cho xe {car?.name}
          </span>
          <h2 className="detail-title" style={{fontSize: '2rem', fontWeight: 800, marginBottom: '1rem'}}>{service.name}</h2>
          <p style={{color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1.5rem'}}>{service.description}</p>
          
          {carDetail && (
            <div className="detail-price-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
              <div className="detail-price-val" style={{ margin: 0 }}>
                {formatDisplayPrice(carDetail)}
              </div>
              <ActionButtons carName={car?.name} serviceName={service.name} />
            </div>
          )}
        </div>
      </div>

      {/* DETAIL BODY */}
      <div className="detail-body-content">
        {/* Gallery (Đưa lên trên) */}
        {((carDetail?.gallery && carDetail.gallery.length > 0) || (service.gallery && service.gallery.length > 0)) && (
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '1.5rem' }}>
              Thư viện ảnh thực tế {carDetail?.gallery && carDetail.gallery.length > 0 ? `trên ${car?.name}` : ''}
            </h3>
            <div className="content-gallery">
              {(carDetail?.gallery && carDetail.gallery.length > 0 ? carDetail.gallery : service.gallery).map((img) => (
                <div key={img.id} className="gallery-item">
                  <img
                    src={`${STRAPI_URL}${img.url}`}
                    alt="Gallery"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chi tiết dịch vụ */}
        <CollapsibleContent htmlContent={renderRichText(service.richText)} />

        {/* Video */}
        {service.videoUrl && (
          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '1.5rem' }}>Video thi công thực tế</h3>
            <div className="video-container">
              <iframe
                src={service.videoUrl}
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Related Services */}
        {relatedDetails.length > 0 && (
          <div style={{ marginTop: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-light)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
              Các dịch vụ khác cho xe {car?.name}
            </h3>
            <div className="services-grid">
              {relatedDetails.map((detail) => {
                const s = detail.service;
                if (!s) return null;
                
                let imgUrl = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80';
                if (detail.customImage?.url) {
                  imgUrl = `${STRAPI_URL}${detail.customImage.url}`;
                }
                
                return (
                  <div key={detail.id} className="service-card">
                    <div className="service-image-container" style={{ position: 'relative' }}>
                      <img
                        src={imgUrl}
                        alt={s.name}
                        className="service-image"
                      />
                      <div className="car-tag-on-image">
                        <span style={{width: '6px', height: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%'}}></span>
                        Dành riêng cho {car?.name}
                      </div>
                    </div>
                    <div className="service-content">
                      <h3 className="service-title" style={{fontSize: '1.2rem'}}>{s.name}</h3>
                      <p className="service-desc">{s.description}</p>
                      <div className="service-footer">
                        <div>
                          <span className="price-value" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                            {formatDisplayPrice(detail)}
                          </span>
                        </div>
                        <Link
                          href={`/${car.slug}/${s.slug}`}
                          className="btn-action"
                        >
                          Xem chi tiết
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
