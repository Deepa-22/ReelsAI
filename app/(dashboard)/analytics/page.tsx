'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Eye, Download, Heart, Share2, Star, Video, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const STATS = [
  { label: 'Total Views', value: '127,450', change: '+12.5%', up: true, icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Total Reels', value: '24', change: '+3 this week', up: true, icon: Video, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { label: 'Avg Viral Score', value: '84%', change: '+5% vs last month', up: true, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'Shares', value: '3,241', change: '+8.2%', up: true, icon: Share2, color: 'text-green-400', bg: 'bg-green-500/10' },
];

const TOP_REELS = [
  { title: 'Wedding Highlights', views: 22000, likes: 1840, shares: 920, score: 95, category: '💒' },
  { title: 'Summer Travel Vlog', views: 12400, likes: 1100, shares: 540, score: 87, category: '✈️' },
  { title: 'Café Morning Vibes', views: 8900, likes: 720, shares: 310, score: 83, category: '☕' },
  { title: 'Homemade Pasta', views: 7100, likes: 560, shares: 280, score: 79, category: '🍳' },
  { title: 'Luna the Retriever', views: 5200, likes: 490, shares: 215, score: 75, category: '🐾' },
];

const PLATFORM_BREAKDOWN = [
  { name: 'Instagram', percentage: 45, views: 57350, color: 'from-pink-500 to-orange-400' },
  { name: 'TikTok', percentage: 30, views: 38235, color: 'from-gray-600 to-gray-400' },
  { name: 'YouTube Shorts', percentage: 20, views: 25490, color: 'from-red-600 to-red-400' },
  { name: 'WhatsApp', percentage: 5, views: 6375, color: 'from-green-600 to-green-400' },
];

const WEEKLY_DATA = [40, 65, 48, 72, 85, 91, 78, 95, 88, 102, 115, 108, 122, 130];

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Track your reel performance and growth</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className={`flex items-center gap-1 text-xs ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-white/40 mt-0.5">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart placeholder */}
      <Card className="p-6">
        <CardHeader className="p-0 mb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Views Over Time</CardTitle>
            <Tabs defaultValue="14d">
              <TabsList>
                <TabsTrigger value="7d">7d</TabsTrigger>
                <TabsTrigger value="14d">14d</TabsTrigger>
                <TabsTrigger value="30d">30d</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-48 flex items-end gap-1.5">
            {WEEKLY_DATA.map((val, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.03, duration: 0.4 }}
                style={{ height: `${(val / 130) * 100}%` }}
                className="flex-1 bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-md origin-bottom"
              />
            ))}
          </div>
          <div className="flex justify-between mt-3">
            <span className="text-xs text-white/30">Jan 14</span>
            <span className="text-xs text-white/30">Jan 27</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top performing reels */}
        <Card className="p-6 space-y-4">
          <CardTitle className="text-white">Top Performing Reels</CardTitle>
          <div className="space-y-3">
            {TOP_REELS.map((reel, i) => (
              <motion.div key={reel.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4">
                <span className="text-xl w-8 shrink-0">{reel.category}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{reel.title}</div>
                  <div className="text-xs text-white/40 mt-0.5">{reel.views.toLocaleString()} views · {reel.likes.toLocaleString()} likes</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Star className="h-3 w-3 fill-current" />{reel.score}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Platform breakdown */}
        <Card className="p-6 space-y-4">
          <CardTitle className="text-white">Platform Breakdown</CardTitle>
          <div className="space-y-4">
            {PLATFORM_BREAKDOWN.map((p, i) => (
              <div key={p.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{p.name}</span>
                  <span className="text-white/50">{p.views.toLocaleString()} views ({p.percentage}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.percentage}%` }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className={`h-full rounded-full bg-gradient-to-r ${p.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
