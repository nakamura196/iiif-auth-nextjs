import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'),
  title: {
    default: 'IIIF Authentication API 2.0 Demo',
    template: '%s | IIIF Auth Demo'
  },
  description: 'A comprehensive demonstration of the IIIF Authentication API 2.0 specification with multiple viewer integrations',
  keywords: ['IIIF', 'Authentication', 'API', 'Image', 'Viewer', 'Digital Library', 'Cultural Heritage'],
  authors: [{ name: 'IIIF Community' }],
  creator: 'IIIF Authentication Demo',
  publisher: 'IIIF Consortium',
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ja_JP'],
    url: '/',
    title: 'IIIF Authentication API 2.0 Demo',
    description: 'A comprehensive demonstration of the IIIF Authentication API 2.0 specification with multiple viewer integrations',
    siteName: 'IIIF Auth Demo',
    images: [
      {
        url: '/ogp-image.png',
        width: 1200,
        height: 630,
        alt: 'IIIF Authentication API 2.0 Demo'
      }
    ]
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'IIIF Authentication API 2.0 Demo',
    description: 'A comprehensive demonstration of the IIIF Authentication API 2.0 specification',
    images: ['/ogp-image.png'],
    creator: '@iiif_io'
  },
  
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' }
    ]
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}