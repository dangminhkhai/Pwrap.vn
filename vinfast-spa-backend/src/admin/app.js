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
          el.style.color = '#ff4444';
          el.style.fontWeight = '700';
        } else if (text === 'Đã tư vấn') {
          el.style.color = '#ff9f00';
          el.style.fontWeight = '700';
        } else if (text === 'Đã chốt dịch vụ') {
          el.style.color = '#28a745';
          el.style.fontWeight = '700';
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
