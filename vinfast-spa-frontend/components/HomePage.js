'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

export default function HomePage({ carModels, services, carServiceDetails, blogs }) {
  const [selectedCarId, setSelectedCarId] = useState(carModels[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const STRAPI_URL = 'http://localhost:1337';

  // Reset thanh tìm kiếm khi đổi xe
  useEffect(() => {
    setSearchQuery('');
  }, [selectedCarId]);

  // Lọc các dịch vụ áp dụng cho dòng xe đang chọn
  const activeServices = services.filter(service => {
    const detail = carServiceDetails.find(
      d => d.car_model?.id === selectedCarId && d.service?.id === service.id
    );
    return !!detail;
  });

  // Lọc thêm theo từ khóa tìm kiếm trong dòng xe
  const filteredServices = activeServices.filter((service) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      service.name?.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query)
    );
  });

  const getCarServiceConfig = (serviceId) => {
    const detail = carServiceDetails.find(
      d => d.car_model?.id === selectedCarId && d.service?.id === serviceId
    );
    if (!detail) return null;

    let imageUrl = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80';
    if (detail.customImage?.url) {
      imageUrl = `${STRAPI_URL}${detail.customImage.url}`;
    } else if (services.find(s => s.id === serviceId)?.gallery?.[0]?.url) {
      imageUrl = `${STRAPI_URL}${services.find(s => s.id === serviceId).gallery[0].url}`;
    }

    return {
      minPrice: detail.minPrice,
      maxPrice: detail.maxPrice,
      image: imageUrl
    };
  };

  return (
    <div id="viewHome" className="view-section active">
      {/* HERO SECTION */}
      <section className="hero">
        <h1>Cá Nhân Hóa Dịch Vụ Cho <span style={{color: 'var(--accent)'}}>Từng Dòng Xe VinFast</span></h1>
        <p>Chọn dòng xe của bạn để xem hình ảnh thi công thực tế và bảng giá trọn gói tối ưu nhất.</p>
      </section>

      {/* CAR SELECTOR SECTION */}
      <section className="car-selector-container">
        <h2 className="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-car" style={{color: 'var(--primary-light)'}}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          Bước 1: Chọn dòng xe của bạn
        </h2>
        <div className="car-tabs">
          {carModels.map((car) => (
            <div
              key={car.id}
              onClick={() => setSelectedCarId(car.id)}
              className={`car-tab ${selectedCarId === car.id ? 'active' : ''}`}
            >
              <span className="car-name">{car.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES GRID SECTION */}
      <section style={{marginBottom: '4rem'}}>
        <h2 className="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wrench" style={{color: 'var(--primary-light)'}}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          Bước 2: Các gói dịch vụ khuyên dùng
        </h2>

        {activeServices.length === 0 ? (
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            padding: '3rem 1rem',
            borderRadius: '24px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            width: '100%'
          }}>
            Chưa có dịch vụ nào được cấu hình cho dòng xe này trong trang quản trị.
          </div>
        ) : (
          <div className="services-grid" id="servicesGrid">
            {activeServices.map((service) => {
              const config = getCarServiceConfig(service.id);
              if (!config) return null;

              return (
                <div key={service.id} className="service-card">
                  {/* Click vào ảnh để xem chi tiết */}
                  <Link
                    href={`/${carModels.find(c => c.id === selectedCarId)?.slug}/${service.slug}`}
                    className="service-image-container"
                    style={{ position: 'relative', display: 'block' }}
                  >
                    <Image
                      src={config.image}
                      alt={service.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="service-image"
                    />
                    <div className="car-tag-on-image">
                      <span style={{width: '6px', height: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%'}}></span>
                      Dành riêng cho {carModels.find(c => c.id === selectedCarId)?.name}
                    </div>
                  </Link>

                  <div className="service-content">
                    {/* Click vào tiêu đề để xem chi tiết */}
                    <h3 className="service-title">
                      <Link
                        href={`/${carModels.find(c => c.id === selectedCarId)?.slug}/${service.slug}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {service.name}
                      </Link>
                    </h3>
                    <p className="service-desc">{service.description}</p>
                    <div className="service-footer">
                      <div>
                        <span className="price-value" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                          {formatDisplayPrice(config)}
                        </span>
                      </div>
                      <Link
                        href={`/${carModels.find(c => c.id === selectedCarId)?.slug}/${service.slug}`}
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
        )}
      </section>

      {/* BLOG SECTION */}
      <section className="blog-home-section">
        <h2 className="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open" style={{color: 'var(--primary-light)'}}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          Cẩm nang & Tư vấn chăm sóc xe điện
        </h2>
        
        {blogs.length === 0 ? (
          <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Chưa có bài viết nào được xuất bản.</div>
        ) : (
          <div className="blog-grid">
            {blogs.map((blog) => (
              <Link key={blog.id} href={`/bai-viet/${blog.slug}`} className="blog-card">
                <div className="blog-cover-container" style={{ position: 'relative' }}>
                  <Image
                    src={blog.cover?.url ? `${STRAPI_URL}${blog.cover.url}` : 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="blog-cover"
                  />
                </div>
                <div className="blog-content">
                  <h3 className="blog-title" style={{color: 'var(--text-main) !important'}}>{blog.title}</h3>
                  <p className="blog-excerpt">{blog.seoDesc || 'Xem chi tiết cẩm nang hướng dẫn chăm sóc xe từ chuyên gia...'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
