'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ services: [], blogs: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchData, setSearchData] = useState({ carServiceDetails: [], blogs: [] });

  useEffect(() => {
    const isDark = localStorage.getItem('theme') !== 'light';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Tải dữ liệu một lần để tìm kiếm tức thì trên Client
    const fetchSearchData = async () => {
      try {
        const STRAPI_URL = 'http://localhost:1337';
        const [resDetails, resBlogs] = await Promise.all([
          fetch(`${STRAPI_URL}/api/car-service-details?populate[car_model][fields][0]=name&populate[car_model][fields][1]=slug&populate[service][fields][0]=name&populate[service][fields][1]=slug&populate[service][fields][2]=description`, { cache: 'no-store' }),
          fetch(`${STRAPI_URL}/api/blogs?fields[0]=title&fields[1]=slug&fields[2]=seoDesc`, { cache: 'no-store' })
        ]);
        const detailsData = await resDetails.json();
        const blogsData = await resBlogs.json();
        setSearchData({
          carServiceDetails: detailsData.data || [],
          blogs: blogsData.data || []
        });
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu tìm kiếm:', error);
      }
    };
    fetchSearchData();
  }, []);

  // Xử lý tìm kiếm real-time khi gõ chữ (Thuật toán tìm kiếm liên hợp đa từ khóa)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ services: [], blogs: [] });
      setShowDropdown(false);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const queryTokens = query.split(/\s+/).filter(token => token.length > 0);

    if (queryTokens.length === 0) {
      setSearchResults({ services: [], blogs: [] });
      setShowDropdown(false);
      return;
    }
    
    // Lọc dịch vụ: Tất cả các từ khóa gõ vào đều phải xuất hiện trong Tên dịch vụ hoặc Tên dòng xe
    const filteredServices = searchData.carServiceDetails.filter(detail => {
      const sName = detail.service?.name?.toLowerCase() || '';
      const cName = detail.car_model?.name?.toLowerCase() || '';
      const cSlug = detail.car_model?.slug?.toLowerCase() || '';
      const sSlug = detail.service?.slug?.toLowerCase() || '';
      
      const combinedText = `${sName} ${cName} ${cSlug} ${sSlug}`;
      
      // Kiểm tra xem mọi từ đơn trong ô tìm kiếm có nằm trong chuỗi gộp không
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
      services: filteredServices,
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
    <header>
      {/* Khối bên trái: Logo + Menu điều hướng */}
      <div className="header-left">
        <Link href="/" className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check" style={{color: 'var(--primary-light)'}}><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/><path d="m9 12 2 2 4-4"/></svg>
          VINFAST <span>SPA</span>
        </Link>
        <div className="header-nav">
          <Link href="/" className="nav-link active">
            Trang Chủ
          </Link>
          <a href="/#dich-vu" className="nav-link">
            Dịch Vụ
          </a>
          <a href="/#cam-nang" className="nav-link">
            Cẩm Nang
          </a>
        </div>
      </div>

      {/* Khối bên phải: Thanh tìm kiếm tổng hợp + Nút Ngày/Đêm */}
      <div className="header-right">
        {/* THANH TÌM KIẾM TỔNG HỢP */}
        <div className="search-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search search-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder="Tìm dịch vụ, dòng xe, cẩm nang..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowDropdown(true)}
          />
          
          {/* Hộp kết quả gợi ý thả xuống */}
          {showDropdown && (
            <div className="search-results">
              {searchResults.services.length === 0 && searchResults.blogs.length === 0 ? (
                <div className="search-no-results">Không tìm thấy kết quả phù hợp</div>
              ) : (
                <>
                  {/* Nhóm Dịch Vụ kèm Xe */}
                  {searchResults.services.length > 0 && (
                    <div className="search-result-group">
                      <div className="search-result-group-title">Dịch Vụ Theo Xe</div>
                      {searchResults.services.map((detail) => {
                        const s = detail.service;
                        const car = detail.car_model;
                        if (!s || !car) return null;
                        return (
                          <Link
                            key={detail.id}
                            href={`/${car.slug}/${s.slug}`}
                            className="search-result-item"
                            onClick={() => {
                              setShowDropdown(false);
                              setSearchQuery('');
                            }}
                          >
                            <span className="search-result-item-title">
                              {s.name} — <strong style={{color: 'var(--primary-light)'}}>{car.name}</strong>
                            </span>
                            <span className="search-result-item-desc">{s.description}</span>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          )}
        </button>
      </div>
    </header>
  );
}
