'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Palette, Image as ImageIcon, FileText, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

const BRAND_COLORS = [
  { name: 'Soft Rose',  hex: '#E8A0B7', role: 'Primary',   useFor: 'Brand accents, CTAs, buttons' },
  { name: 'Warm Cream', hex: '#F5E6D8', role: 'Secondary', useFor: 'Backgrounds, calm sections' },
  { name: 'Aubergine',  hex: '#3D1F2E', role: 'Deep',      useFor: 'Headers, contrast text' },
  { name: 'Sage',       hex: '#A8B9A0', role: 'Wellness',  useFor: 'Healing imagery, accents' },
  { name: 'Soft White', hex: '#FAF7F4', role: 'Base',      useFor: 'Main backgrounds' },
  { name: 'Charcoal',   hex: '#1A1416', role: 'Text',      useFor: 'Body text on light bg' },
];

const ASSETS = [
  {
    name: 'YouTube Channel Banner',
    desc: '2560 × 1440 px — ready to upload to YouTube Studio',
    file: '/branding/honest-hormones/honest-hormones-banner.svg',
    aspect: '16/9',
  },
  {
    name: 'Profile Picture (circular)',
    desc: '1080 × 1080 px — Instagram, TikTok, X, YouTube',
    file: '/branding/honest-hormones/honest-hormones-profile.svg',
    aspect: '1/1',
    circle: true,
  },
  {
    name: 'Wordmark Square',
    desc: '1080 × 1080 px — alternative square logo for posts',
    file: '/branding/honest-hormones/honest-hormones-wordmark-square.svg',
    aspect: '1/1',
  },
  {
    name: 'Palette Reference',
    desc: 'For your designer / brand pitch deck',
    file: '/branding/honest-hormones/palette.svg',
    aspect: '12/5',
  },
];

const CAPTION_TEMPLATE = `Today's story: [Story Title]

[2-3 sentence raw description matching the reel]

If you felt this — drop a 🌸 below.
Save this for the next time you forget you're not alone.

#PMOS #PCOS #hormonalhealth #womenshealth #shorts`;

export default function BrandingPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied! ✨');
    setTimeout(() => setCopied(null), 1500);
  };

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-glow"
             style={{ background: 'linear-gradient(135deg, #E8A0B7, #f9c2d3)' }}>
          <Palette className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Honest Hormones — Brand Kit</h1>
            <Badge variant="pro" className="text-[10px]">READY</Badge>
          </div>
          <p className="text-sm text-white/40 mt-0.5">Everything you need to launch your YouTube + Instagram + TikTok</p>
        </div>
      </div>

      {/* Brand essence */}
      <div className="glass-card rounded-2xl p-5 space-y-3" style={{
        background: 'linear-gradient(135deg, rgba(232,160,183,0.10), rgba(168,185,160,0.06))',
        border: '1px solid rgba(232,160,183,0.3)',
      }}>
        <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">Brand essence</div>
        <h2 className="text-2xl font-serif text-white italic">"Real stories. Real hormones. Honestly."</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-pink-300 font-medium mb-1">Voice</div>
            <ul className="text-white/65 space-y-1 text-xs">
              <li>• Warm, vulnerable, never preachy</li>
              <li>• Talks like a friend who's been there</li>
              <li>• Uses "I" and "we" — never "you should"</li>
              <li>• Medically accurate but jargon-free</li>
            </ul>
          </div>
          <div>
            <div className="text-pink-300 font-medium mb-1">Niche</div>
            <p className="text-white/65 text-xs">
              Women's hormonal health journey — PMOS (formerly PCOS), thyroid, perimenopause, hormonal mental health.
            </p>
          </div>
        </div>
      </div>

      {/* Color palette */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Color Palette</h3>
            <p className="text-xs text-white/40">Click any color to copy its hex code</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {BRAND_COLORS.map((c) => (
            <motion.button
              key={c.hex}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => copy(c.hex, c.name)}
              className="group rounded-xl overflow-hidden glass border border-white/8 hover:border-white/20 transition-all text-left"
            >
              <div className="h-20 relative" style={{ background: c.hex }}>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {copied === c.name
                    ? <Check className="h-5 w-5 text-white drop-shadow-lg" />
                    : <Copy className="h-5 w-5 text-white drop-shadow-lg" />}
                </div>
              </div>
              <div className="p-2.5">
                <div className="text-xs font-semibold text-white">{c.name}</div>
                <div className="text-[10px] text-white/50 mt-0.5">{c.hex}</div>
                <div className="text-[10px] text-pink-300 mt-1">{c.role}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Visual assets */}
      <div className="space-y-3">
        <h3 className="font-semibold text-white">Visual Assets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ASSETS.map((a) => (
            <motion.div key={a.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl overflow-hidden">
              <div className="relative bg-[#FAF7F4] flex items-center justify-center p-4" style={{ aspectRatio: a.aspect }}>
                <img
                  src={a.file}
                  alt={a.name}
                  className={`max-w-full max-h-full object-contain ${a.circle ? 'rounded-full' : ''}`}
                  style={a.circle ? { aspectRatio: '1/1' } : undefined}
                />
              </div>
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white">{a.name}</div>
                  <div className="text-xs text-white/40 truncate">{a.desc}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a href={a.file} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="icon-sm" title="Open in new tab"><ExternalLink className="h-3.5 w-3.5" /></Button>
                  </a>
                  <Button variant="outline" size="sm" onClick={() => downloadFile(a.file, a.file.split('/').pop()!)}>
                    <Download className="h-3.5 w-3.5" />SVG
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Caption template */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Caption Template</h3>
            <p className="text-xs text-white/40">Copy-paste structure for daily posts</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => copy(CAPTION_TEMPLATE, 'caption')}>
            {copied === 'caption' ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            Copy
          </Button>
        </div>
        <pre className="text-xs text-white/70 bg-white/5 rounded-xl p-4 whitespace-pre-wrap font-mono leading-relaxed">{CAPTION_TEMPLATE}</pre>
      </div>

      {/* Typography */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-white">Typography</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FAF7F4] rounded-xl p-4 text-[#3D1F2E]">
            <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Display</div>
            <div className="text-2xl" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500 }}>
              honest hormones
            </div>
            <div className="text-[10px] opacity-60 mt-2">Cormorant Garamond — Medium 500</div>
          </div>
          <div className="bg-[#FAF7F4] rounded-xl p-4 text-[#3D1F2E]">
            <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Body</div>
            <div className="text-base" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Real stories. Real hormones.
            </div>
            <div className="text-[10px] opacity-60 mt-2">Inter — 400-500</div>
          </div>
          <div className="bg-[#FAF7F4] rounded-xl p-4 text-[#3D1F2E]">
            <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Accent</div>
            <div className="text-xl italic" style={{ fontFamily: 'Caveat, cursive' }}>
              you are not alone 🌸
            </div>
            <div className="text-[10px] opacity-60 mt-2">Caveat — Handwritten</div>
          </div>
        </div>
      </div>

      {/* Brand promise */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-white">What this brand promises viewers</h3>
        <ol className="space-y-2 text-sm text-white/70">
          <li className="flex gap-3"><span className="text-pink-300 font-bold">1.</span> Honesty over Instagram aesthetics — we show the bad days</li>
          <li className="flex gap-3"><span className="text-pink-300 font-bold">2.</span> Medical accuracy — no diet-culture lies, no MLM supplements</li>
          <li className="flex gap-3"><span className="text-pink-300 font-bold">3.</span> Indian context first — meals, doctors, families that look like ours</li>
          <li className="flex gap-3"><span className="text-pink-300 font-bold">4.</span> Daily presence — 1 Short every day, no exceptions, no perfection</li>
          <li className="flex gap-3"><span className="text-pink-300 font-bold">5.</span> You are not alone — every story ends with this feeling</li>
        </ol>
      </div>
    </div>
  );
}
