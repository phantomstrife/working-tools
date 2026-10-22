import { Inter } from 'next/font/google';
import '@/styles/theme.css';

import type { Metadata } from 'next';

const inter = Inter({
   subsets: ['latin', 'vietnamese'],
   display: 'swap',
   variable: '--font-inter',
});

const Layout: Router_Layout = async ({ params, children }) => {
   const { locale } = await params;

   return (
      <html
         lang={locale}
         className={inter.variable}
      >
         <body className="min-h-full flex flex-col">{children}</body>
      </html>
   );
};

export const metadata: Metadata = {
   title: 'Lucky draw',
   description: '',
   icons: {
      icon: [
         { url: '/favicon/favicon.ico' },
         { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
         { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: '/favicon/apple-touch-icon.png',
   },
   manifest: '/favicon/site.webmanifest',
};

export default Layout;
