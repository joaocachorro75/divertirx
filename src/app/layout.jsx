import React from 'react';
import './globals.css';

export const metadata = {
  title: 'DivertiX - Internet e TV via IA',
  description: 'Experimente internet VPN ilimitada e TV via internet com 1 teste lifetime. IA humanizada para atendimento.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gradient-to-br from-gray-900 via-purple-900 to-black min-h-screen">
        {children}
      </body>
    </html>
  );
}
