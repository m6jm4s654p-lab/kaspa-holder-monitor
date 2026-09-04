import './globals.css';

export const metadata = {
  metadataBase: new URL('https://kaspa-holder-monitor-five.vercel.app'),
  title: 'KASPA Holder Monitor | @TechBit',
  description: 'KASPAのHolder動向、クジラ集中度、価格データを実データで可視化するオンチェーン分析ダッシュボード。',
  applicationName: 'KASPA Holder Monitor',
  manifest: '/manifest.webmanifest',
  authors: [{ name: '@TechBit' }],
  creator: '@TechBit',
  publisher: '@TechBit',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US'],
    url: 'https://kaspa-holder-monitor-five.vercel.app',
    siteName: 'KASPA Holder Monitor',
    title: 'KASPA Holder Monitor | @TechBit',
    description: 'KASPAのHolder動向・クジラ集中度・価格データを実データで可視化。',
    images: [
      {
        url: '/og-kaspa-holder-monitor.png',
        width: 1200,
        height: 630,
        alt: 'KASPA Holder Monitor by @TechBit'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KASPA Holder Monitor | @TechBit',
    description: 'KASPAのHolder動向・クジラ集中度・価格データを実データで可視化。',
    images: ['/og-kaspa-holder-monitor.png'],
    creator: '@TechBit'
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: [
      { url: '/favicon-64.png', type: 'image/png', sizes: '64x64' },
      { url: '/kaspa-logo.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/favicon-64.png'
  }
};

export const viewport = {
  themeColor: '#061716',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
