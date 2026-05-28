'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Video, Eye, Download, MoreHorizontal, Star, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatRelativeTime, CATEGORY_LABELS } from '@/lib/utils';
import toast from 'react-hot-toast';

const MOCK_PROJECTS = [
  { id: '1', title: 'Summer Travel Vlog', category: 'TRAVEL', mood: 'CINEMATIC', status: 'COMPLETED', createdAt: new Date(Date.now() - 2 * 3600000), viralityScore: 87, viewCount: 12400, duration: 30 },
  { id: '2', title: 'Homemade Pasta Recipe', category: 'COOKING', mood: 'COZY', status: 'COMPLETED', createdAt: new Date(Date.now() - 86400000), viralityScore: 92, viewCount: 8900, duration: 60 },
  { id: '3', title: 'Morning Gym Routine', category: 'FITNESS', mood: 'FAST_PACED', status: 'PROCESSING', createdAt: new Date(Date.now() - 600000), viralityScore: null, viewCount: 0, duration: 30 },
  { id: '4', title: 'Luna the Golden Retriever', category: 'PETS', mood: 'EMOTIONAL', status: 'COMPLETED', createdAt: new Date(Date.now() - 3 * 86400000), viralityScore: 79, viewCount: 5200, duration: 30 },
  { id: '5', title: 'Café Morning Vibes', category: 'CAFE', mood: 'COZY', status: 'COMPLETED', createdAt: new Date(Date.now() - 5 * 86400000), viralityScore: 83, viewCount: 7100, duration: 15 },
  { id: '6', title: 'Wedding Highlights', category: 'WEDDING', mood: 'EMOTIONAL', status: 'COMPLETED', createdAt: new Date(Date.now() - 7 * 86400000), viralityScore: 95, viewCount: 22000, duration: 60 },
];

const STATUS_STYLES = {
  COMPLETED: 'bg-green-500/20 text-green-300 border-green-500/30',
  PROCESSING: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  QUEUED: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  FAILED: 'bg-red-500/20 text-red-300 border-red-500/30',
  DRAFT: 'bg-white/10 text-white/50 border-white/10',
};

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filtered = MOCK_PROJECTS.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'all' || p.status.toLowerCase() === activeTab;
    return matchSearch && matchTab;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <p className="text-sm text-white/40 mt-1">{MOCK_PROJECTS.length} total reels created</p>
        </div>
        <Link href="/create">
          <Button variant="gradient">
            <Plus className="h-4 w-4" />
            New Reel
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Done</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Projects grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl overflow-hidden hover-lift group"
          >
            {/* Thumbnail */}
            <div className="relative h-40 bg-gradient-to-br from-violet-900/50 to-purple-900/30 flex items-center justify-center">
              <div className="text-5xl opacity-30">{CATEGORY_LABELS[project.category]?.split(' ')[0] || '🎬'}</div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {/* Status badge */}
              <div className="absolute top-3 left-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[project.status as keyof typeof STATUS_STYLES]}`}>
                  {project.status === 'PROCESSING' ? '⏳ Rendering...' : project.status}
                </span>
              </div>
              {/* Duration */}
              <div className="absolute top-3 right-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-black/50 text-white/70">{project.duration}s</span>
              </div>
              {/* Play button on hover */}
              {project.status === 'COMPLETED' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-white text-sm leading-tight">{project.title}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="shrink-0 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                    <DropdownMenuItem><Download className="h-4 w-4 mr-2" />Download</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={() => toast.success('Project deleted')}>
                      <Trash2 className="h-4 w-4 mr-2" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/40">
                <span>{CATEGORY_LABELS[project.category]?.replace(/^[^\s]+ /, '') || project.category}</span>
                <span>•</span>
                <span>{formatRelativeTime(project.createdAt)}</span>
              </div>

              {project.viralityScore && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Star className="h-3 w-3 fill-current" />
                    {project.viralityScore}% viral score
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/40">
                    <Eye className="h-3 w-3" />
                    {project.viewCount.toLocaleString()}
                  </div>
                </div>
              )}

              {project.status === 'COMPLETED' && (
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
              )}
            </div>
          </motion.div>
        ))}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
            <p className="text-white/40 text-sm mb-6">
              {search ? 'Try a different search term' : 'Create your first reel to get started'}
            </p>
            <Link href="/create">
              <Button variant="gradient"><Plus className="h-4 w-4" />Create Your First Reel</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
