'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wand2, Sparkles, Mic, Music, Type, Film, Camera, TrendingUp,
  Palette, Zap, Play, ChevronRight, Star, RefreshCw, Copy, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import toast from 'react-hot-toast';

const AI_TOOLS = [
  { id: 'script', icon: Type, title: 'Story Script Generator', desc: 'Generate viral scripts for any content type', color: 'text-violet-400', bg: 'bg-violet-500/10', badge: null },
  { id: 'hook', icon: TrendingUp, title: 'Viral Hook Engine', desc: 'Create attention-grabbing opening lines', color: 'text-orange-400', bg: 'bg-orange-500/10', badge: '🔥 Popular' },
  { id: 'caption', icon: Sparkles, title: 'Caption Generator', desc: 'Instagram & TikTok captions with hashtags', color: 'text-pink-400', bg: 'bg-pink-500/10', badge: null },
  { id: 'voice', icon: Mic, title: 'Voice Customizer', desc: 'Preview and customize AI voiceover styles', color: 'text-green-400', bg: 'bg-green-500/10', badge: 'Pro' },
  { id: 'music', icon: Music, title: 'Music Mood Matcher', desc: 'Find perfect background music by vibe', color: 'text-blue-400', bg: 'bg-blue-500/10', badge: null },
  { id: 'transitions', icon: Film, title: 'Transition Library', desc: 'Preview all cinematic transition styles', color: 'text-cyan-400', bg: 'bg-cyan-500/10', badge: null },
  { id: 'color', icon: Palette, title: 'Color Grading', desc: 'Apply cinematic color grades to your reels', color: 'text-amber-400', bg: 'bg-amber-500/10', badge: 'Pro' },
  { id: 'score', icon: Star, title: 'Virality Scorer', desc: 'Get AI-powered virality predictions', color: 'text-rose-400', bg: 'bg-rose-500/10', badge: 'New' },
];

const GENERATED_HOOKS = [
  "POV: You spent 5 minutes making this instead of 5 hours 👀",
  "I never thought THESE photos could look this cinematic...",
  "Wait for the ending — this is insane 🔥",
  "The AI understood the assignment PERFECTLY",
];

export default function AIStudioPage() {
  const [activeTool, setActiveTool] = useState('hook');
  const [generating, setGenerating] = useState(false);
  const [hooks, setHooks] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [category, setCategory] = useState('TRAVEL');
  const [mood, setMood] = useState('VIRAL');

  const generateHooks = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setHooks(GENERATED_HOOKS);
    setGenerating(false);
    toast.success('4 viral hooks generated!');
  };

  const copyHook = (hook: string) => {
    navigator.clipboard.writeText(hook);
    setCopied(hook);
    toast.success('Copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Studio</h1>
          <p className="text-white/40 text-sm mt-1">Advanced AI tools to supercharge your content</p>
        </div>
        <Badge variant="default" className="text-sm px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Powered by GPT-4o
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tools list */}
        <div className="space-y-2">
          {AI_TOOLS.map((tool) => (
            <motion.button
              key={tool.id}
              whileHover={{ x: 4 }}
              onClick={() => setActiveTool(tool.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                activeTool === tool.id ? 'glass-card border-violet-500/40' : 'hover:bg-white/5'
              }`}
            >
              <div className={`h-9 w-9 rounded-xl ${tool.bg} flex items-center justify-center shrink-0`}>
                <tool.icon className={`h-4.5 w-4.5 ${tool.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{tool.title}</div>
                <div className="text-xs text-white/40 truncate">{tool.desc}</div>
              </div>
              {tool.badge && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 shrink-0">
                  {tool.badge}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Active tool workspace */}
        <div className="lg:col-span-2 space-y-4">
          {activeTool === 'hook' && (
            <motion.div key="hook" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Card className="p-6 space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white">Viral Hook Engine</h3>
                  <p className="text-white/40 text-sm mt-1">Generate attention-grabbing first lines for your reels</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/50 font-medium">Content Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRAVEL">✈️ Travel</SelectItem>
                        <SelectItem value="COOKING">🍳 Cooking</SelectItem>
                        <SelectItem value="FITNESS">💪 Fitness</SelectItem>
                        <SelectItem value="PETS">🐾 Pets</SelectItem>
                        <SelectItem value="WEDDING">💒 Wedding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/50 font-medium">Mood / Style</label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIRAL">🔥 Viral</SelectItem>
                        <SelectItem value="EMOTIONAL">💝 Emotional</SelectItem>
                        <SelectItem value="CINEMATIC">🎥 Cinematic</SelectItem>
                        <SelectItem value="FUNNY">😂 Funny</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button variant="gradient" className="w-full" onClick={generateHooks} loading={generating}>
                  <Wand2 className="h-4 w-4" />
                  {generating ? 'Generating...' : 'Generate 4 Viral Hooks'}
                </Button>
              </Card>

              {hooks.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/60">Generated Hooks</span>
                    <Button variant="ghost" size="sm" onClick={generateHooks} loading={generating}>
                      <RefreshCw className="h-3.5 w-3.5" />
                      Regenerate
                    </Button>
                  </div>
                  {hooks.map((hook, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="glass-card rounded-xl p-4 flex items-start gap-3 hover:border-violet-500/30 transition-colors group">
                      <div className="flex-1">
                        <p className="text-white text-sm leading-relaxed">{hook}</p>
                      </div>
                      <button onClick={() => copyHook(hook)} className="shrink-0 text-white/30 hover:text-white transition-colors">
                        {copied === hook ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTool !== 'hook' && (
            <div className="glass-card rounded-2xl p-12 text-center space-y-4">
              <div className="text-5xl">✨</div>
              <h3 className="text-lg font-semibold text-white">
                {AI_TOOLS.find(t => t.id === activeTool)?.title}
              </h3>
              <p className="text-white/40 text-sm">
                {AI_TOOLS.find(t => t.id === activeTool)?.desc}
              </p>
              {AI_TOOLS.find(t => t.id === activeTool)?.badge === 'Pro' ? (
                <Button variant="gradient" size="sm">Upgrade to Pro to Access</Button>
              ) : (
                <Button variant="outline" size="sm">Open Tool <ChevronRight className="h-3.5 w-3.5" /></Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
