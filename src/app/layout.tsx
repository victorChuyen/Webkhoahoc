import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ReactQueryProvider } from '@/lib/providers/ReactQueryProvider';
import './globals.css';

const inter = Inter({
    subsets: ['latin', 'vietnamese'],
    variable: '--font-inter',
    display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-plus-jakarta',
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'CourseMarket VN - Học trực tuyến hàng đầu Việt Nam',
        template: '%s | CourseMarket VN',
    },
    description: 'Nền tảng học trực tuyến hàng đầu Việt Nam. Học từ các chuyên gia, phát triển kỹ năng lập trình, thiết kế, marketing và nhiều hơn nữa.',
    keywords: ['học trực tuyến', 'khóa học online', 'lập trình', 'thiết kế', 'việt nam'],
    authors: [{ name: 'CourseMarket VN' }],
    creator: 'CourseMarket VN',
    manifest: '/manifest.json',
    openGraph: {
        type: 'website',
        locale: 'vi_VN',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        title: 'CourseMarket VN - Học trực tuyến hàng đầu Việt Nam',
        description: 'Nền tảng học trực tuyến hàng đầu Việt Nam',
        siteName: 'CourseMarket VN',
    },
};

export const viewport: Viewport = {
    themeColor: '#2563eb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <head />
            <body className={`${inter.variable} ${plusJakarta.variable} font-sans`} suppressHydrationWarning>
                <ReactQueryProvider>
                    <div className="min-h-screen flex flex-col">
                        <Navbar />
                        <main className="flex-1">{children}</main>
                        <Footer />
                    </div>
                    <Toaster />
                </ReactQueryProvider>
            </body>
        </html>
    );
}
