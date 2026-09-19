import type { Metadata, Viewport } from 'next';
import './globals.css';
import './mobile.css';
import PwaRegister from '@/components/pwa-register';

export const metadata: Metadata = {
  title: 'Karen Martins | Cosméticos & Consórcios',
  description: 'Pedidos, consórcios e parcelas Karen Martins Cosméticos',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Karen Martins',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#7b183c',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body><PwaRegister/>{children}</body>
    </html>
  );
}
