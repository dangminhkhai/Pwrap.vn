import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";

export const metadata = {
  title: "VinFast Spa - Dịch Vụ Chăm Sóc Xe Điện Cao Cấp",
  description: "Hệ thống chăm sóc và làm đẹp xe điện VinFast chuyên nghiệp chuẩn SEO/AEO",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className="h-full antialiased dark"
      suppressHydrationWarning
    >
      <head>
        {/* Google Fonts hỗ trợ Tiếng Việt */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <Header />
        <main className="main-container">{children}</main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
