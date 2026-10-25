import { Inter } from 'next/font/google';
import { I18nProvider } from '@admin-web/locale';

import '@admin-web/styles/theme.css';

const inter = Inter({
   display: 'swap',
   subsets: ['latin', 'vietnamese'],
   weight: ['400', '500', '600', '700'],
   variable: '--font-inter',
});

const RootLayout: Router.Layout = (properties) => {
   const { children } = properties;

   return (
      <html
         lang="vi"
         className={inter.variable}
      >
         <body>
            <I18nProvider>{children}</I18nProvider>
         </body>
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

export default RootLayout;
