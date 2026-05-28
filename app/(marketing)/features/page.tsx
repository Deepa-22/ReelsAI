import Link from 'next/link';
import { Sparkles, Wand2, Camera, Film, Mic, Type, TrendingUp, Music, Share2, Star, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FEATURES = [
  {
    icon: Wand2,
    title: 'AI Story Director',
    description: 'Our AI analyzes your photos and creates a complete emotional storyline — scene ordering, pacing, narrative arc, and emotional climax — automatically.',
    points: ['Scene-by-scene story structure', 'Emotional pacing optimization', 'Genre-specific storytelling', 'Hook-driven narrative design'],
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    demo: 'from-violet-600/20 to-purple-600/10',
  },
  {
    icon: Camera,
    title: 'Cinematic Camera Motion',
    description: 'Transform static photos into dynamic cinematic sequences using AI-powered fake camera movement — zoom, pan, parallax, and depth effects.',
    points: ['Ken Burns effect on photos', 'Parallax depth movement', '3D perspective simulation', 'Cinematic slow motion'],
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    demo: 'from-blue-600/20 to-cyan-600/10',
  },
  {
    icon: Film,
    title: 'AI Scene Transitions',
    description: 'Generate smooth, cinematic transitions between scenes automatically — from smoke and blur effects to beat-synced cuts and speed ramps.',
    points: ['20+ transition styles', 'Beat-synchronized cuts', 'Speed ramp effects', 'Smooth crossfades'],
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    demo: 'from-pink-600/20 to-rose-600/10',
  },
  {
    icon: Mic,
    title: 'AI Voiceover Generation',
    description: 'Generate natural, emotional voiceover narration using ElevenLabs AI voices — multiple accents, genders, and emotional styles.',
    points: ['8+ realistic AI voices', 'Multiple accents & languages', 'Emotional tone control', 'Script auto-optimization'],
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    demo: 'from-green-600/20 to-emerald-600/10',
  },
  {
    icon: Type,
    title: 'Auto Animated Subtitles',
    description: 'Beautiful animated subtitles generated and perfectly timed to your audio — word-by-word highlighting, multiple styles, and social-ready formatting.',
    points: ['Word-level timing sync', '10+ animation styles', 'Auto font pairing', 'Custom positioning'],
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    demo: 'from-yellow-600/20 to-amber-600/10',
  },
  {
    icon: TrendingUp,
    title: 'Viral Hook Engine',
    description: 'AI generates scroll-stopping opening lines, captions, and CTAs specifically optimized for Instagram and TikTok virality patterns.',
    points: ['Trend analysis engine', 'Platform-specific optimization', 'A/B hook variations', 'Hashtag optimization'],
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    demo: 'from-orange-600/20 to-red-600/10',
  },
  {
    icon: Music,
    title: 'AI Music Matching',
    description: 'Automatically match background music to your content mood, pacing, and category from a library of licensed tracks.',
    points: ['Mood-based matching', 'BPM-to-pacing sync', '500+ licensed tracks', 'Custom audio upload'],
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    demo: 'from-cyan-600/20 to-blue-600/10',
  },
  {
    icon: Star,
    title: 'Virality Score Engine',
    description: 'Get AI-powered predictions of your reel\'s viral potential before posting, with specific improvement suggestions.',
    points: ['0-100 virality score', 'Hook strength analysis', 'Engagement prediction', 'Optimization suggestions'],
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    demo: 'from-amber-600/20 to-yellow-600/10',
  },
];

export default function FeaturesPage() {
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

      <div className="pt-24 pb-16 container space-y-20">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="secondary">Features</Badge>
          <h1 className="text-5xl font-bold text-white leading-tight">
            15 AI features. Zero editing skills needed.
          </h1>
          <p className="text-white/50 text-lg">
            Everything you need to create cinematic, viral-ready reels — all AI-powered, all automatic.
          </p>
          <Link href="/register">
            <Button variant="glow" size="lg">
              Try All Features Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="space-y-16">
          {FEATURES.map((feature, i) => (
            <div key={feature.title} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
              {/* Demo visual */}
              <div className="lg:w-1/2">
                <div className={`glass-card rounded-3xl p-8 bg-gradient-to-br ${feature.demo} aspect-video flex items-center justify-center`}>
                  <div className={`h-20 w-20 rounded-3xl ${feature.bg} flex items-center justify-center`}>
                    <feature.icon className={`h-10 w-10 ${feature.color}`} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="lg:w-1/2 space-y-6">
                <div>
                  <div className={`inline-flex h-12 w-12 rounded-2xl ${feature.bg} items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h2 className="text-3xl font-bold text-white">{feature.title}</h2>
                  <p className="text-white/50 mt-3 leading-relaxed">{feature.description}</p>
                </div>
                <ul className="space-y-3">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-center gap-3 text-white/70">
                      <div className={`h-2 w-2 rounded-full ${feature.color.replace('text-', 'bg-')} shrink-0`} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="text-center glass-card rounded-3xl p-12 space-y-6">
          <h2 className="text-4xl font-bold text-white">Start using all 15 features free</h2>
          <p className="text-white/50">No credit card needed. 3 reels free every month, forever.</p>
          <Link href="/register">
            <Button variant="glow" size="xl">
              <Sparkles className="h-5 w-5" />
              Create Your First Reel
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
