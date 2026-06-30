const config = {
  locales: ['vi'],
};

const bootstrap = (app) => {
  // Can thiệp (Intercept) vào window.fetch để bắt lấy Token Authorization thực tế từ các cuộc gọi của Strapi
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const [url, config] = args;
    if (config && config.headers) {
      const auth = config.headers['Authorization'] || config.headers['authorization'] || config.headers.get?.('Authorization');
      if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) {
        const token = auth.split(' ')[1];
        if (token && token !== 'null' && token !== 'undefined') {
          window.strapiToken = token;
        }
      }
    }
    return originalFetch.apply(this, args);
  };

  // 1. Sử dụng MutationObserver để tự động nhận diện và tô màu các trạng thái thành Huy hiệu (Badge) đẹp mắt
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

    // 2. Tự động tiêm Widget danh sách Khách hàng Đăng ký mới lên Trang chủ (Dashboard)
    const isHomepage = window.location.pathname === '/admin' || window.location.pathname === '/admin/';
    if (isHomepage) {
      const mainElement = document.querySelector('main');
      if (mainElement && !document.getElementById('custom-leads-dashboard-widget')) {
        injectLeadsWidget(mainElement);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

async function injectLeadsWidget(parent) {
  // Ngăn chặn việc gọi API trùng lặp khi DOM thay đổi liên tục
  if (window.isLeadsWidgetLoading) return;
  window.isLeadsWidgetLoading = true;

  // Tạo container cho widget với kích thước tối đa 1024px và khoảng cách dưới 20px
  const widget = document.createElement('div');
  widget.id = 'custom-leads-dashboard-widget';
  widget.style.cssText = `
    background: var(--theme-colors-neutral-0, #ffffff);
    border: 1px solid var(--theme-colors-neutral-150, #e3e3e3);
    border-radius: 8px;
    padding: 24px;
    margin: 56px;
    margin-bottom: 20px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    color: var(--theme-colors-neutral-800, #32324d);
    font-family: system-ui, -apple-system, sans-serif;
  `;

  widget.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--theme-colors-neutral-150, #e3e3e3); padding-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="width: 8px; height: 8px; background: #ff4444; border-radius: 50%; display: inline-block; animation: pulse-dot 1.5s infinite;"></span>
        <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: var(--theme-colors-neutral-800, #32324d);">Khách Hàng Đăng Ký Tư Vấn Mới Nhất</h2>
      </div>
      <a href="/admin/content-manager/collection-types/api::lead.lead" style="color: #4945ff; text-decoration: none; font-size: 14px; font-weight: 600;">Xem tất cả</a>
    </div>
    <div id="leads-loading" style="padding: 16px; text-align: center; color: var(--theme-colors-neutral-500, #8e8ea9);">Đang tải danh sách đăng ký mới...</div>
    <div id="leads-list-container" style="display: none;">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 1px solid var(--theme-colors-neutral-150, #e3e3e3); color: var(--theme-colors-neutral-500, #8e8ea9);">
            <th style="padding: 8px 0; font-weight: 500;">Tên khách hàng</th>
            <th style="padding: 8px 0; font-weight: 500;">Số điện thoại</th>
            <th style="padding: 8px 0; font-weight: 500;">Dòng xe</th>
            <th style="padding: 8px 0; font-weight: 500;">Dịch vụ yêu cầu</th>
            <th style="padding: 8px 0; font-weight: 500;">Thời gian đăng ký</th>
            <th style="padding: 8px 0; font-weight: 500;">Trạng thái</th>
          </tr>
        </thead>
        <tbody id="leads-table-body">
        </tbody>
      </table>
    </div>
    <style>
      @keyframes pulse-dot {
        0% { transform: scale(0.95); opacity: 0.5; }
        50% { transform: scale(1.2); opacity: 1; }
        100% { transform: scale(0.95); opacity: 0.5; }
      }
      #custom-leads-dashboard-widget a:hover {
        text-decoration: underline !important;
      }
      .status-select {
        background: transparent;
        border: 1px solid var(--theme-colors-neutral-200, #dcdce4);
        border-radius: 4px;
        padding: 4px 8px;
        font-weight: 700;
        cursor: pointer;
        outline: none;
        transition: all 0.2s;
      }
      .status-select:hover {
        border-color: var(--theme-colors-primary-500, #4945ff);
      }
    </style>
  `;

  // Định nghĩa hàm cập nhật trạng thái qua API Content Manager của Strapi v5
  async function updateLeadStatus(docId, newStatus, btnEl) {
    btnEl.textContent = '...';
    btnEl.disabled = true;

    try {
      const token = window.strapiToken;
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${window.location.origin}/content-manager/collection-types/api::lead.lead/${docId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ leadStatus: newStatus })
      });

      if (!res.ok) throw new Error('PUT failed: ' + res.status);

      // Cập nhật màu sắc dropdown
      const selectEl = document.getElementById(`select-status-${docId}`);
      if (selectEl) {
        let statusColor = '#ff4444';
        if (newStatus === 'Đã tư vấn') statusColor = '#ff9f00';
        else if (newStatus === 'Đã chốt dịch vụ') statusColor = '#28a745';
        selectEl.style.color = statusColor;
        selectEl.setAttribute('data-original', newStatus);
      }

      btnEl.textContent = '✓';
      btnEl.style.background = '#28a745';
      btnEl.style.borderColor = '#28a745';
      setTimeout(() => {
        btnEl.textContent = 'Lưu';
        btnEl.style.background = '#4945ff';
        btnEl.style.borderColor = '#4945ff';
        btnEl.disabled = false;
      }, 1200);
    } catch (err) {
      console.error('Lỗi khi lưu trạng thái:', err);
      btnEl.textContent = 'Lỗi!';
      btnEl.style.background = '#ff4444';
      btnEl.style.borderColor = '#ff4444';
      setTimeout(() => {
        btnEl.textContent = 'Lưu';
        btnEl.style.background = '#4945ff';
        btnEl.style.borderColor = '#4945ff';
        btnEl.disabled = false;
      }, 1500);
    }
  }

  // Chèn vào vị trí thứ hai trong thẻ main (ngay sau banner chào mừng của Strapi)
  if (parent.children.length > 0) {
    parent.insertBefore(widget, parent.children[1] || null);
  } else {
    parent.appendChild(widget);
  }

  let retries = 0;
  
  async function fetchLeads() {
    try {
      // Lấy token được bắt từ fetch interceptor
      const token = window.strapiToken;

      // Nếu chưa bắt được token và chưa quá 6 lần thử (6 giây), đợi 1 giây rồi thử lại
      if (!token && retries < 6) {
        retries++;
        setTimeout(fetchLeads, 1000);
        return;
      }

      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(window.location.origin + '/content-manager/collection-types/api::lead.lead?pageSize=5&sort=createdAt:DESC', {
        headers
      });
      
      // Nếu bị 401 và chưa quá 6 lần thử, thử lại sau 1 giây
      if (res.status === 401 && retries < 6) {
        retries++;
        window.strapiToken = null;
        setTimeout(fetchLeads, 1000);
        return;
      }

      if (!res.ok) throw new Error('Không thể tải dữ liệu (Mã lỗi: ' + res.status + ')');
      
      const data = await res.json();
      const leads = data.results || [];

      const loadingEl = document.getElementById('leads-loading');
      const containerEl = document.getElementById('leads-list-container');
      const tbodyEl = document.getElementById('leads-table-body');

      if (loadingEl && containerEl && tbodyEl) {
        loadingEl.style.display = 'none';
        
        if (leads.length === 0) {
          loadingEl.style.display = 'block';
          loadingEl.textContent = 'Chưa có yêu cầu tư vấn nào được ghi nhận.';
          return;
        }

        containerEl.style.display = 'block';
        tbodyEl.innerHTML = leads.map(lead => {
          const date = new Date(lead.createdAt).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          // Strapi v5 sử dụng documentId (UUID) thay vì id (số) cho API content-manager
          const docId = lead.documentId || lead.id;

          let statusColor = '#ff4444';
          if (lead.leadStatus === 'Đã tư vấn') statusColor = '#ff9f00';
          else if (lead.leadStatus === 'Đã chốt dịch vụ') statusColor = '#28a745';

          return `
            <tr style="border-bottom: 1px solid var(--theme-colors-neutral-100, #f6f6f9);">
              <td style="padding: 12px 0; font-weight: 600; color: var(--theme-colors-neutral-800, #32324d);">${lead.name || 'N/A'}</td>
              <td style="padding: 12px 0;">
                <a href="tel:${lead.phone}" style="color: #4945ff; text-decoration: none; font-weight: 500;">${lead.phone || 'N/A'}</a>
              </td>
              <td style="padding: 12px 0; color: var(--theme-colors-neutral-600, #4a4a6a);">${lead.carName || 'N/A'}</td>
              <td style="padding: 12px 0; color: var(--theme-colors-neutral-600, #4a4a6a);">${lead.serviceName || 'N/A'}</td>
              <td style="padding: 12px 0; color: var(--theme-colors-neutral-500, #8e8ea9);">${date}</td>
              <td style="padding: 12px 0;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <select 
                    id="select-status-${docId}" 
                    class="status-select" 
                    style="color: ${statusColor};" 
                    data-original="${lead.leadStatus || 'Chưa liên hệ'}"
                    data-docid="${docId}"
                  >
                    <option value="Chưa liên hệ" ${lead.leadStatus === 'Chưa liên hệ' ? 'selected' : ''} style="color: #ff4444;">Chưa liên hệ</option>
                    <option value="Đã tư vấn" ${lead.leadStatus === 'Đã tư vấn' ? 'selected' : ''} style="color: #ff9f00;">Đã tư vấn</option>
                    <option value="Đã chốt dịch vụ" ${lead.leadStatus === 'Đã chốt dịch vụ' ? 'selected' : ''} style="color: #28a745;">Đã chốt dịch vụ</option>
                  </select>
                  <button 
                    id="btn-save-${docId}" 
                    class="btn-save-status"
                    data-docid="${docId}"
                    style="background: #4945ff; color: #fff; border: 1px solid #4945ff; border-radius: 4px; padding: 4px 10px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s;"
                  >Lưu</button>
                </div>
              </td>
            </tr>
          `;
        }).join('');

        // Đăng ký sự kiện bấm nút Lưu bằng addEventListener (tuân thủ CSP)
        leads.forEach(lead => {
          const docId = lead.documentId || lead.id;
          const btnEl = document.getElementById(`btn-save-${docId}`);
          const selectEl = document.getElementById(`select-status-${docId}`);
          if (btnEl && selectEl) {
            btnEl.addEventListener('click', () => {
              updateLeadStatus(docId, selectEl.value, btnEl);
            });
          }
        });
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách đăng ký tư vấn:', err);
      const loadingEl = document.getElementById('leads-loading');
      if (loadingEl) {
        loadingEl.textContent = 'Không thể tải danh sách đăng ký tư vấn.';
        loadingEl.style.color = '#ff4444';
      }
    } finally {
      window.isLeadsWidgetLoading = false;
    }
  }

  // Khởi chạy việc tải dữ liệu
  fetchLeads();
}

export default {
  config,
  bootstrap,
};
