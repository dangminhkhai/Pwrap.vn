'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ products: [], blogs: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchData, setSearchData] = useState({ products: [], blogs: [] });
  const [carModels, setCarModels] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') !== 'light';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Tải dữ liệu một lần để tìm kiếm tức thời trên Client
    const fetchSearchData = async () => {
      try {
        const STRAPI_URL = 'http://localhost:1337';
        const [resProducts, resBlogs, resCars] = await Promise.all([
          fetch(`${STRAPI_URL}/api/products?populate[car_model][fields][0]=name&populate[car_model][fields][1]=slug`, { cache: 'no-store' }),
          fetch(`${STRAPI_URL}/api/blogs?fields[0]=title&fields[1]=slug&fields[2]=seoDesc`, { cache: 'no-store' }),
          fetch(`${STRAPI_URL}/api/car-models?sort[0]=order:asc&fields[0]=name&fields[1]=slug&fields[2]=isHot`, { cache: 'no-store' })
        ]);
        const productsData = await resProducts.json();
        const blogsData = await resBlogs.json();
        const carsData = await resCars.json();
        
        setSearchData({
          products: productsData.data || [],
          blogs: blogsData.data || []
        });
        setCarModels(carsData.data || []);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu tìm kiếm:', error);
      }
    };
    fetchSearchData();
  }, []);

  // Xử lý tìm kiếm real-time
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ products: [], blogs: [] });
      setShowDropdown(false);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const queryTokens = query.split(/\s+/).filter(token => token.length > 0);

    if (queryTokens.length === 0) {
      setSearchResults({ products: [], blogs: [] });
      setShowDropdown(false);
      return;
    }
    
    // Lọc sản phẩm: Tất cả các từ khóa gõ vào đều phải xuất hiện trong Tiêu đề sản phẩm hoặc Tên dòng xe
    const filteredProducts = searchData.products.filter(product => {
      const title = product.title?.toLowerCase() || '';
      const cName = product.car_model?.name?.toLowerCase() || '';
      const cSlug = product.car_model?.slug?.toLowerCase() || '';
      const pSlug = product.slug?.toLowerCase() || '';
      
      const combinedText = `${title} ${cName} ${cSlug} ${pSlug}`;
      
      return queryTokens.every(token => combinedText.includes(token));
    });

    // Lọc bài viết cẩm nang: Tất cả các từ khóa đều phải xuất hiện trong Tiêu đề hoặc Mô tả
    const filteredBlogs = searchData.blogs.filter(b => {
      const title = b.title?.toLowerCase() || '';
      const desc = b.seoDesc?.toLowerCase() || '';
      const combinedText = `${title} ${desc}`;
      return queryTokens.every(token => combinedText.includes(token));
    });

    setSearchResults({
      products: filteredProducts,
      blogs: filteredBlogs
    });
    setShowDropdown(true);
  }, [searchQuery, searchData]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng mobile menu khi đổi kích thước màn hình lớn hơn mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 10002 }}>
      {/* Khối bên trái: Logo + Menu điều hướng */}
      <div className="header-left">
        <Link href="/" className="logo" onClick={() => setIsMobileMenuOpen(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check" style={{color: 'var(--primary-light)'}}><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/><path d="m9 12 2 2 4-4"/></svg>
          VINFAST <span>SPA</span>
        </Link>
        <div className="header-nav">
          <Link href="/" className="nav-link active">
            Trang Chủ
          </Link>
          <div className="nav-dropdown-container">
            <span className="nav-link dropdown-trigger">
              Danh Mục
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down dropdown-icon"><path d="m6 9 6 6 6-6"/></svg>
            </span>
            <div className="nav-dropdown-menu">
              {carModels.map((car) => (
                <Link 
                  key={car.id} 
                  href={`/${car.slug}`} 
                  className="dropdown-item"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
                >
                  <span>{car.name}</span>
                  {car.isHot && (
                    <span className="dropdown-hot-badge">HOT</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
          <a href="/#cam-nang" className="nav-link">
            Cẩm Nang
          </a>
        </div>
      </div>

      {/* Khối bên phải: Thanh tìm kiếm tổng hợp + Nút Ngày/Đêm + Nút Menu Mobile */}
      <div className="header-right">
        {/* THANH TÌM KIẾM TỔNG HỢP */}
        <div className="search-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search search-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder="Tìm sản phẩm, dòng xe, cẩm nang..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowDropdown(true)}
          />
          
          {/* Hộp kết quả gợi ý thả xuống */}
          {showDropdown && (
            <div className="search-results">
              {searchResults.products.length === 0 && searchResults.blogs.length === 0 ? (
                <div className="search-no-results">Không tìm thấy kết quả phù hợp</div>
              ) : (
                <>
                  {/* Nhóm Sản Phẩm */}
                  {searchResults.products.length > 0 && (
                    <div className="search-result-group">
                      <div className="search-result-group-title">Sản Phẩm Theo Xe</div>
                      {searchResults.products.map((product) => {
                        const car = product.car_model;
                        if (!car) return null;
                        return (
                          <Link
                            key={product.id}
                            href={`/${car.slug}/${product.slug}`}
                            className="search-result-item"
                            onClick={() => {
                              setShowDropdown(false);
                              setSearchQuery('');
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <span className="search-result-item-title">
                              {product.title} — <strong style={{color: 'var(--primary-light)'}}>{car.name}</strong>
                            </span>
                            <span className="search-result-item-desc">{product.shortDescription}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Nhóm Cẩm Nang */}
                  {searchResults.blogs.length > 0 && (
                    <div className="search-result-group">
                      <div className="search-result-group-title">Cẩm Nang</div>
                      {searchResults.blogs.map((b) => (
                        <Link
                          key={b.id}
                          href={`/bai-viet/${b.slug}`}
                          className="search-result-item"
                          onClick={() => {
                            setShowDropdown(false);
                            setSearchQuery('');
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <span className="search-result-item-title">{b.title}</span>
                          <span className="search-result-item-desc">{b.seoDesc}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Nút chuyển đổi giao diện Ngày/Đêm */}
        <button onClick={toggleTheme} className="btn-theme-toggle" aria-label="Toggle theme">
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M22 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          )}
        </button>

        {/* Nút Menu Hamburger cho Mobile */}
        <button className="btn-mobile-menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle mobile menu">
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          )}
        </button>
      </div>

      {/* Slide-out Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <nav className="mobile-nav-links">
            <Link href="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Trang Chủ
            </Link>
            
            <div className="mobile-nav-group">
              <div className="mobile-nav-group-title">Danh Mục Dòng Xe</div>
              <div className="mobile-nav-grid">
                {carModels.map((car) => (
                  <Link 
                    key={car.id} 
                    href={`/${car.slug}`} 
                    className="mobile-category-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>{car.name}</span>
                    {car.isHot && (
                      <span className="dropdown-hot-badge" style={{ margin: 0, padding: '2px 5px', fontSize: '0.6rem' }}>HOT</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <a href="/#cam-nang" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Cẩm Nang
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
