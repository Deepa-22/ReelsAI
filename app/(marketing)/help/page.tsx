'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Search, ChevronDown, MessageCircle, Book, Video, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = [
  { icon: '🚀', title: 'Getting Started', count: 12, articles: ['How to create your first reel', 'Uploading photos & videos', 'Choosing categories and moods', 'Understanding the reel creation flow'] },
  { icon: '🎬', title: 'Creating Reels', count: 18, articles: ['AI story generation explained', 'Customizing voiceover settings', 'Music and transitions guide', 'Subtitle customization'] },
  { icon: '💳', title: 'Billing & Plans', count: 8, articles: ['Free vs Pro comparison', 'How to upgrade your plan', 'Cancel subscription', 'Billing FAQ'] },
  { icon: '📱', title: 'Export & Sharing', count: 10, articles: ['Exporting for Instagram Reels', 'Exporting for TikTok', 'Direct posting setup', 'Supported file formats'] },
  { icon: '⚙️', title: 'Account & Settings', count: 7, articles: ['Setting up your profile', 'Brand kit setup', 'Team management', 'API access guide'] },
  { icon: '🔧', title: 'Troubleshooting', count: 15, articles: ['Reel stuck on processing', 'Upload errors explained', 'Audio sync issues', 'Export quality issues'] },
];

const FAQS = [
  { q: 'How does StoryReel AI work?', a: 'Upload your photos or videos, choose a content category and mood, and AI automatically creates a cinematic reel with transitions, voiceover, subtitles, and music.' },
  { q: 'What file formats are supported?', a: 'We support JPG, PNG, WEBP, GIF images and MP4, MOV, WEBM videos up to 100MB per file.' },
  { q: 'How long does rendering take?', a: 'Most reels render in 2-5 minutes. Complex 60-second reels with voiceover may take up to 10 minutes. Pro users get priority rendering queues.' },
  { q: 'Can I edit the AI-generated script?', a: 'Yes! After AI generates your reel, you can edit the script, adjust timing, change voiceover settings, swap music, and more before final export.' },
  { q: 'Does the free plan have a watermark?', a: 'Yes, free plan exports include a StoryReel AI watermark. Upgrade to Pro to remove it.' },
  { q: 'Can I post directly to social media?', a: 'Yes, Pro users can post directly to Instagram, TikTok, YouTube Shorts, and WhatsApp without downloading first.' },
  { q: 'Is there an API available?', a: 'Yes, Business and Enterprise plans include API access. See our API documentation for integration guides.' },
  { q: 'What happens if I exceed my plan limits?', a: 'Free users who exceed 3 reels/month will be asked to upgrade. We never delete your projects.' },
];

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            <Link href="/dashboard"><Button variant="ghost" size="sm">Dashboard</Button></Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 space-y-16">
        {/* Hero */}
        <div className="container text-center space-y-6">
          <h1 className="text-5xl font-bold text-white">How can we help?</h1>
          <div className="max-w-xl mx-auto">
            <Input
              placeholder="Search articles, guides, and FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-5 w-5" />}
              className="h-14 text-base rounded-2xl"
            />
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            {['Creating reels', 'Export formats', 'Billing', 'AI settings', 'Direct posting'].map((tag) => (
              <button key={tag} className="px-3 py-1.5 rounded-full glass text-sm text-white/60 hover:text-white transition-colors">
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.title} className="glass-card rounded-2xl p-5 hover-lift cursor-pointer hover:border-violet-500/30 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white">{cat.title}</h3>
                    <p className="text-xs text-white/40">{cat.count} articles</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {cat.articles.map((article) => (
                    <li key={article} className="text-sm text-white/50 hover:text-white/80 transition-colors cursor-pointer">
                      → {article}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="container max-w-3xl space-y-4">
          <h2 className="text-3xl font-bold text-white mb-8">Popular Questions</h2>
          {FAQS.map((faq, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="font-medium text-white text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-white/40 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-white/50 leading-relaxed border-t border-white/5 pt-4">{faq.a}</div>
              )}
            </div>
          ))}
        </div>

        {/* Contact options */}
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: MessageCircle, title: 'Live Chat', desc: 'Chat with our team in real time', cta: 'Start Chat', available: true },
              { icon: Mail, title: 'Email Support', desc: 'Get a reply within 24 hours', cta: 'Send Email', available: true },
              { icon: Video, title: 'Video Tutorial', desc: 'Watch step-by-step guides', cta: 'Watch Now', available: true },
            ].map((option) => (
              <div key={option.title} className="glass-card rounded-2xl p-6 text-center hover-lift">
                <div className="h-12 w-12 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                  <option.icon className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">{option.title}</h3>
                <p className="text-sm text-white/40 mb-4">{option.desc}</p>
                <Button variant="outline" size="sm">{option.cta}</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
