import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Karen Martins | Consórcios',
  description: 'Gestão de consórcios de cosméticos Karen Martins',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
