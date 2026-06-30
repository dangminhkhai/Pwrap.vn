'use client';

import React from 'react';

export default function FloatingContact() {
  return (
    <div className="floating-contact-container">
      {/* Nút Gọi Hotline */}
      <a href="tel:0833698888" className="floating-btn phone-btn" aria-label="Gọi điện hotline">
        <div className="phone-pulse"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone-call">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          <path d="M14.05 2a9 9 0 0 1 8 7.94"/>
          <path d="M14.05 6A5 5 0 0 1 18 10"/>
        </svg>
      </a>

      {/* Nút Chat Zalo */}
      <a href="https://zalo.me/0833698888" target="_blank" rel="noopener noreferrer" className="floating-btn zalo-btn" aria-label="Chat qua Zalo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" className="zalo-svg">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path fill="currentColor" d="M12 2C6.48 2 2 5.8 2 10.5c0 2.65 1.43 5.03 3.69 6.64-.17.72-.64 2.58-.69 2.78-.07.28.09.28.19.21.08-.06 1.28-.87 3.52-2.39.42.06.85.1 1.29.1 5.52 0 10-3.8 10-8.5S17.52 2 12 2zm-1.89 12.02c-.82 0-1.48-.67-1.48-1.49 0-.82.67-1.49 1.48-1.49.82 0 1.49.67 1.49 1.49 0 .82-.67 1.49-1.49 1.49zm4.21 0c-.82 0-1.48-.67-1.48-1.49 0-.82.67-1.49 1.48-1.49.82 0 1.49.67 1.49 1.49 0 .82-.67 1.49-1.49 1.49z"/>
          <text x="12" y="15.5" fontFamily="'Arial', sans-serif" fontSize="6.5" fontWeight="900" fill="var(--bg-color)" textAnchor="middle">Zalo</text>
        </svg>
      </a>

      {/* Nút Chat Messenger */}
      <a href="https://m.me/danbaovenoingoaithatoto" target="_blank" rel="noopener noreferrer" className="floating-btn messenger-btn" aria-label="Chat qua Messenger">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2c-5.52 0-10 4.2-10 9.39 0 2.95 1.47 5.58 3.76 7.27.19.14.31.36.31.59v2.24c0 .38.41.62.74.42l2.5-1.5c.16-.1.34-.14.53-.11 1.46.21 2.97.32 4.51.32 5.52 0 10-4.2 10-9.39s-4.48-9.39-10-9.39zm1.19 12.35l-2.43-2.6c-.45-.48-1.22-.48-1.67 0l-3.33 3.56c-.34.36-.84-.11-.56-.47l3.72-4.78c.45-.57 1.34-.57 1.79 0l2.43 2.6c.45.48 1.22.48 1.67 0l3.33-3.56c.34-.36.84.11.56.47l-3.72 4.78c-.45.57-1.34.57-1.79 0z"/>
        </svg>
      </a>
    </div>
  );
}
