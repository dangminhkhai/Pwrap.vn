module.exports = {
  beforeCreate(event) {
    const { data } = event.params;
    if (!data.leadStatus) {
      data.leadStatus = 'Chưa liên hệ';
    }
  },

  async afterCreate(event) {
    const { result } = event;

    try {
      // 1. Lấy cấu hình từ bảng "Cấu Hình Hệ Thống" (System Setting)
      const settings = await strapi.documents('api::system-setting.system-setting').findFirst();

      if (!settings) {
        console.log('[Lead Lifecycle] Chưa cấu hình cài đặt hệ thống. Bỏ qua gửi thông báo.');
        return;
      }

      const messageText = `🔔 ĐĂNG KÝ NHẬN TƯ VẤN MỚI!\n----------------------------------\n👤 Họ tên: ${result.name}\n📞 Số điện thoại: ${result.phone}\n🛠 Dịch vụ: ${result.serviceName}\n🚗 Dòng xe: ${result.carName}\n📅 Thời gian: ${new Date(result.createdAt).toLocaleString('vi-VN')}\n----------------------------------`;

      // 2. Gửi Telegram nếu có cấu hình
      if (settings.telegramBotToken && settings.telegramChatId) {
        try {
          const telegramUrl = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
          await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: settings.telegramChatId,
              text: messageText
            })
          });
          console.log('[Lead Lifecycle] Đã gửi thông báo Telegram thành công.');
        } catch (tgError) {
          console.error('[Lead Lifecycle] Lỗi gửi thông báo Telegram:', tgError);
        }
      }

      // 3. Gửi Email nếu có cấu hình
      if (settings.notificationEmail) {
        try {
          await strapi.plugins['email'].services.email.send({
            to: settings.notificationEmail,
            from: process.env.MAIL_FROM || 'no-reply@vinfastspa.com',
            subject: `[VinFast Spa] Đăng ký tư vấn mới từ ${result.name}`,
            text: messageText,
            html: `
              <h3>Đăng ký nhận tư vấn mới</h3>
              <p><strong>Họ tên:</strong> ${result.name}</p>
              <p><strong>Số điện thoại:</strong> ${result.phone}</p>
              <p><strong>Dịch vụ đăng ký:</strong> ${result.serviceName}</p>
              <p><strong>Dòng xe:</strong> ${result.carName}</p>
              <p><strong>Thời gian đăng ký:</strong> ${new Date(result.createdAt).toLocaleString('vi-VN')}</p>
            `
          });
          console.log('[Lead Lifecycle] Đã gửi email thông báo thành công.');
        } catch (emailError) {
          console.error('[Lead Lifecycle] Lỗi gửi email thông báo:', emailError);
        }
      }

    } catch (err) {
      console.error('[Lead Lifecycle] Lỗi trong quá trình xử lý gửi thông báo:', err);
    }
  }
};
