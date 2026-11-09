import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthContext';
import { OfflineSyncProvider } from '@/components/sync/OfflineSyncContext';

export const metadata: Metadata = {
  title: 'HIPG - Digital Tally & Verification System (DTVS)',
  description:
    'Hambantota International Port Group (HIPG) Enterprise Vehicle Tally, Inspection, and Verification System.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HIPG DTVS',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B1F3A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F7FB] text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <OfflineSyncProvider>{children}</OfflineSyncProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

