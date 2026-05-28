import Link from 'next/link';
import { Sparkles, LayoutDashboard, Users, BarChart2, FileText, Settings, Database, Sliders } from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/templates', label: 'Templates', icon: FileText },
  { href: '/admin/api-usage', label: 'API Usage', icon: Database },
  { href: '/admin/features', label: 'Feature Flags', icon: Sliders },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-56 flex flex-col h-screen glass border-r border-white/8">
        <div className="flex items-center gap-2 p-4 border-b border-white/8">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">StoryReel</div>
            <div className="text-xs text-red-400">Admin Panel</div>
          </div>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-1">
          {ADMIN_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/8 transition-all">
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/8">
          <Link href="/dashboard" className="text-xs text-white/30 hover:text-white/50 transition-colors">
            ← Back to App
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
