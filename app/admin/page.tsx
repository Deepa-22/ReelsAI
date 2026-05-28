'use client';

import { motion } from 'framer-motion';
import { Users, Video, DollarSign, TrendingUp, ArrowUpRight, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ADMIN_STATS = [
  { label: 'Total Users', value: '152,847', change: '+2,341 this week', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Reels Created', value: '2,041,293', change: '+12,400 today', icon: Video, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { label: 'MRR', value: '$48,420', change: '+8.3% vs last month', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
  { label: 'API Calls', value: '8.2M', change: '+15% this month', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

const RECENT_SIGNUPS = [
  { name: 'Priya Sharma', email: 'p.sharma@...', plan: 'PRO', country: '🇮🇳', time: '2m ago' },
  { name: 'Jake Williams', email: 'j.will@...', plan: 'FREE', country: '🇺🇸', time: '5m ago' },
  { name: 'Maria Garcia', email: 'm.garc@...', plan: 'BUSINESS', country: '🇪🇸', time: '12m ago' },
  { name: 'Yuki Tanaka', email: 'y.tana@...', plan: 'PRO', country: '🇯🇵', time: '23m ago' },
  { name: 'David Okafor', email: 'd.okaf@...', plan: 'FREE', country: '🇳🇬', time: '1h ago' },
];

const SYSTEM_STATUS = [
  { name: 'API Gateway', status: 'operational', latency: '45ms' },
  { name: 'AI Generation Queue', status: 'operational', latency: '2.3s avg' },
  { name: 'Video Rendering', status: 'degraded', latency: '8.1s avg' },
  { name: 'Supabase DB', status: 'operational', latency: '12ms' },
  { name: 'Storage (CDN)', status: 'operational', latency: '28ms' },
  { name: 'Stripe Payments', status: 'operational', latency: '220ms' },
];

export default function Page() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
          <p className="text-white/40 text-sm mt-1">Real-time platform metrics</p>
        </div>
        <Badge variant="success" className="text-sm px-3 py-1.5">
          <Activity className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
          All Systems Operational
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ADMIN_STATS.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
              <div className="text-xs text-green-400 mt-2">{stat.change}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 space-y-4">
          <CardTitle className="text-white text-base">Plan Distribution</CardTitle>
          {[
            { plan: 'Free', count: 138241, pct: 90, color: 'bg-white/20' },
            { plan: 'Pro', count: 12840, pct: 8.4, color: 'bg-violet-500' },
            { plan: 'Business', count: 1766, pct: 1.6, color: 'bg-amber-500' },
          ].map((p) => (
            <div key={p.plan} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">{p.plan}</span>
                <span className="text-white/50">{p.count.toLocaleString()} ({p.pct}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10">
                <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-5 space-y-4 lg:col-span-2">
          <CardTitle className="text-white text-base">Recent Signups</CardTitle>
          <div className="space-y-3">
            {RECENT_SIGNUPS.map((user, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{user.country}</span>
                  <div>
                    <div className="text-sm font-medium text-white">{user.name}</div>
                    <div className="text-xs text-white/40">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.plan === 'FREE' ? 'secondary' : user.plan === 'PRO' ? 'default' : 'gold'} className="text-xs">
                    {user.plan}
                  </Badge>
                  <span className="text-xs text-white/30">{user.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 space-y-4">
        <CardTitle className="text-white text-base">System Status</CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SYSTEM_STATUS.map((service) => (
            <div key={service.name} className="flex items-center justify-between glass rounded-xl p-3">
              <div className="flex items-center gap-2">
                {service.status === 'operational'
                  ? <CheckCircle className="h-4 w-4 text-green-400" />
                  : <AlertCircle className="h-4 w-4 text-yellow-400" />}
                <span className="text-sm text-white/70">{service.name}</span>
              </div>
              <div className="text-right">
                <Badge variant={service.status === 'operational' ? 'success' : 'warning'} className="text-[10px]">
                  {service.status}
                </Badge>
                <div className="text-[10px] text-white/30 mt-0.5">{service.latency}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
