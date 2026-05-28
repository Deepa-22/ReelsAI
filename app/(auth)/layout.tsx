import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />

      <header className="relative z-10 p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white text-lg">StoryReel AI</span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        {children}
      </main>

      <footer className="relative z-10 p-6 text-center">
        <p className="text-sm text-white/25">
          © 2025 StoryReel AI •{' '}
          <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
          {' '}•{' '}
          <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
        </p>
      </footer>
    </div>
  );
}
