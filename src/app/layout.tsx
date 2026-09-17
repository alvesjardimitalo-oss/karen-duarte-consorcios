import type { Metadata } from 'next';
import './globals.css';
import './brand.css';

export const metadata: Metadata = {
  title: 'Karen Martins | Cosméticos & Consórcios',
  description: 'Gestão de consórcios de cosméticos Karen Martins',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
