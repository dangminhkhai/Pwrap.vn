'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }) {
    try {
      console.log('--- BẮT ĐẦU THÊM DÒNG XE & SẢN PHẨM DEMO TỰ ĐỘNG ---');
      
      // A. Tạo các Dòng Xe mới nếu chưa có
      const carsToCreate = [
        { 
          name: 'Vinfast VF3', 
          slug: 'vinfast-vf3', 
          segment: 'Mini-SUV', 
          order: 1,
          description: 'Tổng hợp các giải pháp nâng cấp, dán phim cách nhiệt chống nóng và dán PPF bảo vệ nội ngoại thất chuyên nghiệp cho xe điện quốc dân VinFast VF3.',
          seoTitle: 'Nâng Cấp Xe VinFast VF3 | Dán PPF & Phim Cách Nhiệt',
          seoDescription: 'Dịch vụ nâng cấp chuyên nghiệp cho VinFast VF3 tại VinFast Spa. Dán phim cách nhiệt 3M Crystalline, PPF nội thất TPU tự phục hồi xước chính hãng, giá tốt nhất.',
          longDescription: `### Quy trình nâng cấp xe VinFast VF3 chuyên nghiệp
Để chiếc VinFast VF3 của bạn hoạt động tối ưu và luôn giữ được vẻ đẹp như mới, chúng tôi cung cấp các giải pháp nâng cấp toàn diện và chuyên nghiệp:

1. **Dán phim cách nhiệt 3M Crystalline:** Giúp chống nóng hiệu quả vượt trội, bảo vệ mắt và da khỏi tia UV độc hại, giảm tải cho hệ thống điều hòa giúp tiết kiệm pin xe.
2. **Dán PPF bảo vệ nội thất TPU:** Lớp phim tự phục hồi vết xước dăm bảo vệ tối ưu các bề mặt nhựa bóng, màn hình hiển thị trung tâm tránh khỏi trầy xước trong quá trình sử dụng.
3. **Nâng cấp các phụ kiện tiện ích:** Thảm lót sàn tràn viền cao cấp, đèn tăng sáng và các gói phủ ceramic bảo vệ sơn ngoại thất.

Chúng tôi cam kết toàn bộ kỹ thuật viên đều có tay nghề cao, thi công trong phòng kín đạt tiêu chuẩn Detailing quốc tế.`,
          showLongDescription: true
        },
        { 
          name: 'Vinfast VF5', 
          slug: 'vinfast-vf5', 
          segment: 'A-SUV', 
          order: 2,
          description: 'Các gói dịch vụ chăm sóc cao cấp, dán phim cách nhiệt 3M Crystalline và dán PPF bảo vệ các chi tiết bóng nội thất cho xe VinFast VF5.',
          seoTitle: 'Nâng Cấp Xe VinFast VF5 | Chăm Sóc Xe Chuyên Nghiệp',
          seoDescription: 'Tổng hợp các sản phẩm và dịch vụ nâng cấp chất lượng cao dành riêng cho xe VinFast VF5. Dán phim cách nhiệt chống nóng vượt trội, dán PPF bảo vệ màn hình.',
          longDescription: `### Nâng cấp toàn diện cho xe điện VinFast VF5
VinFast VF5 là dòng xe đi phố cực kỳ năng động. Để tối ưu hóa trải nghiệm lái xe và bảo vệ tài sản, các hạng mục nâng cấp dưới đây là vô cùng cần thiết:

- **Cản nhiệt vượt trội:** Dán phim cách nhiệt 3M Crystalline ngăn chặn hơn 97% tia hồng ngoại, giữ cho cabin xe luôn mát mẻ dưới thời tiết nắng nóng Việt Nam.
- **Bảo vệ nội thất hoàn hảo:** Dán phim PPF TPU chất lượng cao cho cụm cần số, màn hình giải trí trung tâm và các nút bấm cửa xe giúp chống xước, chống bám vân tay hiệu quả.
- **Cách âm chống ồn:** Gia cố cách âm khoang lái mang lại không gian yên tĩnh và êm ái hơn khi di chuyển trên cao tốc.

Liên hệ ngay với VinFast Spa để nhận tư vấn và thiết kế gói nâng cấp phù hợp nhất cho chiếc VF5 của bạn.`,
          showLongDescription: true
        },
        { name: 'Vinfast VFe34', slug: 'vinfast-vfe34', segment: 'C-SUV', order: 3, description: 'Các sản phẩm nâng cấp cho xe Vinfast VFe34.', seoTitle: 'Nâng Cấp Xe Vinfast VFe34 chuyên nghiệp', seoDescription: 'Dịch vụ chăm sóc và nâng cấp xe Vinfast VFe34.', longDescription: 'Nội dung mô tả chi tiết các sản phẩm nâng cấp cho dòng xe Vinfast VFe34 đang được cập nhật.', showLongDescription: true },
        { name: 'Vinfast VF6', slug: 'vinfast-vf6', segment: 'B-SUV', order: 4, description: 'Các sản phẩm nâng cấp cho xe Vinfast VF6.', seoTitle: 'Nâng Cấp Xe Vinfast VF6 chuyên nghiệp', seoDescription: 'Dịch vụ chăm sóc và nâng cấp xe Vinfast VF6.', longDescription: 'Nội dung mô tả chi tiết các sản phẩm nâng cấp cho dòng xe Vinfast VF6 đang được cập nhật.', showLongDescription: true },
        { name: 'Vinfast VF7', slug: 'vinfast-vf7', segment: 'C-SUV', order: 5, description: 'Các sản phẩm nâng cấp cho xe Vinfast VF7.', seoTitle: 'Nâng Cấp Xe Vinfast VF7 chuyên nghiệp', seoDescription: 'Dịch vụ chăm sóc và nâng cấp xe Vinfast VF7.', longDescription: 'Nội dung mô tả chi tiết các sản phẩm nâng cấp cho dòng xe Vinfast VF7 đang được cập nhật.', showLongDescription: true },
        { name: 'Vinfast VF8', slug: 'vinfast-vf8', segment: 'D-SUV', order: 6, description: 'Các sản phẩm nâng cấp cho xe Vinfast VF8.', seoTitle: 'Nâng Cấp Xe Vinfast VF8 chuyên nghiệp', seoDescription: 'Dịch vụ chăm sóc và nâng cấp xe Vinfast VF8.', longDescription: 'Nội dung mô tả chi tiết các sản phẩm nâng cấp cho dòng xe Vinfast VF8 đang được cập nhật.', showLongDescription: true },
        { name: 'Vinfast VF9', slug: 'vinfast-vf9', segment: 'E-SUV', order: 7, description: 'Các sản phẩm nâng cấp cho xe Vinfast VF9.', seoTitle: 'Nâng Cấp Xe Vinfast VF9 chuyên nghiệp', seoDescription: 'Dịch vụ chăm sóc và nâng cấp xe Vinfast VF9.', longDescription: 'Nội dung mô tả chi tiết các sản phẩm nâng cấp cho dòng xe Vinfast VF9 đang được cập nhật.', showLongDescription: true },
        { name: 'Vinfast Lux A', slug: 'vinfast-lux-a', segment: 'Sedan', order: 8, description: 'Các sản phẩm nâng cấp cho xe Vinfast Lux A.', seoTitle: 'Nâng Cấp Xe Vinfast Lux A chuyên nghiệp', seoDescription: 'Dịch vụ chăm sóc và nâng cấp xe Vinfast Lux A.', longDescription: 'Nội dung mô tả chi tiết các sản phẩm nâng cấp cho dòng xe Vinfast Lux A đang được cập nhật.', showLongDescription: true },
        { name: 'Vinfast Lux SA', slug: 'vinfast-lux-sa', segment: 'E-SUV', order: 9, description: 'Các sản phẩm nâng cấp cho xe Vinfast Lux SA.', seoTitle: 'Nâng Cấp Xe Vinfast Lux SA chuyên nghiệp', seoDescription: 'Dịch vụ chăm sóc và nâng cấp xe Vinfast Lux SA.', longDescription: 'Nội dung mô tả chi tiết các sản phẩm nâng cấp cho dòng xe Vinfast Lux SA đang được cập nhật.', showLongDescription: true },
        { name: 'Limo Green', slug: 'limo-green', segment: 'Hạng Sang', order: 10, description: 'Các sản phẩm nâng cấp cho xe Limo Green.', seoTitle: 'Nâng Cấp Xe Limo Green chuyên nghiệp', seoDescription: 'Dịch vụ chăm sóc và nâng cấp xe Limo Green.', longDescription: 'Nội dung mô tả chi tiết các sản phẩm nâng cấp cho dòng xe Limo Green đang được cập nhật.', showLongDescription: true }
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
              order: car.order,
              description: car.description,
              seoTitle: car.seoTitle,
              seoDescription: car.seoDescription,
              longDescription: car.longDescription,
              showLongDescription: car.showLongDescription
            },
            status: 'published'
          });
          console.log(`[Demo Seed] Đã tạo dòng xe mới: "${car.name}"`);
        } else {
          // Cập nhật các trường SEO & Mô tả dài nếu đã tồn tại nhưng chưa được cấu hình
          const doc = existingCar[0];
          await strapi.documents('api::car-model.car-model').update({
            documentId: doc.documentId,
            data: {
              description: doc.description || car.description,
              seoTitle: doc.seoTitle || car.seoTitle,
              seoDescription: doc.seoDescription || car.seoDescription,
              longDescription: doc.longDescription || car.longDescription,
              showLongDescription: doc.showLongDescription !== undefined ? doc.showLongDescription : car.showLongDescription
            }
          });
          console.log(`[Demo Seed] Đã cập nhật thông tin mô tả, SEO & Mô tả dài cho dòng xe: "${car.name}"`);
        }
      }

      // Cập nhật số thứ tự cho đồng bộ
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

      // B. Cấp quyền Public cho API
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' }
      });

      if (publicRole) {
        const grantPublicPermission = async (action) => {
          const hasPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: { role: publicRole.id, action }
          });
          if (!hasPermission) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: { action, role: publicRole.id }
            });
            console.log(`[Demo Seed] Đã cấp quyền Public cho ${action}`);
          }
        };

        await grantPublicPermission('api::lead.lead.create');
        await grantPublicPermission('api::product.product.find');
        await grantPublicPermission('api::product.product.findOne');
      }

      // C. Cấu hình giao diện hiển thị trường title làm chính cho Sản phẩm
      try {
        const configRow = await strapi.db.connection('strapi_core_store_settings')
          .where({ key: 'plugin_content_manager_configuration_content_types::api::product.product' })
          .first();
          
        if (configRow) {
          const config = JSON.parse(configRow.value);
          if (config.settings.mainField !== 'title') {
            config.settings.mainField = 'title';
            await strapi.db.connection('strapi_core_store_settings')
              .where({ key: 'plugin_content_manager_configuration_content_types::api::product.product' })
              .update({ value: JSON.stringify(config) });
            console.log('[Demo Seed] Đã tự động cấu hình trường "title" làm tiêu đề hiển thị chính cho Sản Phẩm.');
          }
        }
      } catch (layoutErr) {
        console.error('[Demo Seed] Lỗi cấu hình mainField cho Sản Phẩm:', layoutErr.message);
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

      // D. Upload ảnh demo lên thư viện
      let phimImage = null;
      let ppfImage = null;
      let phimImageVf5 = null;
      let ppfImageVf5 = null;
      try {
        const uploadSeedImage = async (fileName) => {
          const filePath = path.join(process.cwd(), 'public', 'seed-assets', fileName);
          if (!fs.existsSync(filePath)) {
            console.log(`[Demo Seed] Không tìm thấy file ảnh để upload: ${filePath}`);
            return null;
          }
          
          const existing = await strapi.db.query('plugin::upload.file').findOne({
            where: { name: fileName }
          });
          if (existing) {
            return existing;
          }
          
          const stats = fs.statSync(filePath);
          const uploadService = strapi.plugin('upload').service('upload');
          
          const fileData = {
            path: filePath,
            filepath: filePath,
            name: fileName,
            type: 'image/png',
            size: stats.size,
          };
          
          const uploadedFiles = await uploadService.upload({
            data: {},
            files: fileData
          });
          
          const file = Array.isArray(uploadedFiles) ? uploadedFiles[0] : uploadedFiles;
          console.log(`[Demo Seed] Đã tải thành công ảnh lên thư viện: ${fileName} (ID: ${file.id})`);
          return file;
        };

        phimImage = await uploadSeedImage('phim_cach_nhiet.png');
        ppfImage = await uploadSeedImage('ppf_noi_that.png');
        phimImageVf5 = await uploadSeedImage('phim_cach_nhiet_vf5.png');
        ppfImageVf5 = await uploadSeedImage('ppf_noi_that_vf5.png');
        
        // Tải ảnh banner VinFast VF3
        let vf3BannerImage = await uploadSeedImage('vinfast_vf3_banner.png');
        if (vf3BannerImage) {
          const vf3Doc = await strapi.db.query('api::car-model.car-model').findOne({
            where: { slug: 'vinfast-vf3' }
          });
          if (vf3Doc) {
            await strapi.documents('api::car-model.car-model').update({
              documentId: vf3Doc.documentId,
              data: {
                banner: vf3BannerImage.id
              }
            });
            console.log(`[Demo Seed] Đã gán ảnh banner cho Vinfast VF3 (ID: ${vf3BannerImage.id})`);
          }
        }
      } catch (uploadErr) {
        console.error('[Demo Seed] Lỗi tải ảnh lên thư viện:', uploadErr.message);
      }

      const mediaFiles = await strapi.db.query('plugin::upload.file').findMany({ limit: 1 });
      const demoImageId = mediaFiles[0]?.id || null;
      if (demoImageId) {
        console.log(`[Demo Seed] Sử dụng ảnh demo mặc định ID: ${demoImageId}`);
      }

      // E. Lấy thông tin Dòng Xe để làm danh mục
      const carModels = await strapi.documents('api::car-model.car-model').findMany({ limit: -1 });

      // Định nghĩa các sản phẩm theo từng dòng xe
      const productsToSeed = [];

      // Tìm VF3 và VF5
      const vf3 = carModels.find(c => c.slug === 'vinfast-vf3');
      const vf5 = carModels.find(c => c.slug === 'vinfast-vf5');

      if (vf3) {
        productsToSeed.push({
          title: 'Phim cách nhiệt 3M Crystalline - Vinfast VF3',
          slug: 'phim-cach-nhiet-3m-crystalline-vinfast-vf3',
          price: '5.000.000 đ',
          shortDescription: 'Gói dán phim cách nhiệt 3M Crystalline cao cấp chính hãng bảo vệ tối ưu cho xe điện VinFast VF3, giảm 97% tia hồng ngoại.',
          description: `### Giới thiệu dịch vụ dán phim cách nhiệt cho Vinfast VF3
Dán phim cách nhiệt chính hãng chống nóng vượt trội, ngăn chặn 99% tia UV và bảo vệ không gian riêng tư trong xe.

### Tại sao nên chọn VinFast Spa?
- Chúng tôi sử dụng nguyên vật liệu nhập khẩu chính hãng 3M.
- Thi công trong phòng kín đạt tiêu chuẩn Detailing chuyên nghiệp.
- Chính sách bảo hành điện tử dài hạn lên tới 10 năm.`,
          car_model: vf3.id,
          image: phimImage?.id || demoImageId
        });

        productsToSeed.push({
          title: 'PPF Nội thất TPU - Vinfast VF3',
          slug: 'ppf-noi-that-tpu-vinfast-vf3',
          price: '2.500.000 đ',
          shortDescription: 'Bảo vệ các chi tiết bóng và màn hình nội thất xe VinFast VF3 tránh khỏi trầy xước dăm với chất liệu phim TPU tự phục hồi.',
          description: `### Giới thiệu dịch vụ dán PPF nội thất cho Vinfast VF3
Bảo vệ các chi tiết bóng, màn hình hiển thị nội thất tránh khỏi trầy xước dăm trong quá trình sử dụng hàng ngày.

### Ưu điểm vượt trội của phim PPF TPU:
- Khả năng tự phục hồi các vết xước dăm nhỏ dưới tác động của nhiệt độ.
- Chống ố vàng, giữ nguyên độ bóng loáng và thẩm mỹ gốc của xe.
- Cắt CNC chuẩn xác 100% theo kích thước nút bấm và màn hình VF3.`,
          car_model: vf3.id,
          image: ppfImage?.id || demoImageId
        });
      }

      if (vf5) {
        productsToSeed.push({
          title: 'Phim cách nhiệt 3M Crystalline - Vinfast VF5',
          slug: 'phim-cach-nhiet-3m-crystalline-vinfast-vf5',
          price: '5.500.000 đ',
          shortDescription: 'Gói dán phim cách nhiệt cao cấp cho VinFast VF5 chống nóng vượt trội, bảo vệ sức khỏe người lái và nội thất xe.',
          description: `### Giới thiệu dịch vụ dán phim cách nhiệt cho Vinfast VF5
Dán phim cách nhiệt chính hãng chống nóng vượt trội, ngăn chặn 99% tia UV và bảo vệ không gian riêng tư trong xe.

### Tại sao nên chọn VinFast Spa?
- Chúng tôi sử dụng nguyên vật liệu nhập khẩu chính hãng 3M.
- Thi công trong phòng kín đạt tiêu chuẩn Detailing chuyên nghiệp.
- Chính sách bảo hành điện tử dài hạn lên tới 10 năm.`,
          car_model: vf5.id,
          image: phimImageVf5?.id || phimImage?.id || demoImageId
        });

        productsToSeed.push({
          title: 'PPF Nội thất TPU - Vinfast VF5',
          slug: 'ppf-noi-that-tpu-vinfast-vf5',
          price: '3.000.000 đ',
          shortDescription: 'Dán PPF bảo vệ các bề mặt bóng và màn hình giải trí trung tâm lớn của xe VinFast VF5.',
          description: `### Giới thiệu dịch vụ dán PPF nội thất cho Vinfast VF5
Bảo vệ các chi tiết bóng, màn hình hiển thị nội thất tránh khỏi trầy xước dăm trong quá trình sử dụng hàng ngày.

### Ưu điểm vượt trội của phim PPF TPU:
- Khả năng tự phục hồi các vết xước dăm nhỏ dưới tác động của nhiệt độ.
- Chống ố vàng, giữ nguyên độ bóng loáng và thẩm mỹ gốc của xe.
- Cắt CNC chuẩn xác 100% theo kích thước nút bấm và màn hình VF5.`,
          car_model: vf5.id,
          image: ppfImageVf5?.id || ppfImage?.id || demoImageId
        });
      }

      // Tạo các sản phẩm mẫu
      for (const item of productsToSeed) {
        const existing = await strapi.documents('api::product.product').findMany({
          filters: { slug: item.slug }
        });

        if (existing.length === 0) {
          await strapi.documents('api::product.product').create({
            data: {
              title: item.title,
              slug: item.slug,
              price: item.price,
              shortDescription: item.shortDescription,
              description: item.description,
              car_model: item.car_model,
              image: item.image,
              gallery: item.image ? [item.image] : []
            },
            status: 'published'
          });
          console.log(`[Demo Seed] Đã tạo sản phẩm mới: "${item.title}"`);
        } else {
          console.log(`[Demo Seed] Sản phẩm "${item.title}" đã tồn tại.`);
        }
      }

      // F. Gieo 4 bài viết cẩm nang (giữ nguyên)
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

      console.log('--- HOÀN THÀNH THÊM DÒNG XE & SẢN PHẨM DEMO TỰ ĐỘNG ---');
    } catch (error) {
      console.error('[Demo Seed] Có lỗi xảy ra:', error);
    }
  },
};
