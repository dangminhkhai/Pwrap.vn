'use client';

import { useState, useRef, useEffect } from 'react';

export default function CollapsibleContent({ htmlContent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      // Nếu chiều cao thực tế của nội dung lớn hơn 220px mới hiển thị nút Xem thêm
      if (contentRef.current.scrollHeight > 220) {
        setShouldShowButton(true);
      }
    }
  }, [htmlContent]);

  return (
    <div className="collapsible-container">
      <div
        ref={contentRef}
        className={`collapsible-content-wrapper ${isExpanded ? 'expanded' : 'collapsed'}`}
        style={{
          maxHeight: isExpanded ? 'none' : '200px',
          overflow: 'hidden',
          position: 'relative',
          transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      
      {shouldShowButton && (
        <div className="collapsible-btn-wrapper">
          {!isExpanded && <div className="collapsible-fade-overlay" />}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-collapsible-toggle"
          >
            {isExpanded ? (
              <>
                Thu gọn nội dung
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>
              </>
            ) : (
              <>
                Xem thêm chi tiết dịch vụ
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
