 'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Chrome, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

const PLAN_PERKS = {
  free: ['3 reels/month', 'Basic templates', 'SD quality'],
  pro: ['Unlimited reels', 'HD quality', 'No watermark', 'AI voiceover', 'All templates'],
  business: ['Everything in Pro', '4K quality', 'Team access', 'Brand kits', 'Analytics'],
};

export default function RegisterPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<keyof typeof PLAN_PERKS | 'free'>('free');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('plan') as keyof typeof PLAN_PERKS | null;
      if (p && PLAN_PERKS[p]) setPlan(p);
    }
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, plan },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      if (data.user?.identities?.length === 0) {
        toast.error('Email already registered. Sign in instead.');
        return;
      }
      toast.success('Account created! Check your email to verify.');
      router.push('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Google signup failed');
      setGoogleLoading(false);
    }
  };

  const planPerks = PLAN_PERKS[plan] || PLAN_PERKS.free;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="glass-card rounded-3xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            {plan !== 'free' ? (
              <Badge variant="pro" className="capitalize">{plan} Plan</Badge>
            ) : (
              <Badge variant="default">Free Forever</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-white/50 text-sm">Join 150,000+ creators</p>
        </div>

        {/* Plan perks */}
        <div className="glass rounded-xl p-4 space-y-2">
          {planPerks.map((perk) => (
            <div key={perk} className="flex items-center gap-2 text-sm text-white/60">
              <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
              {perk}
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full h-11" onClick={handleGoogleSignup} loading={googleLoading}>
          <Chrome className="h-5 w-5 text-blue-400" />
          Sign up with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center"><span className="bg-[#0f172a] px-3 text-xs text-white/30">or with email</span></div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <Input label="Full Name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} icon={<User className="h-4 w-4" />} required />
          <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="h-4 w-4" />} required />
          <Input label="Password" type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock className="h-4 w-4" />} required />
          <Button type="submit" variant="gradient" className="w-full h-11" loading={loading}>
            Create Account <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="text-center text-xs text-white/30">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-violet-400 hover:underline">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>
        </p>

        <p className="text-center text-sm text-white/40">
          Already have an account?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign in</Link>
        </p>
      </div>
    </motion.div>
  );
}
