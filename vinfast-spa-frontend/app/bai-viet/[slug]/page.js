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

  // Render Blocks của Strapi v5 sang HTML
  const renderRichText = (blocks) => {
    if (!blocks) return '<p>Nội dung đang được cập nhật...</p>';
    if (typeof blocks === 'string') return blocks;

    return blocks.map(block => {
      if (block.type === 'paragraph') {
        const text = block.children?.map(child => child.text).join('') || '';
        return `<p style="margin-bottom: 1.5rem; line-height: 1.8; font-size: 1.05rem; color: var(--text-main);">${text}</p>`;
      }
      if (block.type === 'heading') {
        const text = block.children?.map(child => child.text).join('') || '';
        const level = block.level || 2;
        return `<h${level} style="color: var(--primary-light) !important; margin: 2rem 0 1rem; font-weight: 700; font-size: 1.6rem;">${text}</h${level}>`;
      }
      return '';
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
        dangerouslySetInnerHTML={{ __html: renderRichText(blog.content) }}
      />
    </div>
  );
}
