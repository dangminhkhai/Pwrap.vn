import Link from 'next/link';
import Image from 'next/image';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const STRAPI_URL = 'http://localhost:1337';
  
  try {
    const resBlog = await fetch(`${STRAPI_URL}/api/blogs?filters[slug][$eq]=${slug}&populate=*`, { cache: 'no-store' });
    const blogData = await resBlog.json();
    const blog = blogData.data?.[0];

    if (!blog) {
      return {
        title: 'Không Tìm Thấy Bài Viết | VinFast Spa',
      };
    }

    const imageUrl = blog.cover ? `${STRAPI_URL}${blog.cover.url}` : '';

    return {
      title: `${blog.title} | VinFast Spa`,
      description: blog.seoDesc || 'Cẩm nang chia sẻ kinh nghiệm chăm sóc và làm đẹp xe điện VinFast chuyên nghiệp.',
      openGraph: {
        title: blog.title,
        description: blog.seoDesc || 'Cẩm nang chăm sóc xe điện VinFast',
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: blog.title }] : [],
        type: 'article',
      },
    };
  } catch (error) {
    return {
      title: 'Cẩm Nang Chăm Sóc Xe | VinFast Spa',
    };
  }
}

export default async function BlogDetailPage({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const STRAPI_URL = 'http://localhost:1337';

  // Lấy thông tin chi tiết bài viết
  const resBlog = await fetch(`${STRAPI_URL}/api/blogs?filters[slug][$eq]=${slug}&populate=*`, { cache: 'no-store' });
  const blogData = await resBlog.json();
  const blog = blogData.data?.[0];

  if (!blog) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifycontent: 'center' }}>
        <h2 style={{ color: 'var(--primary-light)', marginBottom: '1rem' }}>Không tìm thấy bài viết!</h2>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Quay lại trang chủ</Link>
      </div>
    );
  }

  // Chuyển đổi Markdown sang HTML
  const parseMarkdown = (markdown) => {
    if (!markdown) return '<p>Nội dung đang được cập nhật...</p>';
    
    let html = markdown;
    
    // 1. Tiêu đề H3, H2, H1
    html = html.replace(/^### (.*$)/gim, '<h3 style="color: var(--text-main) !important; margin: 2.25rem 0 1.25rem; font-weight: 800; font-size: 1.3rem; border-left: 3px solid var(--border-color); padding-left: 0.75rem; letter-spacing: -0.01em;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="color: var(--text-main) !important; margin: 2.75rem 0 1.5rem; font-weight: 850; font-size: 1.65rem; border-left: 4px solid var(--primary); padding-left: 0.85rem; letter-spacing: -0.015em; line-height: 1.3;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="color: var(--text-main) !important; margin: 3rem 0 1.75rem; font-weight: 900; font-size: 2.1rem; letter-spacing: -0.02em; line-height: 1.25;">$1</h1>');
    
    // 2. Định dạng ảnh dạng Markdown: ![alt](url) -> chuyển sang thẻ img với đường dẫn đầy đủ từ Strapi
    html = html.replace(/\!\[(.*?)\]\((.*?)\)/gim, (match, alt, url) => {
      const fullUrl = url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
      return `
        <div style="margin: 3rem 0; text-align: center;">
          <img src="${fullUrl}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 20px; border: 1px solid var(--border-color); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);" />
          ${alt ? `<p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.85rem; font-style: italic; text-align: center; letter-spacing: -0.01em;">${alt}</p>` : ''}
        </div>
      `;
    });

    // 3. Định dạng liên kết: [text](url) -> <a href="url">text</a>
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" style="color: var(--primary-light); text-decoration: none; font-weight: 600; border-bottom: 1px dashed var(--primary); transition: all 0.2s;">$1</a>');

    // 4. Chữ đậm: **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong style="color: var(--text-main); font-weight: 700;">$1</strong>');

    // 5. Chữ nghiêng: *text* -> <em>text</em>
    html = html.replace(/\*(.*?)\*/gim, '<em style="color: var(--text-muted);">$1</em>');

    // 6. Chia các đoạn văn bằng dấu xuống dòng kép
    const paragraphs = html.split(/\n\s*\n/);
    return paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';
      // Nếu đoạn văn đã là tiêu đề hoặc thẻ div hình ảnh, không bọc thẻ p nữa
      if (p.startsWith('<h') || p.startsWith('<div') || p.startsWith('<ul') || p.startsWith('<ol') || p.startsWith('<a')) {
        return p;
      }
      return `<p style="margin-bottom: 1.75rem; line-height: 1.85; font-size: 1.05rem; color: var(--text-main); letter-spacing: -0.01em;">${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');
  };

  // Định dạng ngày tháng
  const formattedDate = blog.publishedAt 
    ? new Date(blog.publishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '30 Tháng 6, 2026';

  // Tính thời gian đọc ước tính (trung bình 200 từ/phút)
  const wordsPerMinute = 200;
  const textLength = blog.content ? blog.content.split(/\s+/).length : 0;
  const readingTime = Math.ceil(textLength / wordsPerMinute) || 3;

  return (
    <div className="detail-container blog-detail-container" style={{ maxWidth: '1400px', margin: '0 auto', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '28px', padding: '2.5rem 2rem' }}>
      <Link href="/" className="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Quay lại trang chủ
      </Link>

      <div className="blog-header" style={{ marginTop: '0.5rem', marginBottom: '2.5rem' }}>
        <span className="blog-category-badge" style={{
          background: 'rgba(255, 61, 0, 0.08)',
          color: 'var(--primary-light)',
          padding: '0.4rem 0.85rem',
          borderRadius: '30px',
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'inline-block',
          marginBottom: '1.25rem',
          border: '1px solid rgba(255, 61, 0, 0.15)'
        }}>
          Cẩm Nang Chăm Sóc Xe
        </span>
        
        <h1 className="blog-title" style={{
          fontSize: '2.4rem',
          fontWeight: 850,
          lineHeight: '1.25',
          marginBottom: '1.25rem',
          background: 'linear-gradient(135deg, var(--text-main) 40%, var(--primary-light))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em'
        }}>
          {blog.title}
        </h1>
        
        <div className="blog-meta-row" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1.5rem'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            {formattedDate}
          </span>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--border-color)' }}></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {readingTime} phút đọc
          </span>
        </div>
      </div>

      {blog.cover && (
        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '2.5rem', position: 'relative', boxShadow: '0 20px 45px rgba(0, 0, 0, 0.4)' }}>
          <Image
            src={`${STRAPI_URL}${blog.cover.url}`}
            alt={blog.title}
            fill
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}

      {blog.seoDesc && (
        <div style={{
          background: 'rgba(255, 61, 0, 0.03)',
          borderLeft: '4px solid var(--primary)',
          borderRadius: '0 16px 16px 0',
          padding: '1.25rem 1.5rem',
          marginBottom: '2.5rem',
          fontSize: '1.08rem',
          lineHeight: '1.7',
          color: 'var(--text-main)',
          fontStyle: 'italic',
          boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.02)'
        }}>
          {blog.seoDesc}
        </div>
      )}

      <div 
        className="rich-text-content"
        style={{
          lineHeight: '1.85',
          fontSize: '1.05rem',
          color: 'var(--text-main)'
        }}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(blog.content) }}
      />
    </div>
  );
}
