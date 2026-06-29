# Cấu hình Hành vi Dự án (Project-Scoped Rules)

- **Xử lý lệnh Git/Mạng bị treo (Fail-Fast):** Khi thực hiện các lệnh liên quan đến mạng hoặc đồng bộ (như `git push`, `git pull`, `git clone`) mà phản hồi lâu quá 10-15 giây:
  1. Tuyệt đối không để tiến trình tiếp tục treo trong nền mà không có phản hồi rõ ràng.
  2. Sử dụng các tham số ngăn chặn treo nhập liệu trực tiếp (ví dụ: chạy git kèm `-c credential.helper=` hoặc thiết lập biến môi trường `GIT_TERMINAL_PROMPT=0`) để lệnh trả về lỗi ngay lập tức (fail-fast) nếu sai thông tin xác thực.
  3. Báo cáo ngay lập tức cho người dùng biết nguyên nhân (ví dụ: Token hết hạn, sai thông tin đăng nhập hoặc lỗi kết nối) để phối hợp xử lý, không để người dùng phải chờ đợi lâu.
