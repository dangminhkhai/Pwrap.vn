'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function CategoryProductsList({ initialProducts, carName, carSlug }) {
  const [searchQuery, setSearchQuery] = useState('');
  const STRAPI_URL = 'http://localhost:1337';

  // Xử lý lọc sản phẩm bằng từ khóa (Token-based search)
  const query = searchQuery.toLowerCase().trim();
  const tokens = query.split(/\s+/).filter(t => t.length > 0);

  const filteredProducts = initialProducts.filter((product) => {
    if (tokens.length === 0) return true;

    const title = product.title?.toLowerCase() || '';

    // Chỉ tìm kiếm theo tiêu đề sản phẩm
    return tokens.every(token => title.includes(token));
  });

  return (
    <div style={{ marginBottom: '4rem' }}>
      
      {/* Tiêu đề & Thanh tìm kiếm nhỏ */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid" style={{ color: 'var(--primary-light)' }}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
          Sản phẩm hiện có ({filteredProducts.length})
        </h2>

        {/* Thanh tìm kiếm nhỏ riêng cho danh mục */}
        <div className="category-search-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="category-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Lưới sản phẩm */}
      {filteredProducts.length === 0 ? (
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          padding: '4rem 2rem',
          borderRadius: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          {initialProducts.length === 0 
            ? 'Hiện chưa có sản phẩm mẫu nào được thêm cho dòng xe này.' 
            : 'Không tìm thấy sản phẩm nào phù hợp với từ khóa của bạn.'}
        </div>
      ) : (
        <div className="services-grid">
          {filteredProducts.map((product) => {
            let imgUrl = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80';
            if (product.image?.url) {
              imgUrl = `${STRAPI_URL}${product.image.url}`;
            }

            return (
              <div key={product.id} className="service-card">
                <Link
                  href={`/${carSlug}/${product.slug}`}
                  className="service-image-container"
                  style={{ position: 'relative', display: 'block' }}
                >
                  <Image
                    src={imgUrl}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="service-image"
                  />
                  <div className="car-tag-on-image">
                    <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%' }}></span>
                    Dành riêng cho {carName}
                  </div>
                </Link>

                <div className="service-content">
                  <h3 className="service-title">
                    <Link href={`/${carSlug}/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {product.title}
                    </Link>
                  </h3>
                  <p className="service-desc">{product.shortDescription}</p>
                  <div className="service-footer">
                    <div>
                      <span className="price-value" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                        {product.price || 'Liên hệ'}
                      </span>
                    </div>
                    <Link href={`/${carSlug}/${product.slug}`} className="btn-action">
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
    </div>
  );
}
