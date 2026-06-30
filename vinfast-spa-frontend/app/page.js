import HomePage from '@/components/HomePage';

// Hàm gọi API phía Server (Server-Side Rendering)
async function getStrapiData() {
  const STRAPI_URL = 'http://localhost:1337';
  
  try {
    // Gọi đồng thời tất cả các API từ Strapi
    const [resCars, resProducts, resBlogs] = await Promise.all([
      fetch(`${STRAPI_URL}/api/car-models?sort[0]=order:asc&sort[1]=name:asc`, { cache: 'no-store' }),
      fetch(`${STRAPI_URL}/api/products?populate=*`, { cache: 'no-store' }),
      fetch(`${STRAPI_URL}/api/blogs?populate=*&sort=createdAt:desc`, { cache: 'no-store' })
    ]);

    const cars = await resCars.json();
    const products = await resProducts.json();
    const blogs = await resBlogs.json();

    return {
      carModels: cars.data || [],
      products: products.data || [],
      blogs: blogs.data || []
    };
  } catch (error) {
    console.error('Lỗi kết nối tới Strapi CMS:', error);
    return { carModels: [], products: [], blogs: [] };
  }
}

export default async function Page() {
  const data = await getStrapiData();

  return (
    <HomePage
      carModels={data.carModels}
      products={data.products}
      blogs={data.blogs}
    />
  );
}
