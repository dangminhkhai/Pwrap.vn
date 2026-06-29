import HomePage from '@/components/HomePage';

// Hàm gọi API phía Server (Server-Side Rendering)
async function getStrapiData() {
  const STRAPI_URL = 'http://localhost:1337';
  
  try {
    // Gọi đồng thời tất cả các API từ Strapi
    const [resCars, resServices, resDetails, resBlogs] = await Promise.all([
      fetch(`${STRAPI_URL}/api/car-models?sort[0]=order:asc&sort[1]=name:asc`, { cache: 'no-store' }),
      fetch(`${STRAPI_URL}/api/services?sort[0]=order:asc&populate=*`, { cache: 'no-store' }),
      fetch(`${STRAPI_URL}/api/car-service-details?populate=*`, { cache: 'no-store' }),
      fetch(`${STRAPI_URL}/api/blogs?populate=*&sort=createdAt:desc`, { cache: 'no-store' })
    ]);

    const cars = await resCars.json();
    const services = await resServices.json();
    const details = await resDetails.json();
    const blogs = await resBlogs.json();

    return {
      carModels: cars.data || [],
      services: services.data || [],
      carServiceDetails: details.data || [],
      blogs: blogs.data || []
    };
  } catch (error) {
    console.error('Lỗi kết nối tới Strapi CMS:', error);
    return { carModels: [], services: [], carServiceDetails: [], blogs: [] };
  }
}

export default async function Page() {
  const data = await getStrapiData();

  return (
    <HomePage
      carModels={data.carModels}
      services={data.services}
      carServiceDetails={data.carServiceDetails}
      blogs={data.blogs}
    />
  );
}
