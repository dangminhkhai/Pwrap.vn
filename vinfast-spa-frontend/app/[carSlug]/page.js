import Link from 'next/link';
import Image from 'next/image';
import CollapsibleContent from '../../components/CollapsibleContent';
import CategoryProductsList from '../../components/CategoryProductsList';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { carSlug } = resolvedParams;
  const STRAPI_URL = 'http://localhost:1337';
  
  try {
    const res = await fetch(`${STRAPI_URL}/api/car-models?filters[slug][$eq]=${carSlug}`, { cache: 'no-store' });
    const data = await res.json();
    const car = data.data?.[0];

    if (!car) {
      return {
        title: 'Dòng Xe | VinFast Spa',
      };
    }

    const title = car.seoTitle || `Nâng Cấp Xe ${car.name} Chuyên Nghiệp | VinFast Spa`;
    const description = car.seoDescription || car.description || `Tổng hợp các sản phẩm và giải pháp nâng cấp tối ưu cho dòng xe ${car.name} tại VinFast Spa.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
      },
    };
  } catch (error) {
    return {
      title: 'Danh Mục Dòng Xe | VinFast Spa',
    };
  }
}

export default async function CarCategoryPage({ params }) {
  const resolvedParams = await params;
  const { carSlug } = resolvedParams;
  const STRAPI_URL = 'http://localhost:1337';

  // 1. Lấy thông tin dòng xe
  const resCar = await fetch(`${STRAPI_URL}/api/car-models?filters[slug][$eq]=${carSlug}&populate=*`, { cache: 'no-store' });
  const carData = await resCar.json();
  const car = carData.data?.[0];

  if (!car) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: 'var(--primary-light)', marginBottom: '1rem' }}>Không tìm thấy dòng xe này!</h2>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Quay lại trang chủ</Link>
      </div>
    );
  }

  // 2. Lấy toàn bộ sản phẩm thuộc dòng xe này
  const resProducts = await fetch(`${STRAPI_URL}/api/products?filters[car_model][slug][$eq]=${carSlug}&populate=*`, { cache: 'no-store' });
  const productsData = await resProducts.json();
  const products = productsData.data || [];

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '2rem 1rem' }}>
      
      {/* Quay lại trang chủ */}
      <Link href="/" className="btn-back" style={{ marginBottom: '2rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Quay lại trang chủ
      </Link>

      {/* BANNER DANH MỤC */}
      {(() => {
        const bannerUrl = car.banner?.url ? `${STRAPI_URL}${car.banner.url}` : null;
        return (
          <div 
            className="detail-container category-banner-container" 
            style={{ 
              padding: '5rem 2rem', 
              marginBottom: '3rem', 
              textAlign: 'center', 
              borderRadius: '24px',
              position: 'relative',
              overflow: 'hidden',
              backgroundImage: bannerUrl 
                ? `linear-gradient(to bottom, rgba(8, 8, 10, 0.45) 0%, rgba(8, 8, 10, 0.9) 100%), url(${bannerUrl})`
                : 'none',
              backgroundColor: bannerUrl ? 'transparent' : 'var(--card-bg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              border: 'none',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            <span style={{ color: 'var(--primary-light)', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.15em', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>Danh mục sản phẩm</span>
            <h1 style={{ fontSize: '2.8rem', color: 'var(--primary-light)', fontWeight: 900, marginTop: '0.5rem', marginBottom: '1.25rem', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
              {car.name}
            </h1>
            {car.description ? (
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: '750px', margin: '0 auto', lineHeight: '1.7', fontSize: '1.05rem', textShadow: '0 2px 8px rgba(0,0,0,0.6)', fontWeight: 500 }}>
                {car.description}
              </p>
            ) : (
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: '750px', margin: '0 auto', lineHeight: '1.7', fontSize: '1.05rem', textShadow: '0 2px 8px rgba(0,0,0,0.6)', fontWeight: 500 }}>
                Tổng hợp toàn bộ các gói nâng cấp phụ kiện, dán phim chống nóng và dán PPF bảo vệ chính hãng cho xe điện {car.name}.
              </p>
            )}
          </div>
        );
      })()}

      {/* DANH SÁCH SẢN PHẨM */}
      <CategoryProductsList initialProducts={products} carName={car.name} carSlug={carSlug} />

      {/* MÔ TẢ DÀI SEO (COLLAPSIBLE) */}
      {car.showLongDescription && car.longDescription && (
        <div style={{ marginTop: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-light)', paddingBottom: '0.5rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Thông tin chi tiết & Tư vấn nâng cấp {car.name}
          </h3>
          <CollapsibleContent htmlContent={renderRichText(car.longDescription)} />
        </div>
      )}

    </div>
  );
}
