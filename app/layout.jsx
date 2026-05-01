import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata = {
  title: 'Yurt Personel Yönetim Paneli',
  description: 'Enderun Bilişim – Yurt yetkili yönetim sistemi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
