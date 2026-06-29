const config = {
  locales: [],
};

const bootstrap = (app) => {
  // Sử dụng MutationObserver để tự động nhận diện và tô màu các trạng thái thành Huy hiệu (Badge) đẹp mắt
  const observer = new MutationObserver(() => {
    const elements = document.querySelectorAll('td, span, div');
    elements.forEach(el => {
      // Chỉ xử lý các thẻ chứa text trực tiếp (không có thẻ con) để tránh lỗi giao diện
      if (el.children.length === 0) {
        const text = el.textContent.trim();
        
        if (text === 'Chưa liên hệ') {
          el.style.backgroundColor = 'rgba(255, 68, 68, 0.12)';
          el.style.color = '#ff4444';
          el.style.padding = '4px 12px';
          el.style.borderRadius = '12px';
          el.style.fontWeight = '600';
          el.style.display = 'inline-block';
          el.style.fontSize = '0.8rem';
          el.style.border = '1px solid rgba(255, 68, 68, 0.2)';
        } else if (text === 'Đã tư vấn') {
          el.style.backgroundColor = 'rgba(255, 165, 0, 0.12)';
          el.style.color = '#ff9f00';
          el.style.padding = '4px 12px';
          el.style.borderRadius = '12px';
          el.style.fontWeight = '600';
          el.style.display = 'inline-block';
          el.style.fontSize = '0.8rem';
          el.style.border = '1px solid rgba(255, 165, 0, 0.2)';
        } else if (text === 'Đã chốt dịch vụ') {
          el.style.backgroundColor = 'rgba(40, 167, 69, 0.12)';
          el.style.color = '#28a745';
          el.style.padding = '4px 12px';
          el.style.borderRadius = '12px';
          el.style.fontWeight = '600';
          el.style.display = 'inline-block';
          el.style.fontSize = '0.8rem';
          el.style.border = '1px solid rgba(40, 167, 69, 0.2)';
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

export default {
  config,
  bootstrap,
};
