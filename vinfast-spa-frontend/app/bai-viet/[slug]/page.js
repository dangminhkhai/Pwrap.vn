import Link from 'next/link';

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
    html = html.replace(/^### (.*$)/gim, '<h3 style="color: var(--primary-light) !important; margin: 2rem 0 1rem; font-weight: 700; font-size: 1.3rem;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="color: var(--primary-light) !important; margin: 2rem 0 1rem; font-weight: 700; font-size: 1.6rem;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="color: var(--primary-light) !important; margin: 2rem 0 1rem; font-weight: 700; font-size: 2rem;">$1</h1>');
    
    // 2. Định dạng ảnh dạng Markdown: ![alt](url) -> chuyển sang thẻ img với đường dẫn đầy đủ từ Strapi
    html = html.replace(/\!\[(.*?)\]\((.*?)\)/gim, (match, alt, url) => {
      const fullUrl = url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
      return `
        <div style="margin: 2.5rem 0; text-align: center;">
          <img src="${fullUrl}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);" />
          ${alt ? `<p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.75rem; font-style: italic; text-align: center;">${alt}</p>` : ''}
        </div>
      `;
    });

    // 3. Định dạng liên kết: [text](url) -> <a href="url">text</a>
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" style="color: var(--primary-light); text-decoration: underline;">$1</a>');

    // 4. Chữ đậm: **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // 5. Chữ nghiêng: *text* -> <em>text</em>
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // 6. Chia các đoạn văn bằng dấu xuống dòng kép
    const paragraphs = html.split(/\n\s*\n/);
    return paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';
      // Nếu đoạn văn đã là tiêu đề hoặc thẻ div hình ảnh, không bọc thẻ p nữa
      if (p.startsWith('<h') || p.startsWith('<div') || p.startsWith('<ul') || p.startsWith('<ol') || p.startsWith('<a')) {
        return p;
      }
      return `<p style="margin-bottom: 1.5rem; line-height: 1.8; font-size: 1.05rem; color: var(--text-main);">${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');
  };

  return (
    <div className="detail-container" style={{ padding: '3rem', maxWidth: '900px', margin: '0 auto' }}>
      <Link href="/" className="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Quay lại trang chủ
      </Link>

      {blog.cover && (
        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '2.5rem', position: 'relative' }}>
          <img
            src={`${STRAPI_URL}${blog.cover.url}`}
            alt={blog.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <h1 className="blog-title" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary-light) !important' }}>
        {blog.title}
      </h1>

      {blog.seoDesc && (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', borderLeft: '3px solid var(--primary)', paddingLeft: '1rem', marginBottom: '2.5rem', fontSize: '1rem', lineHeight: '1.6' }}>
          {blog.seoDesc}
        </p>
      )}

      <div 
        className="rich-text-content"
        style={{
          lineHeight: '1.8',
          fontSize: '1.05rem',
          color: 'var(--text-main)'
        }}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(blog.content) }}
      />
    </div>
  );
}
