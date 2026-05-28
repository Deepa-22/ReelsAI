'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, Check, ArrowRight, ArrowLeft, Wand2,
  Sparkles, Mic, Music, Type, Film, Clock, Share2,
  Star, TrendingUp, Download, Eye, Edit3, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useCreateReelStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';
import ExportModal from '@/components/create/ExportModal';
import PreviewModal from '@/components/create/PreviewModal';

const CATEGORIES = [
  { value: 'COOKING', label: 'Cooking', icon: '🍳', desc: 'Recipes & food content' },
  { value: 'TRAVEL', label: 'Travel', icon: '✈️', desc: 'Adventures & destinations' },
  { value: 'BABY', label: 'Baby Memories', icon: '👶', desc: 'Precious moments' },
  { value: 'WEDDING', label: 'Wedding', icon: '💒', desc: 'Love & celebration' },
  { value: 'PETS', label: 'Pets', icon: '🐾', desc: 'Furry friends' },
  { value: 'FASHION', label: 'Fashion', icon: '👗', desc: 'Style & outfits' },
  { value: 'FOOD_BUSINESS', label: 'Food Business', icon: '🍔', desc: 'Restaurant & café' },
  { value: 'CAFE', label: 'Café', icon: '☕', desc: 'Coffee & ambience' },
  { value: 'FITNESS', label: 'Fitness', icon: '💪', desc: 'Workout & health' },
  { value: 'PRODUCT', label: 'Product', icon: '📦', desc: 'Showcase & demos' },
  { value: 'REAL_ESTATE', label: 'Real Estate', icon: '🏠', desc: 'Property tours' },
  { value: 'FESTIVAL', label: 'Festival', icon: '🎉', desc: 'Events & celebrations' },
  { value: 'BIRTHDAY', label: 'Birthday', icon: '🎂', desc: 'Special day memories' },
  { value: 'COUPLE', label: 'Couple', icon: '💑', desc: 'Love stories' },
  { value: 'LUXURY', label: 'Luxury', icon: '✨', desc: 'Premium lifestyle' },
  { value: 'VLOG', label: 'Vlog', icon: '🎬', desc: 'Daily life stories' },
];

const MOODS = [
  { value: 'CINEMATIC', label: 'Cinematic', icon: '🎥', desc: 'Epic & dramatic' },
  { value: 'EMOTIONAL', label: 'Emotional', icon: '💝', desc: 'Heartfelt & moving' },
  { value: 'LUXURY', label: 'Luxury', icon: '👑', desc: 'Premium & elegant' },
  { value: 'COZY', label: 'Cozy', icon: '☕', desc: 'Warm & intimate' },
  { value: 'VIRAL', label: 'Viral', icon: '🔥', desc: 'High energy & trendy' },
  { value: 'FAST_PACED', label: 'Fast-paced', icon: '⚡', desc: 'Quick cuts & energy' },
  { value: 'DREAMY', label: 'Dreamy', icon: '🌙', desc: 'Soft & ethereal' },
  { value: 'RETRO', label: 'Retro', icon: '📺', desc: 'Vintage vibes' },
  { value: 'MINIMAL', label: 'Minimal', icon: '⬜', desc: 'Clean & simple' },
  { value: 'DOCUMENTARY', label: 'Documentary', icon: '📽️', desc: 'Real & authentic' },
  { value: 'AESTHETIC', label: 'Aesthetic', icon: '🌸', desc: 'Beautiful & curated' },
];

const PLATFORMS = [
  { value: 'INSTAGRAM', label: 'Instagram', icon: '📸', color: 'from-pink-500 to-orange-400' },
  { value: 'TIKTOK', label: 'TikTok', icon: '🎵', color: 'from-gray-900 to-gray-700' },
  { value: 'YOUTUBE', label: 'YouTube Shorts', icon: '▶️', color: 'from-red-600 to-red-500' },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: '💬', color: 'from-green-600 to-green-500' },
];

const DURATIONS = [
  { value: 15, label: '15s', desc: 'Quick hook' },
  { value: 30, label: '30s', desc: 'Standard' },
  { value: 60, label: '60s', desc: 'Full story' },
];

const STEPS = [
  { id: 1, label: 'Upload', icon: Upload },
  { id: 2, label: 'Category', icon: Sparkles },
  { id: 3, label: 'Style', icon: Film },
  { id: 4, label: 'Settings', icon: Wand2 },
  { id: 5, label: 'Generate', icon: Loader2 },
];

type GenerationState = {
  status: 'idle' | 'analyzing' | 'scripting' | 'voicing' | 'rendering' | 'done' | 'error';
  progress: number;
  message: string;
  result?: {
    hook: string;
    script: string;
    viralityScore: number;
    aiScore: number;
  };
};

export default function CreateReelPage() {
  const { step, files, config, setStep, addFiles, removeFile, updateConfig, resetCreate } = useCreateReelStore();
  const [generation, setGeneration] = useState<GenerationState>({
    status: 'idle', progress: 0, message: ''
  });
  const [showExport, setShowExport] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = accepted.slice(0, 20 - files.length).map((file, i) => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file),
      type: (file.type.startsWith('video/') ? 'video' : 'image') as 'image' | 'video',
      order: files.length + i,
    }));
    addFiles(newFiles);
  }, [files.length, addFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxSize: 100 * 1024 * 1024,
    disabled: files.length >= 20,
  });

  const simulateGeneration = async () => {
    const steps = [
      { status: 'analyzing' as const, progress: 15, message: 'Analyzing your photos with AI vision...', delay: 1500 },
      { status: 'scripting' as const, progress: 35, message: 'Writing your cinematic story script...', delay: 2000 },
      { status: 'voicing' as const, progress: 60, message: 'Generating AI voiceover narration...', delay: 2000 },
      { status: 'rendering' as const, progress: 85, message: 'Rendering your cinematic reel...', delay: 3000 },
      { status: 'done' as const, progress: 100, message: 'Your reel is ready!', delay: 500 },
    ];

    for (const s of steps) {
      await new Promise((r) => setTimeout(r, s.delay));
      setGeneration({
        status: s.status,
        progress: s.progress,
        message: s.message,
        result: s.status === 'done' ? {
          hook: `Wait until you see this ${config.category?.toLowerCase() || 'amazing'} story...`,
          script: `AI-generated ${config.mood?.toLowerCase()} story with ${files.length} scenes`,
          viralityScore: Math.floor(Math.random() * 20) + 75,
          aiScore: Math.floor(Math.random() * 15) + 80,
        } : undefined,
      });
    }
  };

  const handleGenerate = async () => {
    if (!config.category || !config.mood) {
      toast.error('Please select a category and mood first');
      return;
    }
    if (files.length === 0) {
      toast.error('Please upload at least one photo or video');
      return;
    }
    setStep(5);
    await simulateGeneration();
  };

  const canProceed = () => {
    if (step === 1) return files.length > 0;
    if (step === 2) return !!config.category;
    if (step === 3) return !!config.mood;
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Steps indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => step > s.id ? setStep(s.id) : undefined}
              className={cn(
                'flex items-center gap-2 transition-all',
                step >= s.id ? 'opacity-100' : 'opacity-30 pointer-events-none'
              )}
            >
              <div className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all',
                step === s.id ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]' :
                  step > s.id ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    'glass text-white/30'
              )}>
                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
              </div>
              <span className={cn('text-sm font-medium hidden sm:block', step >= s.id ? 'text-white' : 'text-white/30')}>
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-px mx-3 min-w-[20px] sm:min-w-[40px]', step > s.id ? 'bg-violet-500/50' : 'bg-white/10')} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Upload */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Upload your content</h2>
              <p className="text-white/50">Upload photos and short videos (up to 20 files, 100MB each)</p>
            </div>

            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all',
                isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-white/15 hover:border-white/30 hover:bg-white/5',
                files.length >= 20 && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-violet-500/20 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-violet-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-white mb-1">
                    {isDragActive ? 'Drop your files here' : 'Drop photos & videos here'}
                  </p>
                  <p className="text-sm text-white/40">or click to browse — JPG, PNG, MP4, MOV</p>
                </div>
                <Button variant="outline" size="sm" type="button">Browse Files</Button>
              </div>
            </div>

            {files.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white/50">{files.length} file{files.length > 1 ? 's' : ''} selected</span>
                  <button onClick={() => files.forEach(f => removeFile(f.id))} className="text-xs text-red-400 hover:text-red-300">Remove all</button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                  {files.map((f) => (
                    <div key={f.id} className="relative group aspect-square">
                      <img src={f.preview} alt="" className="w-full h-full object-cover rounded-xl border border-white/10" />
                      {f.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-6 w-6 rounded-full bg-black/60 flex items-center justify-center">
                            <Film className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(f.id)}
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2: Category */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">What type of content is this?</h2>
              <p className="text-white/50">AI uses this to craft the perfect story structure</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateConfig({ category: cat.value as any })}
                  className={cn(
                    'glass-card rounded-2xl p-4 text-left transition-all',
                    config.category === cat.value ? 'border-violet-500/60 bg-violet-500/15 shadow-[0_0_20px_rgba(139,92,246,0.2)]' : 'hover:border-white/20'
                  )}
                >
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <div className="text-sm font-semibold text-white">{cat.label}</div>
                  <div className="text-xs text-white/40 mt-0.5">{cat.desc}</div>
                  {config.category === cat.value && (
                    <div className="mt-2"><Check className="h-4 w-4 text-violet-400" /></div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Mood */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Choose your vibe</h2>
              <p className="text-white/50">This sets the emotional tone, pacing, and style of your reel</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {MOODS.map((mood) => (
                <motion.button
                  key={mood.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateConfig({ mood: mood.value as any })}
                  className={cn(
                    'glass-card rounded-2xl p-4 text-left transition-all',
                    config.mood === mood.value ? 'border-violet-500/60 bg-violet-500/15 shadow-[0_0_20px_rgba(139,92,246,0.2)]' : 'hover:border-white/20'
                  )}
                >
                  <div className="text-2xl mb-2">{mood.icon}</div>
                  <div className="text-sm font-semibold text-white">{mood.label}</div>
                  <div className="text-xs text-white/40 mt-0.5">{mood.desc}</div>
                  {config.mood === mood.value && (
                    <div className="mt-2"><Check className="h-4 w-4 text-violet-400" /></div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 4: Settings */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Customize your reel</h2>
              <p className="text-white/50">Fine-tune the AI settings for your perfect output</p>
            </div>

            {/* Duration */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-violet-400" />
                <span className="font-medium text-white">Reel Duration</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {DURATIONS.map((d) => (
                  <button key={d.value} onClick={() => updateConfig({ duration: d.value as any })}
                    className={cn('glass-card rounded-xl p-3 text-center transition-all', config.duration === d.value ? 'border-violet-500/60 bg-violet-500/15' : 'hover:border-white/20')}>
                    <div className="text-lg font-bold text-white">{d.label}</div>
                    <div className="text-xs text-white/40">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-violet-400" />
                <span className="font-medium text-white">Export For</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map((p) => {
                  const selected = config.platforms.includes(p.value as any);
                  return (
                    <button key={p.value}
                      onClick={() => {
                        const platforms = selected
                          ? config.platforms.filter(x => x !== p.value as any)
                          : [...config.platforms, p.value as any];
                        updateConfig({ platforms });
                      }}
                      className={cn('glass-card rounded-xl p-3 flex items-center gap-3 transition-all', selected ? 'border-violet-500/40 bg-violet-500/10' : 'hover:border-white/20')}>
                      <span className="text-xl">{p.icon}</span>
                      <span className="text-sm font-medium text-white">{p.label}</span>
                      {selected && <Check className="h-4 w-4 text-green-400 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Features */}
            <div className="glass-card rounded-2xl p-5 space-y-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-400" />
                <span className="font-medium text-white">AI Features</span>
              </div>
              {[
                { key: 'voiceEnabled', icon: Mic, label: 'AI Voiceover', desc: 'Realistic narration in your reel' },
                { key: 'subtitlesEnabled', icon: Type, label: 'Auto Subtitles', desc: 'Animated captions generated automatically' },
                { key: 'musicEnabled', icon: Music, label: 'Background Music', desc: 'AI-matched music for your mood' },
              ].map(({ key, icon: Icon, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{label}</div>
                      <div className="text-xs text-white/40">{desc}</div>
                    </div>
                  </div>
                  <Switch
                    checked={config[key as keyof typeof config] as boolean}
                    onCheckedChange={(v) => updateConfig({ [key]: v })}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 5: Generate */}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            {generation.status !== 'done' ? (
              <div className="text-center space-y-8">
                <div className="relative inline-block">
                  <div className="h-24 w-24 rounded-3xl bg-violet-500/20 flex items-center justify-center mx-auto">
                    <Wand2 className="h-12 w-12 text-violet-400 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 rounded-3xl border-2 border-violet-500/30 animate-ping" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">AI is directing your reel</h2>
                  <p className="text-white/50 text-sm">{generation.message}</p>
                </div>
                <div className="max-w-md mx-auto space-y-3">
                  <Progress value={generation.progress} className="h-3" />
                  <p className="text-sm text-white/40">{generation.progress}% complete</p>
                </div>
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto text-center">
                  {['🎬 Story', '🎤 Voice', '🎵 Music'].map((item) => (
                    <div key={item} className="glass-card rounded-xl p-3 text-sm text-white/50">{item}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                    className="text-6xl mx-auto w-fit">✨</motion.div>
                  <h2 className="text-2xl font-bold text-white">Your reel is ready!</h2>
                  <p className="text-white/50">AI created a cinematic story from your {files.length} photos</p>
                </div>

                {generation.result && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card rounded-2xl p-5 text-center">
                      <Star className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-white">{generation.result.viralityScore}%</div>
                      <div className="text-sm text-white/50">Virality Score</div>
                    </div>
                    <div className="glass-card rounded-2xl p-5 text-center">
                      <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-white">{generation.result.aiScore}%</div>
                      <div className="text-sm text-white/50">AI Quality Score</div>
                    </div>
                  </div>
                )}

                {generation.result && (
                  <div className="glass-card rounded-2xl p-5 space-y-3">
                    <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">AI Hook</div>
                    <p className="text-white font-medium text-lg">"{generation.result.hook}"</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setShowPreview(true)}>
                    <Eye className="h-5 w-5" />
                    Preview Reel
                  </Button>
                  <Button variant="gradient" size="lg" className="flex-1" onClick={() => setShowExport(true)}>
                    <Download className="h-5 w-5" />
                    Export & Download
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="w-full text-white/40 hover:text-white" onClick={() => setShowPreview(true)}>
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                  Edit settings before export
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => { resetCreate(); }}>
                  Create Another Reel
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <ExportModal
        open={showExport}
        onClose={() => setShowExport(false)}
        files={files}
        config={config}
        hook={generation.result?.hook}
      />

      {/* Preview Modal */}
      <PreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        files={files}
        config={config}
        hook={generation.result?.hook}
        script={generation.result?.script}
        onEdit={() => { setShowPreview(false); setStep(4); }}
      />

      {/* Navigation */}
      {step < 5 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="ghost"
            onClick={() => step > 1 ? setStep(step - 1) : undefined}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          {step < 4 ? (
            <Button
              variant="gradient"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="glow"
              size="lg"
              onClick={handleGenerate}
              disabled={!canProceed()}
            >
              <Wand2 className="h-5 w-5" />
              Generate My Reel
              <Sparkles className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
