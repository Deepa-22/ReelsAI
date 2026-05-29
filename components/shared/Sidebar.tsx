'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, LayoutDashboard, FolderOpen, Plus, Wand2, BookOpen, Palette,
  Settings, CreditCard, BarChart2, Gift, HelpCircle,
  ChevronLeft, ChevronRight, LogOut, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore, useUserStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const NAV_ITEMS: Array<{ href: string; label: string; icon: typeof Plus; highlight?: boolean; badge?: string }> = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/create', label: 'Create Reel', icon: Plus, highlight: true },
  { href: '/story', label: 'Story Mode', icon: BookOpen, badge: 'NEW' },
  { href: '/branding', label: 'Brand Kit', icon: Palette, badge: '🌸' },
  { href: '/projects', label: 'My Projects', icon: FolderOpen },
  { href: '/ai-studio', label: 'AI Studio', icon: Wand2 },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/referral', label: 'Referrals', icon: Gift },
];

const BOTTOM_ITEMS = [
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, clearUser } = useUserStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
    toast.success('Signed out');
    router.push('/');
  };

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen glass border-r border-white/8 overflow-hidden z-40"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-white/8 min-h-[65px]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-glow-sm">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-white text-base overflow-hidden whitespace-nowrap"
              >
                StoryReel AI
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                active
                  ? 'bg-violet-600/20 border border-violet-500/30 text-white'
                  : item.highlight
                    ? 'bg-violet-600 text-white hover:bg-violet-500'
                    : 'text-white/50 hover:text-white hover:bg-white/8'
              )}>
                <item.icon className={cn('h-5 w-5 shrink-0', active && 'text-violet-300')} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.badge && sidebarOpen && (
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-br from-violet-500 to-pink-500 text-white">
                    {item.badge}
                  </span>
                )}
                {active && sidebarOpen && !item.badge && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Plan badge */}
      <AnimatePresence>
        {sidebarOpen && user && user.plan !== 'FREE' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pb-2">
            <div className="glass-card rounded-xl p-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-xs text-white/70 font-medium">{user.plan} Plan</span>
              <Badge variant="gold" className="ml-auto text-xs">Active</Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Free plan upgrade */}
      <AnimatePresence>
        {sidebarOpen && user?.plan === 'FREE' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pb-2">
            <Link href="/billing">
              <div className="glass-card rounded-xl p-3 border border-violet-500/20 hover:border-violet-500/40 transition-colors cursor-pointer">
                <div className="text-xs font-semibold text-white mb-1">Upgrade to Pro</div>
                <div className="text-xs text-white/40 mb-2">{user.credits} free reels left</div>
                <div className="h-1.5 w-full rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-500" style={{ width: `${(user.credits / 3) * 100}%` }} />
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav */}
      <div className="border-t border-white/8 py-3 px-2 space-y-1">
        {BOTTOM_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl transition-all',
                active ? 'text-white bg-white/10' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              )}>
                <item.icon className="h-4 w-4 shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-medium whitespace-nowrap overflow-hidden">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="h-4 w-4 shrink-0" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-medium whitespace-nowrap overflow-hidden">
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full glass border border-white/15 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all"
      >
        {sidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
    </motion.aside>
  );
}
