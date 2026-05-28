import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white sm:px-8">
      <div className="container mx-auto max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-violet-300/80">Create account</p>
          <h1 className="text-4xl font-semibold">Start directing your story reels.</h1>
          <p className="text-slate-300">Sign up and let AI assemble your visuals into emotional reels.</p>
        </div>
        <div className="glass-card rounded-[2rem] border border-white/10 p-8">
          <form className="space-y-6">
            <label className="block text-sm text-slate-300">
              Full name
              <input type="text" className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-brand-400" placeholder="Your name" />
            </label>
            <label className="block text-sm text-slate-300">
              Email address
              <input type="email" className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-brand-400" placeholder="you@example.com" />
            </label>
            <label className="block text-sm text-slate-300">
              Password
              <input type="password" className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-brand-400" placeholder="••••••••" />
            </label>
            <button type="submit" className="w-full rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">Create account</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-white underline underline-offset-4">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
