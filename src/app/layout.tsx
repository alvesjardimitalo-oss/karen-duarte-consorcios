import type { Metadata } from 'next';
import './globals.css';
import './mobile.css';

export const metadata: Metadata = {
  title: 'Karen Martins | Consórcios',
  description: 'Gestão de consórcios de cosméticos Karen Martins',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
