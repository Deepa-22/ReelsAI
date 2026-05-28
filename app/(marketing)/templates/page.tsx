'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Search, TrendingUp, Star, Play, ArrowRight, Lock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const TEMPLATE_CATEGORIES = ['All', 'Trending', 'Cooking', 'Travel', 'Wedding', 'Fitness', 'Business', 'Pets'];

const TEMPLATES = [
  { id: '1', title: 'Cinematic Food Story', category: 'Cooking', mood: '🍳', uses: 12400, rating: 4.9, isPremium: false, trending: true, preview: 'from-orange-500/30 to-red-500/20' },
  { id: '2', title: 'Travel Montage Pro', category: 'Travel', mood: '✈️', uses: 9800, rating: 4.8, isPremium: true, trending: true, preview: 'from-blue-500/30 to-cyan-500/20' },
  { id: '3', title: 'Wedding Highlights', category: 'Wedding', mood: '💒', uses: 8200, rating: 4.9, isPremium: false, trending: false, preview: 'from-purple-500/30 to-pink-500/20' },
  { id: '4', title: 'Gym Motivation', category: 'Fitness', mood: '💪', uses: 7600, rating: 4.7, isPremium: false, trending: true, preview: 'from-green-500/30 to-emerald-500/20' },
  { id: '5', title: 'Café Ambience', category: 'Business', mood: '☕', uses: 6900, rating: 4.8, isPremium: true, trending: false, preview: 'from-amber-500/30 to-yellow-500/20' },
  { id: '6', title: 'Pet Memories', category: 'Pets', mood: '🐾', uses: 6200, rating: 4.9, isPremium: false, trending: false, preview: 'from-pink-500/30 to-rose-500/20' },
  { id: '7', title: 'Product Showcase', category: 'Business', mood: '📦', uses: 5800, rating: 4.6, isPremium: true, trending: false, preview: 'from-violet-500/30 to-purple-500/20' },
  { id: '8', title: 'Vlog Day in Life', category: 'Travel', mood: '🎬', uses: 5400, rating: 4.7, isPremium: false, trending: true, preview: 'from-indigo-500/30 to-blue-500/20' },
  { id: '9', title: 'Birthday Special', category: 'Cooking', mood: '🎂', uses: 4900, rating: 4.8, isPremium: false, trending: false, preview: 'from-yellow-500/30 to-orange-500/20' },
  { id: '10', title: 'Luxury Lifestyle', category: 'Business', mood: '✨', uses: 4600, rating: 4.9, isPremium: true, trending: true, preview: 'from-gold-500/30 to-amber-500/20' },
  { id: '11', title: 'Real Estate Tour', category: 'Business', mood: '🏠', uses: 4200, rating: 4.6, isPremium: true, trending: false, preview: 'from-slate-500/30 to-gray-500/20' },
  { id: '12', title: 'Sunset Travel', category: 'Travel', mood: '🌅', uses: 3900, rating: 4.8, isPremium: false, trending: false, preview: 'from-orange-400/30 to-pink-500/20' },
];

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = TEMPLATES.filter((t) => {
    const matchCat = activeCategory === 'All' || activeCategory === 'Trending' ? activeCategory === 'Trending' ? t.trending : true : t.category === activeCategory;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">StoryReel AI</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link href="/register"><Button variant="gradient" size="sm">Start Free</Button></Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 container space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="secondary"><TrendingUp className="h-3.5 w-3.5 mr-1" />Template Library</Badge>
          <h1 className="text-5xl font-bold text-white">50+ cinematic reel templates</h1>
          <p className="text-white/50 max-w-xl mx-auto">
            Start with a proven template. AI customizes it to your photos and style.
          </p>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="h-4 w-4" />} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat ? 'bg-violet-600 text-white' : 'glass text-white/60 hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card rounded-2xl overflow-hidden group cursor-pointer hover-lift"
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Preview */}
              <div className={`relative h-48 bg-gradient-to-br ${template.preview} flex items-center justify-center`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="text-5xl opacity-40">{template.mood}</div>

                {/* Overlay on hover */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${hoveredId === template.id ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="flex gap-2">
                    <Link href={`/register?template=${template.id}`}>
                      <Button variant="gradient" size="sm">
                        <Play className="h-3.5 w-3.5" />
                        Use Template
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {template.trending && <Badge variant="warning" className="text-[10px] px-1.5 py-0.5">🔥 Trending</Badge>}
                  {template.isPremium && <Badge variant="gold" className="text-[10px] px-1.5 py-0.5"><Lock className="h-2.5 w-2.5 mr-0.5" />Pro</Badge>}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-medium text-white text-sm">{template.title}</h3>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-white/40">{template.category}</span>
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Star className="h-3 w-3 fill-current" />
                    {template.rating}
                  </div>
                </div>
                <p className="text-xs text-white/25 mt-1">{template.uses.toLocaleString()} uses</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center glass-card rounded-3xl p-10 space-y-4">
          <h2 className="text-3xl font-bold text-white">Can't find the right template?</h2>
          <p className="text-white/50">Let AI create a custom template just for your content.</p>
          <Link href="/create">
            <Button variant="glow" size="lg">
              <Sparkles className="h-5 w-5" />
              Create From Scratch
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
