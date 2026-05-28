import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastProvider } from '../components/ui/toast';

export const metadata: Metadata = {
  title: {
    default: 'StoryReel AI — Turn Photos into Cinematic Reels',
    template: '%s | StoryReel AI',
  },
  description:
    'Upload photos and short videos. AI automatically transforms them into cinematic vertical reels for Instagram, TikTok, YouTube Shorts, and WhatsApp.',
  keywords: ['AI video', 'reel maker', 'Instagram reels', 'TikTok', 'cinematic', 'AI story director', 'video editor'],
  authors: [{ name: 'StoryReel AI' }],
  creator: 'StoryReel AI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://storyreel.ai',
    title: 'StoryReel AI — Turn Photos into Cinematic Reels',
    description: 'AI Story Director for the modern creator. Upload photos. Let AI direct your reel.',
    siteName: 'StoryReel AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StoryReel AI',
    description: 'Turn memories into cinematic stories with AI.',
    creator: '@storyreel_ai',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#090b13',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased font-sans">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
