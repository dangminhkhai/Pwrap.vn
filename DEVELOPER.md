# Nhật ký Phát triển & Hướng dẫn Dự án (VinFast Spa)

Tài liệu này lưu trữ toàn bộ ngữ cảnh, kiến trúc và các tùy chỉnh đã thực hiện trong dự án để lập trình viên hoặc AI ở máy tính khác có thể đọc và tiếp tục làm việc ngay lập tức.

---

## 📌 1. Các tính năng & Tùy chỉnh đã thực hiện

### 🔹 Phần Frontend (Next.js)
*   **Nút Đăng ký & Hotline:** Đã tạo component [ActionButtons.js](file:///vinfast-spa-frontend/components/ActionButtons.js) tích hợp nút **NHẬN TƯ VẤN** (mở popup điền thông tin) và **LIÊN HỆ NGAY** (gọi hotline `0833698888`).
*   **Trang chi tiết dịch vụ:** Tích hợp bộ nút hành động vào trang chi tiết dịch vụ theo dòng xe tại [app/[carSlug]/[serviceSlug]/page.js](file:///vinfast-spa-frontend/app/[carSlug]/[serviceSlug]/page.js).
*   **Popup Form:** Validate số điện thoại chuẩn Việt Nam (10 số, đầu số hợp lệ). Gửi thông tin đăng ký tư vấn về API Backend.
*   **Giao diện & CSS:** Toàn bộ CSS của Popup đã được thêm vào cuối file [app/globals.css](file:///vinfast-spa-frontend/app/globals.css).

### 🔹 Phần Backend (Strapi v5)
*   **Trường trạng thái Lead (`leadStatus`):** Đã đổi tên trường `status` cũ thành `leadStatus` trong bảng [schema.json](file:///vinfast-spa-backend/src/api/lead/content-types/lead/schema.json) để tránh xung đột với trường hệ thống của Strapi v5.
*   **Trạng thái tiếng Việt có dấu:** Các giá trị enum được đổi thành có dấu đầy đủ: `Chưa liên hệ`, `Đã tư vấn`, `Đã chốt dịch vụ`.
*   **Gán mặc định (Lifecycle Hook):** Cấu hình hook `beforeCreate` trong [lifecycles.js](file:///vinfast-spa-backend/src/api/lead/content-types/lead/lifecycles.js) để tự động gán trạng thái mặc định là `Chưa liên hệ` cho mọi lượt đăng ký mới từ website.
*   **Thông báo Telegram:** Tích hợp Telegram Bot gửi tin nhắn thông báo tức thì đến Chat ID nhóm mỗi khi có khách hàng đăng ký tư vấn mới.
*   **Tự động tô màu trạng thái trong Admin:** Viết mã tùy biến giao diện Admin tại [src/admin/app.js](file:///vinfast-spa-backend/src/admin/app.js). Sử dụng `MutationObserver` để tự động render các giá trị trạng thái tiếng Việt thành các **Huy hiệu (Badge) dạng viên thuốc** có màu sắc tương ứng:
    *   `Chưa liên hệ`: Nền đỏ, chữ đỏ đậm.
    *   `Đã tư vấn`: Nền vàng, chữ vàng cam.
    *   `Đã chốt dịch vụ`: Nền xanh lá, chữ xanh lá đậm.
*   **Seeder chuyển đổi dữ liệu cũ:** Trong [src/index.js](file:///vinfast-spa-backend/src/index.js) đã viết sẵn hàm seeder tự động quét toàn bộ database cũ khi khởi động máy chủ, tự động chuyển đổi dữ liệu sang trường `leadStatus` mới và gán giá trị tiếng Việt tương ứng.

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
> **Lưu ý cho AI:** Khi người dùng yêu cầu lập trình tiếp, hãy đọc file này cùng các file mã nguồn liên quan để nắm được toàn bộ logic nghiệp vụ của dự án mà không cần hỏi lại người dùng về lịch sử cuộc trò chuyện cũ.
