'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plus, Sparkles, TrendingUp, Video, Clock, Star,
  ArrowRight, Zap, Eye, Download, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime, CATEGORY_LABELS, MOOD_LABELS } from '@/lib/utils';

const MOCK_PROJECTS = [
  { id: '1', title: 'Summer Travel Vlog', category: 'TRAVEL', mood: 'CINEMATIC', status: 'COMPLETED', thumbnail: null, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), viralityScore: 87, viewCount: 12400 },
  { id: '2', title: 'Homemade Pasta Recipe', category: 'COOKING', mood: 'COZY', status: 'COMPLETED', thumbnail: null, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), viralityScore: 92, viewCount: 8900 },
  { id: '3', title: 'Morning Gym Routine', category: 'FITNESS', mood: 'FAST_PACED', status: 'PROCESSING', thumbnail: null, createdAt: new Date(Date.now() - 10 * 60 * 1000), viralityScore: null, viewCount: 0 },
  { id: '4', title: 'Luna the Golden Retriever', category: 'PETS', mood: 'EMOTIONAL', status: 'COMPLETED', thumbnail: null, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), viralityScore: 79, viewCount: 5200 },
];

const STATS = [
  { label: 'Total Reels', value: '24', change: '+3 this week', icon: Video, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { label: 'Total Views', value: '127K', change: '+12% vs last month', icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Avg Virality', value: '84%', change: 'Top 15% of creators', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
  { label: 'Exports', value: '18', change: '5 remaining this month', icon: Download, color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

const STATUS_CONFIG = {
  COMPLETED: { label: 'Completed', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  PROCESSING: { label: 'Rendering...', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  QUEUED: { label: 'Queued', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  FAILED: { label: 'Failed', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  DRAFT: { label: 'Draft', color: 'bg-white/10 text-white/50 border-white/10' },
};

export default function DashboardPage() {
  const [loading] = useState(false);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass-card rounded-3xl p-6 sm:p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/10 to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400 animate-pulse" />
              <span className="text-sm font-medium text-violet-300">AI Story Director</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, Creator! 👋
            </h2>
            <p className="text-white/50 text-sm max-w-md">
              Your AI studio is ready. Upload photos and create a cinematic reel in minutes.
            </p>
          </div>
          <Link href="/create">
            <Button variant="gradient" size="lg" className="group shrink-0">
              <Plus className="h-5 w-5" />
              Create New Reel
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-5 hover-lift">
              <div className="flex items-start justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-white/50 mt-0.5">{stat.label}</div>
              <div className="text-xs text-white/30 mt-2">{stat.change}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Quick Create</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Cooking Reel', icon: '🍳', mood: 'COZY', category: 'COOKING' },
            { label: 'Travel Story', icon: '✈️', mood: 'CINEMATIC', category: 'TRAVEL' },
            { label: 'Pet Memories', icon: '🐾', mood: 'EMOTIONAL', category: 'PETS' },
            { label: 'Business Promo', icon: '📦', mood: 'VIRAL', category: 'PRODUCT' },
          ].map((quick) => (
            <Link key={quick.label} href={`/create?category=${quick.category}&mood=${quick.mood}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card rounded-2xl p-4 cursor-pointer hover:border-violet-500/30 transition-all text-center"
              >
                <div className="text-3xl mb-2">{quick.icon}</div>
                <div className="text-sm font-medium text-white/70">{quick.label}</div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="text-violet-400">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {MOCK_PROJECTS.map((project, i) => {
              const statusConfig = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG];
              const categoryLabel = CATEGORY_LABELS[project.category] || project.category;
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-4 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail placeholder */}
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-900/50 to-purple-900/50 border border-violet-500/20 flex items-center justify-center shrink-0 text-xl">
                      {categoryLabel.split(' ')[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-white text-sm truncate">{project.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-white/40">{formatRelativeTime(project.createdAt)}</span>
                            <span className="text-white/20">•</span>
                            <span className="text-xs text-white/40">{categoryLabel.replace(/^[^\s]+ /, '')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>

                      {project.status === 'PROCESSING' && (
                        <div className="mt-2">
                          <Progress value={65} className="h-1" />
                        </div>
                      )}

                      {project.viralityScore && (
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-xs text-amber-400">
                            <Star className="h-3 w-3 fill-current" />
                            {project.viralityScore}% viral score
                          </div>
                          <div className="flex items-center gap-1 text-xs text-white/40">
                            <Eye className="h-3 w-3" />
                            {project.viewCount.toLocaleString()} views
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {project.status === 'COMPLETED' && (
                        <Button variant="ghost" size="icon-sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upgrade CTA for free users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-3xl p-6 border border-violet-500/20 bg-gradient-to-r from-violet-600/10 to-purple-600/5"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-violet-500/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Unlock Unlimited Reels</h3>
              <p className="text-sm text-white/50 mt-0.5">Upgrade to Pro for HD quality, no watermark, and AI voiceover.</p>
            </div>
          </div>
          <Link href="/billing">
            <Button variant="gradient" size="sm">
              Upgrade to Pro
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
