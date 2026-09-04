import './globals.css';

export const metadata = {
  title: 'KASPA Holder Monitor · @TechBit',
  description: 'Kaspa holder distribution and on-chain trend monitor by @TechBit',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'KAS Monitor' }
};

export const viewport = {
  themeColor: '#49eac1'
};

export default function RootLayout({ children }) {
  return <html lang="ja"><body>{children}</body></html>;
}
