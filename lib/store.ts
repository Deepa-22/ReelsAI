import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Category =
  | 'COOKING' | 'TRAVEL' | 'BABY' | 'WEDDING' | 'PETS'
  | 'FASHION' | 'FOOD_BUSINESS' | 'CAFE' | 'FITNESS' | 'PRODUCT'
  | 'REAL_ESTATE' | 'FESTIVAL' | 'BIRTHDAY' | 'COUPLE' | 'LUXURY'
  | 'VLOG' | 'OTHER';

export type Mood =
  | 'CINEMATIC' | 'EMOTIONAL' | 'LUXURY' | 'COZY' | 'VIRAL'
  | 'FAST_PACED' | 'DREAMY' | 'RETRO' | 'MINIMAL' | 'DOCUMENTARY' | 'AESTHETIC';

export type Platform = 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'WHATSAPP' | 'DOWNLOAD';

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
  order: number;
  uploadedUrl?: string;
}

export interface ReelConfig {
  title: string;
  category: Category | null;
  mood: Mood | null;
  duration: 15 | 30 | 60;
  platforms: Platform[];
  voiceEnabled: boolean;
  voiceId: string;
  subtitlesEnabled: boolean;
  musicEnabled: boolean;
  musicMood: string;
  colorGrade: string;
  transitions: string;
  aspectRatio: '9:16' | '1:1' | '16:9';
}

export interface GeneratedReel {
  id: string;
  projectId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  script?: string;
  hook?: string;
  captions?: string[];
  hashtags?: string[];
  viralityScore?: number;
  aiScore?: number;
}

interface CreateReelState {
  step: number;
  files: UploadedFile[];
  config: ReelConfig;
  generatedReel: GeneratedReel | null;
  isGenerating: boolean;
  error: string | null;

  setStep: (step: number) => void;
  addFiles: (files: UploadedFile[]) => void;
  removeFile: (id: string) => void;
  reorderFiles: (files: UploadedFile[]) => void;
  updateConfig: (config: Partial<ReelConfig>) => void;
  setGeneratedReel: (reel: GeneratedReel | null) => void;
  setIsGenerating: (value: boolean) => void;
  setError: (error: string | null) => void;
  resetCreate: () => void;
}

const defaultConfig: ReelConfig = {
  title: '',
  category: null,
  mood: null,
  duration: 30,
  platforms: ['INSTAGRAM'],
  voiceEnabled: true,
  voiceId: '21m00Tcm4TlvDq8ikWAM',
  subtitlesEnabled: true,
  musicEnabled: true,
  musicMood: 'emotional',
  colorGrade: 'cinematic',
  transitions: 'smooth',
  aspectRatio: '9:16',
};

export const useCreateReelStore = create<CreateReelState>()((set) => ({
  step: 1,
  files: [],
  config: defaultConfig,
  generatedReel: null,
  isGenerating: false,
  error: null,

  setStep: (step) => set({ step }),
  addFiles: (newFiles) =>
    set((state) => ({ files: [...state.files, ...newFiles] })),
  removeFile: (id) =>
    set((state) => ({ files: state.files.filter((f) => f.id !== id) })),
  reorderFiles: (files) => set({ files }),
  updateConfig: (config) =>
    set((state) => ({ config: { ...state.config, ...config } })),
  setGeneratedReel: (reel) => set({ generatedReel: reel }),
  setIsGenerating: (value) => set({ isGenerating: value }),
  setError: (error) => set({ error }),
  resetCreate: () =>
    set({
      step: 1,
      files: [],
      config: defaultConfig,
      generatedReel: null,
      isGenerating: false,
      error: null,
    }),
}));

interface UserState {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    plan: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
    credits: number;
  } | null;
  setUser: (user: UserState['user']) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: 'storyreel-user' }
  )
);

interface UIState {
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'dark',
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'storyreel-ui' }
  )
);
