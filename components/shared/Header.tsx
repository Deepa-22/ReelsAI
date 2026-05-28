'use client';

import { useState } from 'react';
import { Bell, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/lib/store';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Header({ title }: { title?: string }) {
  const { user, clearUser } = useUserStore();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
    toast.success('Signed out');
    router.push('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-white/8 glass sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-lg font-semibold text-white">{title}</h1>}
        <div className="hidden md:flex items-center gap-2 glass rounded-xl px-3 py-2 min-w-[200px]">
          <Search className="h-4 w-4 text-white/30 shrink-0" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder:text-white/30 outline-none w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/create">
          <Button variant="gradient" size="sm">
            <Plus className="h-4 w-4" />
            New Reel
          </Button>
        </Link>

        <button className="relative h-9 w-9 rounded-xl glass flex items-center justify-center text-white/50 hover:text-white transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-500" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar className="h-9 w-9 border border-white/10">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-medium text-white leading-none mb-0.5">{user?.name || 'Creator'}</div>
                <Badge variant={user?.plan === 'FREE' ? 'secondary' : 'pro'} className="text-[10px] px-1.5 py-0">
                  {user?.plan || 'FREE'}
                </Badge>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-white/40">{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/billing')}>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400">Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
