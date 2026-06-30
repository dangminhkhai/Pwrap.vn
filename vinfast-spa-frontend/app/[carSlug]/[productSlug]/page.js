import Link from 'next/link';
import Image from 'next/image';
import CollapsibleContent from '../../../components/CollapsibleContent';
import ActionButtons from '../../../components/ActionButtons';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { carSlug, productSlug } = resolvedParams;
  const STRAPI_URL = 'http://localhost:1337';
  
  try {
    const res = await fetch(`${STRAPI_URL}/api/products?filters[slug][$eq]=${productSlug}&filters[car_model][slug][$eq]=${carSlug}&populate=*`, { cache: 'no-store' });
    const data = await res.json();
    const product = data.data?.[0];

    if (!product) {
      return {
        title: 'Sản Phẩm | VinFast Spa',
      };
    }

    const title = `${product.title} | Giá bán & Chi tiết`;
    const description = product.shortDescription || `Chi tiết sản phẩm ${product.title} dành riêng cho dòng xe VinFast tại VinFast Spa.`;
    const imageUrl = product.image ? `${STRAPI_URL}${product.image.url}` : '';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: imageUrl ? [{ url: imageUrl, width: 800, height: 600, alt: title }] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Chi Tiết Sản Phẩm | VinFast Spa',
    };
  }
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const { carSlug, productSlug } = resolvedParams;
  const STRAPI_URL = 'http://localhost:1337';

  // 1. Lấy thông tin sản phẩm theo slug và carSlug
  const resProduct = await fetch(`${STRAPI_URL}/api/products?filters[slug][$eq]=${productSlug}&filters[car_model][slug][$eq]=${carSlug}&populate=*`, { cache: 'no-store' });
  const productData = await resProduct.json();
  const product = productData.data?.[0];

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: 'var(--primary-light)', marginBottom: '1rem' }}>Không tìm thấy sản phẩm!</h2>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Quay lại trang chủ</Link>
      </div>
    );
  }

  const car = product.car_model;

  // 2. Lấy các sản phẩm khác cùng dòng xe (Sản phẩm liên quan)
  const resRelated = await fetch(`${STRAPI_URL}/api/products?filters[car_model][slug][$eq]=${carSlug}&filters[slug][$ne]=${productSlug}&populate=*`, { cache: 'no-store' });
  const relatedData = await resRelated.json();
  const relatedProducts = relatedData.data || [];

  // Cấu hình hình ảnh hiển thị
  let displayImage = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80';
  if (product.image?.url) {
    displayImage = `${STRAPI_URL}${product.image.url}`;
  }

  // Bộ chuyển đổi Markdown sang HTML
  const renderRichText = (content) => {
    if (!content) return '<p>Nội dung đang được cập nhật...</p>';
    
    if (typeof content === 'string') {
      let html = content;
      html = html.replace(/\r\n/g, '\n');
      
      // Xử lý tiêu đề
      html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
      
      // Xử lý chữ đậm & nghiêng
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Xử lý danh sách
      html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
      html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
      html = html.replace(/<\/ul>\s*<ul>/g, '');
      
      // Xử lý đoạn văn
      html = html.split(/\n\s*\n/).map(p => {
        const trimmed = p.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<li')) {
          return trimmed;
        }
        return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
      }).join('\n');
      
      return html;
    }

    return '';
  };

  return (
    <div className="detail-container">
      {/* HERO GRID */}
      <div className="detail-hero-grid">
        <div className="detail-img-wrapper" style={{ position: 'relative' }}>
          <Image
            src={displayImage}
            alt={product.title}
            className="detail-img"
            width={800}
            height={500}
            priority
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
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
          <span className="detail-title-badge" style={{background: 'rgba(255,61,0,0.1)', color: 'var(--primary-light)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', width: 'fit-content', marginBottom: '1rem', fontWeight: 600}}>
            Sản phẩm dành riêng cho xe {car?.name}
          </span>
          <h2 className="detail-title" style={{fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--primary-light)'}}>{product.title}</h2>
          <p style={{color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1.5rem'}}>{product.shortDescription}</p>
          
          <div className="detail-price-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
            <div className="detail-price-val" style={{ margin: 0 }}>
              {product.price || 'Liên hệ'}
            </div>
            <ActionButtons carName={car?.name} serviceName={product.title} />
          </div>
        </div>
      </div>

      {/* DETAIL BODY */}
      <div className="detail-body-content">
        {/* Gallery */}
        {product.gallery && product.gallery.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '1.5rem' }}>
              Thư viện ảnh thực tế trên {car?.name}
            </h3>
            <div className="content-gallery">
              {product.gallery.map((img) => (
                <div key={img.id} className="gallery-item" style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
                  <Image
                    src={`${STRAPI_URL}${img.url}`}
                    alt="Gallery"
                    width={400}
                    height={280}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chi tiết sản phẩm */}
        <CollapsibleContent htmlContent={renderRichText(product.description)} />

        {/* Sản phẩm liên quan */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-light)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
              Các sản phẩm khác cho xe {car?.name}
            </h3>
            <div className="services-grid">
              {relatedProducts.map((p) => {
                let imgUrl = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80';
                if (p.image?.url) {
                  imgUrl = `${STRAPI_URL}${p.image.url}`;
                }
                
                return (
                  <div key={p.id} className="service-card">
                    <div className="service-image-container" style={{ position: 'relative' }}>
                      <Image
                        src={imgUrl}
                        alt={p.title}
                        className="service-image"
                        width={400}
                        height={250}
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="car-tag-on-image">
                        <span style={{width: '6px', height: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%'}}></span>
                        Dành riêng cho {car?.name}
                      </div>
                    </div>
                    <div className="service-content">
                      <h3 className="service-title" style={{fontSize: '1.2rem'}}>{p.title}</h3>
                      <p className="service-desc">{p.shortDescription}</p>
                      <div className="service-footer">
                        <div>
                          <span className="price-value" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                            {p.price || 'Liên hệ'}
                          </span>
                        </div>
                        <Link
                          href={`/${car.slug}/${p.slug}`}
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
