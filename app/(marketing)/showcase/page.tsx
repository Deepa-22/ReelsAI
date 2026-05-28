import Link from 'next/link';
import { Sparkles, Play, Heart, Eye, Share2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SHOWCASE_REELS = [
  { id: '1', title: 'Summer in Santorini', creator: 'Maria K.', category: 'Travel', mood: '✈️', views: '2.1M', likes: '148K', preview: 'from-blue-500/30 to-cyan-400/20', duration: '30s' },
  { id: '2', title: 'The Perfect Pasta', creator: 'Chef Marco', category: 'Cooking', mood: '🍳', views: '1.8M', likes: '122K', preview: 'from-orange-500/30 to-red-400/20', duration: '45s' },
  { id: '3', title: 'Luna & Me', creator: 'Sophie R.', category: 'Pets', mood: '🐾', views: '1.5M', likes: '98K', preview: 'from-pink-500/30 to-rose-400/20', duration: '30s' },
  { id: '4', title: 'Wedding Day Magic', creator: 'The Johnsons', category: 'Wedding', mood: '💒', views: '1.2M', likes: '87K', preview: 'from-purple-500/30 to-violet-400/20', duration: '60s' },
  { id: '5', title: 'Morning Gym Flow', creator: 'Jake Fitness', category: 'Fitness', mood: '💪', views: '980K', likes: '67K', preview: 'from-green-500/30 to-emerald-400/20', duration: '15s' },
  { id: '6', title: 'Café Mornings', creator: 'Bean & Brew', category: 'Business', mood: '☕', views: '850K', likes: '58K', preview: 'from-amber-500/30 to-yellow-400/20', duration: '30s' },
  { id: '7', title: 'Baby First Steps', creator: 'The Patels', category: 'Baby', mood: '👶', views: '720K', likes: '54K', preview: 'from-teal-500/30 to-cyan-400/20', duration: '30s' },
  { id: '8', title: 'OOTD Minimalist', creator: 'StyleByAna', category: 'Fashion', mood: '👗', views: '680K', likes: '49K', preview: 'from-slate-500/30 to-gray-400/20', duration: '15s' },
];

export default function ShowcasePage() {
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
          <Badge variant="secondary">Creator Showcase</Badge>
          <h1 className="text-5xl font-bold text-white">
            Reels that went viral with{' '}
            <span className="gradient-text">StoryReel AI</span>
          </h1>
          <p className="text-white/50 max-w-xl mx-auto">
            See what 150,000+ creators made with zero editing skills.
          </p>
          <div className="flex gap-4 justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">2M+</div>
              <div className="text-xs text-white/40">Reels Created</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">500M+</div>
              <div className="text-xs text-white/40">Total Views</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">98%</div>
              <div className="text-xs text-white/40">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Showcase grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {SHOWCASE_REELS.map((reel, i) => (
            <div key={reel.id} className="glass-card rounded-2xl overflow-hidden group hover-lift cursor-pointer">
              {/* Reel preview (vertical) */}
              <div className={`relative aspect-[9/16] bg-gradient-to-br ${reel.preview} flex items-center justify-center`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="text-6xl opacity-30">{reel.mood}</div>

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="h-7 w-7 text-white fill-current" />
                  </div>
                </div>

                {/* Duration badge */}
                <div className="absolute top-2 right-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-black/50 text-white/70">{reel.duration}</span>
                </div>

                {/* Stats at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-semibold text-sm leading-tight">{reel.title}</p>
                  <p className="text-white/60 text-xs mt-0.5">by {reel.creator}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-white/60"><Eye className="h-3 w-3" />{reel.views}</span>
                    <span className="flex items-center gap-1 text-xs text-rose-300"><Heart className="h-3 w-3 fill-current" />{reel.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center glass-card rounded-3xl p-12 space-y-6">
          <div className="text-5xl">🎬</div>
          <h2 className="text-3xl font-bold text-white">Create your viral reel today</h2>
          <p className="text-white/50">Join the creators going viral with StoryReel AI.</p>
          <Link href="/register">
            <Button variant="glow" size="xl" className="group mx-auto">
              <Sparkles className="h-5 w-5" />
              Start Creating Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
