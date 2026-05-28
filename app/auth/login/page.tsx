import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white sm:px-8">
      <div className="container mx-auto max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-violet-300/80">Sign in</p>
          <h1 className="text-4xl font-semibold">Welcome back to StoryReel AI</h1>
          <p className="text-slate-300">Sign in to create cinematic reels from your memories.</p>
        </div>
        <div className="glass-card rounded-[2rem] border border-white/10 p-8">
          <form className="space-y-6">
            <label className="block text-sm text-slate-300">
              Email address
              <input type="email" className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-brand-400" placeholder="you@example.com" />
            </label>
            <label className="block text-sm text-slate-300">
              Password
              <input type="password" className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-brand-400" placeholder="••••••••" />
            </label>
            <button type="submit" className="w-full rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">Sign in</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            New to StoryReel AI?{' '}
            <Link href="/auth/register" className="text-white underline underline-offset-4">Create account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
