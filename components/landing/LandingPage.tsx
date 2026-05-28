'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles, Play, Zap, Star, ArrowRight, Check, ChevronDown,
  Upload, Wand2, Download, Share2, Film, Music, Mic, Type,
  TrendingUp, Camera, Video
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const CATEGORIES = [
  { icon: '🍳', label: 'Cooking', color: 'from-orange-500/20 to-red-500/20' },
  { icon: '✈️', label: 'Travel', color: 'from-blue-500/20 to-cyan-500/20' },
  { icon: '👶', label: 'Baby', color: 'from-pink-500/20 to-rose-500/20' },
  { icon: '💒', label: 'Wedding', color: 'from-purple-500/20 to-violet-500/20' },
  { icon: '🐾', label: 'Pets', color: 'from-amber-500/20 to-yellow-500/20' },
  { icon: '👗', label: 'Fashion', color: 'from-fuchsia-500/20 to-pink-500/20' },
  { icon: '☕', label: 'Café', color: 'from-stone-500/20 to-amber-500/20' },
  { icon: '💪', label: 'Fitness', color: 'from-green-500/20 to-emerald-500/20' },
  { icon: '🏠', label: 'Real Estate', color: 'from-slate-500/20 to-blue-500/20' },
  { icon: '🎂', label: 'Birthday', color: 'from-yellow-500/20 to-pink-500/20' },
  { icon: '✨', label: 'Luxury', color: 'from-amber-400/20 to-yellow-400/20' },
  { icon: '🎬', label: 'Vlog', color: 'from-violet-500/20 to-purple-500/20' },
];

const FEATURES = [
  { icon: Wand2, title: 'AI Story Director', description: 'AI understands your content and crafts an emotional storyline automatically.', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: Camera, title: 'Cinematic Camera Motion', description: 'Zoom, pan, parallax depth movement on static photos.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: Film, title: 'AI Transitions', description: 'Smoke, blur, beat sync, speed ramp — perfectly timed.', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { icon: Mic, title: 'AI Voiceover', description: 'Realistic narration in multiple accents and emotional tones.', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: Type, title: 'Auto Subtitles', description: 'Beautiful animated subtitles timed perfectly to your reel.', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { icon: TrendingUp, title: 'Viral Hook Engine', description: 'AI-generated hooks, captions, CTAs, and trending hashtags.', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Music, title: 'AI Music Matching', description: 'Smart music based on mood, pacing, and category.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Share2, title: 'Direct Posting', description: 'Post directly to Instagram, TikTok, YouTube, WhatsApp.', color: 'text-rose-400', bg: 'bg-rose-500/10' },
];

const STEPS = [
  { step: '01', title: 'Upload Your Content', desc: 'Drop photos and videos — cooking, travel, baby moments, whatever you love.', icon: Upload },
  { step: '02', title: 'Pick Style & Mood', desc: 'Choose from 16 categories and 11 moods. Cinematic, viral, dreamy...', icon: Sparkles },
  { step: '03', title: 'AI Directs Your Reel', desc: 'AI adds motion, voiceover, music, subtitles, and transitions.', icon: Wand2 },
  { step: '04', title: 'Export & Share', desc: 'Download in 9:16 format for Instagram, TikTok, YouTube Shorts.', icon: Share2 },
];

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Food Blogger', avatar: '👩‍🍳', text: '"I uploaded cooking photos and StoryReel AI made a reel that got 2M views. I literally cried. It was that beautiful."', rating: 5 },
  { name: 'Rahul K.', role: 'Travel Creator', avatar: '🧳', text: '"My travel reels used to take 4 hours. Now I get cinematic results in 3 minutes. The AI understands storytelling better than I do."', rating: 5 },
  { name: 'Priya A.', role: 'Wedding Photographer', avatar: '💍', text: '"My clients are OBSESSED. I deliver wedding highlight reels same-day now. My business completely transformed."', rating: 5 },
  { name: 'Jake L.', role: 'Gym Owner', avatar: '💪', text: '"Our gym Instagram went from 1K to 50K followers in 3 months. Reels look like we have a full production team."', rating: 5 },
  { name: 'Meera S.', role: 'Café Owner', avatar: '☕', text: '"I run a small café, had zero social presence. Now my reels go viral every week and tables are fully booked."', rating: 5 },
  { name: 'David C.', role: 'Real Estate Agent', avatar: '🏠', text: '"Property tours that cost $500 to produce now take 2 minutes. Every listing gets hundreds of inquiries."', rating: 5 },
];

const PLANS = [
  { name: 'Free', price: '$0', period: 'forever', description: 'Perfect to get started', features: ['3 reels/month', 'SD quality', 'Watermark', 'Basic templates', 'Instagram & TikTok'], cta: 'Start Free', href: '/register', highlighted: false },
  { name: 'Pro', price: '$19', period: '/month', description: 'For serious creators', features: ['Unlimited reels', 'HD quality', 'No watermark', 'All templates', 'AI voiceover', 'Auto subtitles', 'All platforms', 'Priority render'], cta: 'Start Pro', href: '/register?plan=pro', highlighted: true, badge: 'Most Popular' },
  { name: 'Business', price: '$49', period: '/month', description: 'For teams & brands', features: ['Everything in Pro', '4K quality', 'Team collaboration', 'Brand kits', 'Analytics', 'Multiple workspaces', 'API access', 'Priority support'], cta: 'Start Business', href: '/register?plan=business', highlighted: false },
];

const FAQS = [
  { q: 'Do I need video editing skills?', a: 'Zero skills needed. Upload photos, pick a style, and AI does everything — script, transitions, voiceover, music, subtitles. Ready in minutes.' },
  { q: 'What content types work best?', a: 'Anything visual! Cooking, travel, weddings, pets, fashion, fitness, cafés, real estate — all 16 categories are optimized with AI storytelling.' },
  { q: 'How long does it take?', a: 'Most reels generate in 2–5 minutes. Complex 60-second reels with voiceover may take up to 10 minutes. Pro users get priority rendering.' },
  { q: 'Can I post directly to Instagram and TikTok?', a: 'Yes! Post directly to Instagram, TikTok, YouTube Shorts, and WhatsApp without leaving the app.' },
  { q: 'Is there a free plan?', a: 'Yes! The free plan lets you create 3 reels/month with a watermark. Perfect for trying it out.' },
  { q: 'Can I use my own music?', a: 'Absolutely. Upload custom audio or choose from AI-suggested music based on your content mood.' },
];

const STATS = [
  { value: '2M+', label: 'Reels Created' },
  { value: '150K+', label: 'Creators' },
  { value: '98%', label: 'Satisfaction' },
  { value: '4.9/5', label: 'App Rating' },
];

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setActiveCategory((p) => (p + 1) % CATEGORIES.length), 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">StoryReel AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Templates', 'Showcase', 'Pricing'].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="text-sm text-white/60 hover:text-white transition-colors">{item}</Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link href="/register">
              <Button variant="gradient" size="sm">
                Start Free <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 pb-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl animate-blob animate-delay-300" />
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl animate-blob animate-delay-700" />
        <div className="container relative z-10">
          <div className="text-center max-w-5xl mx-auto space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge variant="default" className="mb-6 px-4 py-2 text-sm">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                AI Story Director for the modern creator
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] text-balance">
                Turn memories into{' '}
                <span className="gradient-text">cinematic stories</span>
                {' '}with AI
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                Upload photos. Let AI direct your reel. No editing skills needed.
                Get viral-ready vertical videos for Instagram, TikTok, YouTube Shorts.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button variant="glow" size="xl" className="group w-full sm:w-auto">
                  <Sparkles className="h-5 w-5" />
                  Create Your First Reel Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="glass" size="xl" className="w-full sm:w-auto">
                <Play className="h-5 w-5 fill-current" />
                Watch Demo
              </Button>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm text-white/30">
              Free forever • No credit card needed • 3 reels/month
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/8">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-white/40 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* App preview */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="mt-16">
            <div className="glass-card rounded-3xl p-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white/60"><Upload className="h-4 w-4 text-violet-400" />Upload Photos</div>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.slice(0, 4).map((cat, i) => (
                      <div key={i} className={`aspect-square rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl border border-white/10`}>{cat.icon}</div>
                    ))}
                  </div>
                  <div className="text-xs text-white/30 text-center">Drag & drop or click</div>
                </div>
                <div className="glass rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white/60"><Wand2 className="h-4 w-4 text-pink-400 animate-pulse" />AI Directing...</div>
                  <div className="space-y-3">
                    {['Analyzing content', 'Writing story', 'Adding voiceover', 'Syncing music', 'Rendering reel'].map((step, i) => (
                      <div key={step} className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${i < 3 ? 'bg-violet-400' : 'bg-white/20'}`} />
                        <span className={`text-xs ${i < 3 ? 'text-white/70' : 'text-white/25'}`}>{step}</span>
                        {i < 3 && <Check className="h-3 w-3 text-green-400 ml-auto" />}
                      </div>
                    ))}
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10">
                    <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 animate-pulse" />
                  </div>
                </div>
                <div className="glass rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-white/60"><Video className="h-4 w-4 text-green-400" />Your Reel Ready!</div>
                  <div className="flex justify-center">
                    <div className="w-[86px] aspect-[9/16] rounded-xl bg-gradient-to-br from-violet-900/50 to-purple-900/50 border border-violet-500/20 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                      <Sparkles className="h-6 w-6 text-violet-400 animate-pulse relative z-10" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="h-1 bg-white/20 rounded-full"><div className="h-full w-2/3 bg-violet-400 rounded-full" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="gradient" size="sm" className="flex-1 text-xs"><Download className="h-3 w-3" />Export</Button>
                    <Button variant="glass" size="icon-sm"><Share2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">How it works</Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            From photos to viral reel in <span className="gradient-text">3 minutes</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div key={step.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }} className="glass-card rounded-2xl p-6 relative hover-lift group">
              <div className="absolute top-4 right-4 text-5xl font-black text-white/5 select-none">{step.step}</div>
              <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4 group-hover:bg-violet-500/30 transition-colors">
                <step.icon className="h-6 w-6 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
              {i < STEPS.length - 1 && <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-white/20 z-10" />}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white/[0.015]">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Killer Features</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Everything you need to go viral</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }} viewport={{ once: true }} className="glass-card rounded-2xl p-5 hover-lift group">
                <div className={`h-10 w-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-white text-sm mb-2">{feature.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">16 Content Categories</Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Works for every <span className="gradient-text">type of creator</span>
          </h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat, i) => (
            <motion.button key={cat.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: i * 0.03 }} viewport={{ once: true }} whileHover={{ scale: 1.05 }}
              className={`glass-card rounded-2xl p-4 text-center transition-all ${activeCategory === i ? 'border-violet-500/40 bg-violet-500/10' : ''}`}
              onClick={() => setActiveCategory(i)}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-xs text-white/60 font-medium">{cat.label}</div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white/[0.015]">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Creator Love</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Creators are obsessed</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }} viewport={{ once: true }} className="glass-card rounded-2xl p-6 hover-lift">
                <div className="flex gap-1 mb-4">{[...Array(t.rating)].map((_, j) => <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-violet-600/20 flex items-center justify-center text-xl">{t.avatar}</div>
                  <div><div className="text-sm font-medium text-white">{t.name}</div><div className="text-xs text-white/40">{t.role}</div></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 container" id="pricing">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">Start free. Scale when you grow.</h2>
          <p className="mt-4 text-white/50">No long-term contracts. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }} viewport={{ once: true }}
              className={`relative rounded-2xl p-6 ${plan.highlighted ? 'bg-gradient-to-b from-violet-600/20 to-purple-600/10 border-2 border-violet-500/40 shadow-[0_0_40px_rgba(139,92,246,0.3)]' : 'glass-card'}`}
            >
              {plan.badge && <Badge variant="pro" className="absolute -top-3 left-1/2 -translate-x-1/2">{plan.badge}</Badge>}
              <div className="mb-4"><div className="text-lg font-bold text-white">{plan.name}</div><div className="text-white/50 text-sm">{plan.description}</div></div>
              <div className="mb-6"><span className="text-4xl font-black text-white">{plan.price}</span><span className="text-white/40 text-sm">{plan.period}</span></div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60"><Check className="h-4 w-4 text-green-400 shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href={plan.href}><Button variant={plan.highlighted ? 'gradient' : 'outline'} className="w-full">{plan.cta}</Button></Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white/[0.015]">
        <div className="container max-w-3xl">
          <div className="text-center mb-16"><h2 className="text-4xl font-bold text-white">Frequently Asked Questions</h2></div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }} viewport={{ once: true }} className="glass-card rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-medium text-white text-sm">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-white/40 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-sm text-white/50 leading-relaxed border-t border-white/5 pt-4">{faq.a}</div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 container text-center">
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl" />
          <div className="relative glass-card rounded-3xl p-12 space-y-8">
            <div className="text-6xl">✨</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">Ready to create your first cinematic reel?</h2>
            <p className="text-white/50 text-lg">Join 150,000+ creators making viral reels with AI.</p>
            <Link href="/register">
              <Button variant="glow" size="xl" className="group mx-auto">
                <Sparkles className="h-5 w-5" />Start Creating Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-sm text-white/25">No credit card needed • 3 free reels/month forever</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center"><Sparkles className="h-4 w-4 text-white" /></div>
                <span className="font-bold text-white">StoryReel AI</span>
              </div>
              <p className="text-sm text-white/40 max-w-xs leading-relaxed">The AI Story Director for modern creators. Turn any photos into cinematic vertical reels.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Templates', 'Showcase', 'Pricing'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Support', links: ['Help Center', 'Privacy', 'Terms', 'Security'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-white mb-4">{col.title}</h4>
                <div className="space-y-2">
                  {col.links.map((l) => (
                    <Link key={l} href={`/${l.toLowerCase().replace(' ', '-')}`} className="block text-sm text-white/40 hover:text-white/70 transition-colors">{l}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/25">© 2025 StoryReel AI. All rights reserved.</p>
            <p className="text-sm text-white/25">Made with ❤️ for creators worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
