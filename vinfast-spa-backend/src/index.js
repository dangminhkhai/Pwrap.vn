'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    try {
      console.log('--- BẮT ĐẦU THÊM DÒNG XE & DỊCH VỤ DEMO TỰ ĐỘNG ---');
      
      // A. Tạo các Dòng Xe mới yêu cầu nếu chưa có
      const carsToCreate = [
        { name: 'Vinfast VFe34', slug: 'vinfast-vfe34', segment: 'C-SUV', order: 3 },
        { name: 'Vinfast VF8', slug: 'vinfast-vf8', segment: 'D-SUV', order: 6 },
        { name: 'Vinfast VF9', slug: 'vinfast-vf9', segment: 'E-SUV', order: 7 },
        { name: 'Vinfast Lux A', slug: 'vinfast-lux-a', segment: 'Sedan', order: 8 },
        { name: 'Vinfast Lux SA', slug: 'vinfast-lux-sa', segment: 'E-SUV', order: 9 },
        { name: 'Limo Green', slug: 'limo-green', segment: 'Hạng Sang', order: 10 }
      ];

      for (const car of carsToCreate) {
        const existingCar = await strapi.documents('api::car-model.car-model').findMany({
          filters: { slug: car.slug }
        });

        if (existingCar.length === 0) {
          await strapi.documents('api::car-model.car-model').create({
            data: {
              name: car.name,
              slug: car.slug,
              segment: car.segment,
              order: car.order
            },
            status: 'published'
          });
          console.log(`[Demo Seed] Đã tạo dòng xe mới: "${car.name}"`);
        }
      }

      // B. Cập nhật lại số thứ tự (order) của các dòng xe cũ để đồng bộ thứ tự hiển thị
      const oldCars = [
        { slug: 'vinfast-vf3', order: 1 },
        { slug: 'vinfast-vf5', order: 2 },
        { slug: 'vinfast-vf6', order: 4 },
        { slug: 'vinfast-vf7', order: 5 }
      ];
      for (const old of oldCars) {
        const found = await strapi.documents('api::car-model.car-model').findMany({
          filters: { slug: old.slug }
        });
        if (found.length > 0) {
          await strapi.documents('api::car-model.car-model').update({
            documentId: found[0].documentId,
            data: { order: old.order }
          });
        }
      }

      // Cấp quyền Public cho api::lead.lead.create để Frontend có thể gửi thông tin đăng ký tư vấn
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' }
      });

      if (publicRole) {
        const hasPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
          where: {
            role: publicRole.id,
            action: 'api::lead.lead.create'
          }
        });

        if (!hasPermission) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action: 'api::lead.lead.create',
              role: publicRole.id
            }
          });
          console.log('[Demo Seed] Đã cấp quyền Public cho POST /api/leads');
        }
      }

      // Tự động cập nhật giao diện Admin để hiển thị trường isHot trong Edit View
      try {
        const configRow = await strapi.db.connection('strapi_core_store_settings')
          .where({ key: 'plugin_content_manager_configuration_content_types::api::car-model.car-model' })
          .first();
          
        if (configRow) {
          const config = JSON.parse(configRow.value);
          let hasChanged = false;
          
          // Kiểm tra xem isHot đã có trong layouts.edit chưa
          const flatEditLayout = config.layouts.edit.flat().map(field => field.name);
          if (!flatEditLayout.includes('isHot')) {
            // Thêm vào kế bên order
            for (const row of config.layouts.edit) {
              const orderIdx = row.findIndex(field => field.name === 'order');
              if (orderIdx !== -1) {
                row.push({ name: 'isHot', size: 6 });
                hasChanged = true;
                break;
              }
            }
            // Nếu không tìm thấy order, đẩy vào hàng mới
            if (!hasChanged) {
              config.layouts.edit.push([{ name: 'isHot', size: 6 }]);
              hasChanged = true;
            }
          }
          
          // Thêm metadata cho isHot để hiển thị đẹp mắt
          if (!config.metadatas.isHot) {
            config.metadatas.isHot = {
              edit: {
                label: 'Dòng xe HOT?',
                description: 'Bật công tắc này để gắn nhãn HOT nổi bật cho dòng xe này ở trang chủ'
              },
              list: {
                label: 'Dòng xe HOT?',
                searchable: true,
                sortable: true
              }
            };
            hasChanged = true;
          }
          
          if (hasChanged) {
            await strapi.db.connection('strapi_core_store_settings')
              .where({ key: 'plugin_content_manager_configuration_content_types::api::car-model.car-model' })
              .update({ value: JSON.stringify(config) });
            console.log('[Demo Seed] Đã tự động cập nhật giao diện Edit View cho Dòng Xe (thêm trường isHot).');
          }
        }
      } catch (layoutErr) {
        console.error('[Demo Seed] Lỗi tự động cấu hình giao diện isHot:', layoutErr.message);
      }

      // Khởi tạo bảng Cấu Hình Hệ Thống nếu chưa có
      const existingSettings = await strapi.documents('api::system-setting.system-setting').findFirst();
      if (!existingSettings) {
        await strapi.documents('api::system-setting.system-setting').create({
          data: {
            notificationEmail: 'info@vinfastspa.com',
            telegramBotToken: '',
            telegramChatId: ''
          },
          status: 'published'
        });
        console.log('[Demo Seed] Đã khởi tạo cấu hình hệ thống mặc định.');
      }

      // Cập nhật các bản ghi Lead (Đăng ký tư vấn) cũ sang trường leadStatus tiếng Việt có dấu
      const oldLeads = await strapi.db.query('api::lead.lead').findMany();
      for (const lead of oldLeads) {
        let targetStatus = 'Chưa liên hệ';
        if (lead.leadStatus === 'da_tu_van' || lead.leadStatus === 'Đã tư vấn') {
          targetStatus = 'Đã tư vấn';
        } else if (lead.leadStatus === 'da_chot_dich_vu' || lead.leadStatus === 'Đã chốt dịch vụ') {
          targetStatus = 'Đã chốt dịch vụ';
        }

        if (lead.leadStatus !== targetStatus) {
          await strapi.db.query('api::lead.lead').update({
            where: { id: lead.id },
            data: {
              leadStatus: targetStatus
            }
          });
          console.log(`[Demo Seed] Đã cập nhật trạng thái tiếng Việt "${targetStatus}" cho khách "${lead.name}"`);
        }
      }

      // 1. Lấy tất cả Dòng Xe đang có trong hệ thống (bao gồm cả xe cũ và xe mới)
      const carModels = await strapi.documents('api::car-model.car-model').findMany({
        limit: -1
      });
      console.log(`[Demo Seed] Tổng số dòng xe hiện có: ${carModels.length}`);

      if (carModels.length === 0) {
        console.log('[Demo Seed] Chưa có dòng xe nào. Vui lòng tạo dòng xe trước.');
        return;
      }

      // 2. Lấy 1 ảnh từ thư viện để làm ảnh demo
      const mediaFiles = await strapi.db.query('plugin::upload.file').findMany({
        limit: 1
      });
      const demoImageId = mediaFiles[0]?.id || null;
      console.log(`[Demo Seed] Sử dụng ảnh demo ID: ${demoImageId}`);

      // Tạm thời dọn dẹp database: Xóa tất cả dịch vụ theo xe, chỉ giữ lại Phủ Ceramic Diamond và Phim cách nhiệt của VF3
      const allDetails = await strapi.documents('api::car-service-detail.car-service-detail').findMany({
        populate: ['car_model', 'service'],
        limit: -1
      });
      console.log(`[Demo Seed] Quét cơ sở dữ liệu: Tìm thấy ${allDetails.length} chi tiết dịch vụ theo xe.`);
      for (const detail of allDetails) {
        const carSlug = detail.car_model?.slug;
        const serviceSlug = detail.service?.slug;
        const isKeep = (carSlug === 'vinfast-vf3' && serviceSlug === 'phu-ceramic-diamond') ||
                       (carSlug === 'vinfast-vf3' && serviceSlug === 'phim-cach-nhiet');
        if (!isKeep) {
          await strapi.documents('api::car-service-detail.car-service-detail').delete({
            documentId: detail.documentId
          });
          console.log(`[Demo Seed]   -> Đã dọn dẹp xóa cấu hình: [${serviceSlug}] của xe [${carSlug}]`);
        }
      }

      // 3. Danh sách 4 dịch vụ demo yêu cầu kèm khoảng giá min - max
      const servicesToCreate = [
        {
          name: 'Phim cách nhiệt',
          slug: 'phim-cach-nhiet',
          description: 'Dán phim cách nhiệt chính hãng chống nóng vượt trội, ngăn chặn 99% tia UV và bảo vệ không gian riêng tư trong xe.',
          order: 2,
          basePrice: 5000000,
          minPrice: 5000000,
          maxPrice: 13000000
        },
        {
          name: 'PPF ngoại thất',
          slug: 'ppf-ngoai-that',
          description: 'Dán phim bảo vệ sơn PPF TPU cao cấp, tự phục hồi vết xước, chống đá văng và bảo vệ màu sơn zin tuyệt đối.',
          order: 3,
          basePrice: 45000000,
          minPrice: 45000000,
          maxPrice: 53000000
        },
        {
          name: 'PPF Nội thất',
          slug: 'ppf-noi-that',
          description: 'Bảo vệ các chi tiết bóng, màn hình và ốp gỗ nội thất tránh khỏi trầy xước dăm trong quá trình sử dụng.',
          order: 4,
          basePrice: 2500000,
          minPrice: 2500000,
          maxPrice: 10500000
        },
        {
          name: 'Decal Ngoại thất',
          slug: 'decal-ngoai-that',
          description: 'Dán đổi màu decal cao cấp hoặc dán nóc đen thể thao, tạo điểm nhấn cá tính và bảo vệ lớp sơn gốc.',
          order: 5,
          basePrice: 8000000,
          minPrice: 8000000,
          maxPrice: 16000000
        }
      ];

      for (const item of servicesToCreate) {
        // Kiểm tra xem dịch vụ gốc đã tồn tại chưa
        const existing = await strapi.documents('api::service.service').findMany({
          filters: { slug: item.slug }
        });

        let serviceDoc;
        if (existing.length > 0) {
          serviceDoc = existing[0];
          // Cập nhật giá min-max nếu chưa có
          if (!serviceDoc.minPrice || !serviceDoc.maxPrice) {
            serviceDoc = await strapi.documents('api::service.service').update({
              documentId: serviceDoc.documentId,
              data: {
                minPrice: item.minPrice,
                maxPrice: item.maxPrice
              }
            });
          }
          console.log(`[Demo Seed] Dịch vụ "${item.name}" đã tồn tại.`);
        } else {
          // Tạo mới dịch vụ gốc và xuất bản (Publish) luôn
          serviceDoc = await strapi.documents('api::service.service').create({
            data: {
              name: item.name,
              slug: item.slug,
              description: item.description,
              order: item.order,
              minPrice: item.minPrice,
              maxPrice: item.maxPrice,
              richText: `
                <h3>Giới thiệu dịch vụ ${item.name}</h3>
                <p>${item.description}</p>
                <h3>Tại sao nên chọn VinFast Spa?</h3>
                <p>Chúng tôi sử dụng nguyên vật liệu nhập khẩu chính hãng, thi công trong phòng kín đạt tiêu chuẩn Detailing chuyên nghiệp cùng chính sách bảo hành dài hạn.</p>
              `
            },
            status: 'published'
          });
          console.log(`[Demo Seed] Đã tạo dịch vụ gốc: "${item.name}"`);
        }

        // Tạo bảng giá riêng (Car Service Detail) cho từng dòng xe
        for (const car of carModels) {
          // CHỈ gieo cấu hình cho Phim cách nhiệt của VF3, bỏ qua tất cả các xe/dịch vụ khác
          if (!(car.slug === 'vinfast-vf3' && item.slug === 'phim-cach-nhiet')) {
            continue;
          }

          const existingDetail = await strapi.documents('api::car-service-detail.car-service-detail').findMany({
            filters: {
              car_model: { id: car.id },
              service: { id: serviceDoc.id }
            }
          });

          if (existingDetail.length > 0) {
            // Nếu đã có cấu hình, tự động cập nhật lại giá theo định dạng chuỗi mới để kiểm thử
            const detail = existingDetail[0];
            
            let minPriceStr = "";
            let maxPriceStr = "";
            let priceVal = item.basePrice;
            if (car.slug.includes('vf5')) priceVal += 500000;
            if (car.slug.includes('vf6')) priceVal += 1500000;
            if (car.slug.includes('vf7')) priceVal += 3000000;
            if (car.slug.includes('vf8')) priceVal += 5000000;
            if (car.slug.includes('vf9')) priceVal += 8000000;

            if (item.slug === 'ppf-ngoai-that') {
              // Trường hợp 2 giá (khoảng giá) -> điền vào minPrice và maxPrice
              minPriceStr = priceVal.toString();
              maxPriceStr = (priceVal + 10000000).toString();
            } else if (item.slug === 'decal-ngoai-that') {
              // Trường hợp không có giá -> để trống hết
              minPriceStr = "";
              maxPriceStr = "";
            } else {
              // Trường hợp 1 giá -> điền vào minPrice, để trống maxPrice
              minPriceStr = priceVal.toString();
              maxPriceStr = "";
            }

            await strapi.documents('api::car-service-detail.car-service-detail').update({
              documentId: detail.documentId,
              data: {
                minPrice: minPriceStr,
                maxPrice: maxPriceStr,
                gallery: demoImageId && (!detail.gallery || detail.gallery.length === 0) ? [demoImageId] : detail.gallery
              }
            });
            continue;
          }

          // Tính toán giá mẫu cho bản ghi mới (1 giá, khoảng giá, hoặc trống)
          let minPriceStr = "";
          let maxPriceStr = "";
          let priceVal = item.basePrice;
          if (car.slug.includes('vf5')) priceVal += 500000;
          if (car.slug.includes('vf6')) priceVal += 1500000;
          if (car.slug.includes('vf7')) priceVal += 3000000;
          if (car.slug.includes('vf8')) priceVal += 5000000;
          if (car.slug.includes('vf9')) priceVal += 8000000;

          if (item.slug === 'ppf-ngoai-that') {
            minPriceStr = priceVal.toString();
            maxPriceStr = (priceVal + 10000000).toString();
          } else if (item.slug === 'decal-ngoai-that') {
            minPriceStr = "";
            maxPriceStr = "";
          } else {
            minPriceStr = priceVal.toString();
            maxPriceStr = "";
          }

          // Tạo và xuất bản liên kết
          await strapi.documents('api::car-service-detail.car-service-detail').create({
            data: {
              minPrice: minPriceStr,
              maxPrice: maxPriceStr,
              car_model: car.id,
              service: serviceDoc.id,
              customImage: demoImageId, // Gán ảnh demo từ thư viện
              gallery: demoImageId ? [demoImageId] : [] // Tự động gán bộ sưu tập ảnh demo
            },
            status: 'published'
          });
          console.log(`[Demo Seed]   -> Đã gán giá cho xe ${car.name}: Min=${minPriceStr || 'trống'}, Max=${maxPriceStr || 'trống'}`);
        }
      }
      
      // --- SEED 4 BÀI VIẾT CẨM NANG CHĂM SÓC XE DEMO ---
      // Xóa các bài viết mẫu cũ để chuyển đổi sang định dạng CKEditor (HTML) mới
      const demoSlugs = [
        'kinh-nghiem-dan-phim-cach-nhiet-cho-xe-dien-vinfast',
        'huong-dan-cham-soc-va-ve-sinh-noi-that-xe-dien-dung-cach',
        'co-nen-dan-ppf-bao-ve-son-cho-vinfast-vf3',
        'nhung-luu-y-quan-trong-khi-ve-sinh-khoang-dong-co-xe-vinfast'
      ];
      for (const slug of demoSlugs) {
        const found = await strapi.documents('api::blog.blog').findMany({ filters: { slug } });
        for (const item of found) {
          await strapi.documents('api::blog.blog').delete({ documentId: item.documentId });
        }
      }

      const existingBlogsCount = await strapi.documents('api::blog.blog').findMany({ limit: 1 });
      if (existingBlogsCount.length === 0) {
        const demoBlogs = [
          {
            title: 'Kinh nghiệm dán phim cách nhiệt cho xe điện VinFast',
            slug: 'kinh-nghiem-dan-phim-cach-nhiet-cho-xe-dien-vinfast',
            seoDesc: 'Phim cách nhiệt giúp chống nóng vượt trội, bảo vệ sức khỏe và tiết kiệm pin tối đa cho hệ thống điều hòa trên các dòng xe VinFast.',
            content: `Xe điện thường có diện tích kính lái lớn để tối ưu tầm nhìn, tuy nhiên điều này làm tăng lượng nhiệt hấp thụ vào khoang cabin. Việc dán phim cách nhiệt chất lượng cao là giải pháp bắt buộc để bảo vệ nội thất và giúp hệ thống điều hòa không bị quá tải, từ đó tiết kiệm pin hiệu quả.

## Lợi ích khi chọn đúng loại phim cách nhiệt
Phim cách nhiệt cao cấp có khả năng cản tới 99% tia UV cực tím và hơn 90% tia hồng ngoại. Giúp người ngồi trong xe luôn mát mẻ, dễ chịu ngay cả dưới trời nắng gắt.`
          },
          {
            title: 'Hướng dẫn chăm sóc và vệ sinh nội thất xe điện đúng cách',
            slug: 'huong-dan-cham-soc-va-ve-sinh-noi-that-xe-dien-dung-cach',
            seoDesc: 'Bảo vệ các chi tiết da cao cấp, màn hình cảm ứng trung tâm và hệ thống nút bấm trên xe điện VinFast luôn sạch bóng như mới.',
            content: `Nội thất của các dòng xe điện VinFast được trang bị rất nhiều màn hình cảm ứng nhạy cảm và hệ thống điện tử hiện đại. Do đó, quy trình vệ sinh đòi hỏi phải sử dụng các dung dịch chuyên dụng và khăn microfiber mềm để tránh gây trầy xước hoặc chập điện.

## Quy trình 3 bước vệ sinh tại nhà
1. Hút bụi sạch các khe kẽ.
2. Lau nhẹ bề mặt da bằng dung dịch dưỡng chuyên dụng.
3. Dùng khăn khô sợi mảnh lau sạch bụi trên màn hình hiển thị.`
          },
          {
            title: 'Có nên dán PPF bảo vệ sơn cho VinFast VF3?',
            slug: 'co-nen-dan-ppf-bao-ve-son-cho-vinfast-vf3',
            seoDesc: 'Đánh giá chi tiết ưu nhược điểm của giải pháp dán phim PPF bảo vệ sơn cho dòng xe điện mini VinFast VF3 cực hot hiện nay.',
            content: `VinFast VF3 với kích thước nhỏ gọn rất được ưa chuộng để di chuyển hàng ngày trong đô thị. Tuy nhiên, mật độ giao thông dày đặc khiến xe rất dễ bị trầy xước do va quẹt nhẹ hoặc đá dăm bắn vào phần cản trước.

## PPF - Lớp giáp bảo vệ sơn hoàn hảo
Phim PPF (Paint Protection Film) có khả năng tự phục hồi các vết xước dăm nhỏ dưới tác động của nhiệt độ, đồng thời giữ cho màu sơn nguyên bản luôn bóng đẹp như mới mua.`
          },
          {
            title: 'Những lưu ý quan trọng khi vệ sinh khoang động cơ xe VinFast',
            slug: 'nhung-luu-y-quan-trong-khi-ve-sinh-khoang-dong-co-xe-vinfast',
            seoDesc: 'Vệ sinh khoang máy định kỳ giúp hệ thống tản nhiệt hoạt động hiệu quả hơn và ngăn ngừa tình trạng chuột bọ làm tổ cắn phá dây điện.',
            content: `Khoang máy là nơi chứa nhiều linh kiện điện tử và cảm biến quan trọng. Khi tự vệ sinh tại nhà, bạn tuyệt đối không được xịt nước trực tiếp dưới áp lực cao vào các giắc cắm điện hoặc hộp cầu chì.

## Lời khuyên từ chuyên gia VinFast Spa
Nên đưa xe đến các trung tâm chăm sóc chuyên nghiệp định kỳ 6 tháng một lần để được vệ sinh bằng công nghệ hơi nước nóng, đảm bảo an toàn tuyệt đối cho hệ thống điện.`
          }
        ];

        for (const blog of demoBlogs) {
          try {
            await strapi.documents('api::blog.blog').create({
              data: {
                title: blog.title,
                slug: blog.slug,
                seoDesc: blog.seoDesc,
                content: blog.content,
                cover: mediaFiles[0]?.id || null
              },
              status: 'published'
            });
            console.log(`[Demo Seed] Đã tạo bài viết cẩm nang: "${blog.title}"`);
          } catch (err) {
            console.error(`[Demo Seed] Lỗi tạo bài viết "${blog.title}":`, JSON.stringify(err.details || err.message, null, 2));
          }
        }
      }

      console.log('--- HOÀN THÀNH THÊM DỊCH VỤ DEMO TỰ ĐỘNG ---');
    } catch (error) {
      console.error('[Demo Seed] Có lỗi xảy ra:', error);
    }
  },
};
