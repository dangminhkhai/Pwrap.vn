# Nhật ký Phát triển & Hướng dẫn Dự án (VinFast Spa)

Tài liệu này lưu trữ toàn bộ ngữ cảnh, kiến trúc và các tùy chỉnh đã thực hiện trong dự án để lập trình viên hoặc AI ở máy tính khác có thể đọc và tiếp tục làm việc ngay lập tức.

---

## 📌 1. Các tính năng & Tùy chỉnh đã thực hiện

### 🔹 Phần Frontend (Next.js)
*   **Nút Đăng ký & Hotline:** Đã tạo component [ActionButtons.js](file:///vinfast-spa-frontend/components/ActionButtons.js) tích hợp nút **NHẬN TƯ VẤN** (mở popup điền thông tin) và **LIÊN HỆ NGAY** (gọi hotline `0833698888`).
*   **Trang chi tiết dịch vụ:** Tích hợp bộ nút hành động vào trang chi tiết dịch vụ theo dòng xe tại [app/[carSlug]/[serviceSlug]/page.js](file:///vinfast-spa-frontend/app/[carSlug]/[serviceSlug]/page.js).
*   **Popup Form:** Validate số điện thoại chuẩn Việt Nam (10 số, đầu số hợp lệ). Gửi thông tin đăng ký tư vấn về API Backend.
*   **Căn giữa Car Tabs:** Cập nhật CSS để căn giữa danh sách các tab chọn dòng xe trên trang chủ.
*   **Viết hoa tiêu đề dịch vụ:** Chuyển đổi tiêu đề dịch vụ (`.service-title` và `.detail-title`) sang viết in hoa và tăng nhẹ khoảng cách chữ (`letter-spacing`) để hiển thị sang trọng hơn.
*   **Nhãn HOT trên Tab dòng xe:** Tự động hiển thị nhãn `HOT` dạng viên thuốc với màu gradient đỏ-cam nổi bật nếu dòng xe đó được bật `isHot` trong CMS.
*   **Bộ giải mã Markdown (Blog):** Viết bộ giải mã Markdown tự chế siêu nhẹ tại [app/bai-viet/[slug]/page.js](file:///vinfast-spa-frontend/app/bai-viet/[slug]/page.js) để render nội dung bài viết từ Classic Rich Text của Strapi. Hỗ trợ hiển thị hình ảnh chèn trong bài viết với phong cách bo góc và đổ bóng mượt mà.

### 🔹 Phần Backend (Strapi v5)
*   **Trường trạng thái Lead (`leadStatus`):** Đổi tên trường `status` cũ thành `leadStatus` để tránh xung đột với hệ thống. Giá trị tiếng Việt có dấu: `Chưa liên hệ`, `Đã tư vấn`, `Đã chốt dịch vụ`.
*   **Tô màu trạng thái trong Admin:** Sử dụng `MutationObserver` tại [src/admin/app.js](file:///vinfast-spa-backend/src/admin/app.js) để tô màu chữ trạng thái của Lead (Chưa liên hệ: đỏ, Đã tư vấn: vàng cam, Đã chốt: xanh lá) mà không dùng khung viền nền cho thoáng mắt.
*   **Trường Dòng xe HOT (`isHot`):** Thêm trường `isHot` (boolean) vào bảng Dòng Xe (`car-model`). Viết code tự động cập nhật cấu hình giao diện Admin để hiển thị công tắc `isHot` cạnh ô `order` ngay khi khởi động.
*   **Trình soạn thảo Classic Rich Text (Markdown):** Đổi trường `content` của Bài viết (`blog`) sang kiểu dữ liệu `richtext` truyền thống của Strapi, giúp hiển thị đầy đủ thanh công cụ có sẵn nút bấm chèn Ảnh trực quan.
*   **Gieo dữ liệu cẩm nang (Seeder):** Tự động gieo và cập nhật 4 bài viết cẩm nang chăm sóc xe mẫu dưới dạng Markdown chất lượng cao khi chạy server.

---

## 🛠️ 2. Hướng dẫn chạy dự án trên máy tính mới

### Bước 1: Tải mã nguồn về máy
```bash
git clone https://github.com/dangminhkhai/Pwrap.vn.git
cd Pwrap.vn
```

### Bước 2: Khởi động Backend (Strapi)
1.  Mở terminal tại thư mục `vinfast-spa-backend`.
2.  Chạy lệnh cài đặt thư viện:
    ```bash
    npm install
    ```
3.  Khởi động server ở chế độ phát triển:
    ```bash
    npm run develop
    ```
    *Giao diện Admin sẽ chạy tại: `http://localhost:1337/admin`*

### Bước 3: Khởi động Frontend (Next.js)
1.  Mở terminal song song tại thư mục `vinfast-spa-frontend`.
2.  Chạy lệnh cài đặt thư viện:
    ```bash
    npm install
    ```
3.  Khởi động Next.js:
    ```bash
    npm run dev
    ```
    *Website sẽ chạy tại: `http://localhost:3000`*

---

## 📝 3. Lưu ý dành cho AI Assistant trên máy tính mới
> **Lưu ý cho AI:** Hãy đọc kỹ file này cùng các file mã nguồn liên quan. Khi lập trình tiếp, luôn đóng vai trò là một lập trình viên Node.js + Strapi chuyên nghiệp, tuân thủ các quy tắc viết code sạch, tối ưu và hiện đại.
