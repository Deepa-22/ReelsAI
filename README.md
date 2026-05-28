# StoryReel AI 🎬✨

> **Turn memories into cinematic stories with AI.**
> The most powerful AI Story Director for social media reels.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-teal)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-2.47-green)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-orange)](https://openai.com)

---

## What is StoryReel AI?

StoryReel AI is a production-ready AI SaaS that transforms photos and short videos into cinematic vertical reels for Instagram, TikTok, YouTube Shorts, and WhatsApp — automatically, with zero editing skills required.

Users upload their photos → AI directs the story → Export a viral-ready reel in minutes.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, Framer Motion |
| State | Zustand |
| UI Components | Custom ShadCN-style + Radix UI |
| Auth | Supabase Auth (Google, Email, Magic Links) |
| Database | Supabase Postgres + Prisma ORM |
| Storage | Supabase Storage |
| AI (Script) | OpenAI GPT-4o |
| AI (Voiceover) | ElevenLabs |
| AI (Video) | Replicate / Runway ML |
| Payments | Stripe + Razorpay (India) |
| Analytics | PostHog + Google Analytics |
| Deployment | Vercel + Supabase |

---

## Project Structure

```
storyreel-ai/
├── app/
│   ├── (auth)/            # Login & Register pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── dashboard/     # Main dashboard
│   │   ├── create/        # Create Reel wizard (5 steps)
│   │   ├── projects/      # My Projects
│   │   ├── ai-studio/     # AI Tools playground
│   │   ├── analytics/     # Performance analytics
│   │   ├── billing/       # Plans & payments
│   │   ├── settings/      # Account settings
│   │   └── referral/      # Referral program
│   ├── (marketing)/       # Public marketing pages
│   │   ├── features/      # Features page
│   │   ├── pricing/       # Pricing comparison
│   │   ├── templates/     # Template library
│   │   ├── showcase/      # Creator showcase gallery
│   │   └── help/          # Help center
│   ├── admin/             # Admin dashboard
│   ├── api/
│   │   ├── ai/generate/   # Story script generation
│   │   ├── ai/voiceover/  # ElevenLabs voiceover
│   │   ├── projects/      # Project CRUD
│   │   ├── reels/         # Reel management
│   │   ├── exports/       # Export handling
│   │   ├── uploads/       # File upload
│   │   ├── user/          # User profile
│   │   ├── payments/      # Stripe checkout
│   │   └── webhooks/      # Stripe webhooks
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Base UI components (Button, Input, Card, etc.)
│   ├── landing/           # Landing page sections
│   ├── dashboard/         # Dashboard-specific components
│   ├── create/            # Reel creation components
│   └── shared/            # Shared (Sidebar, Header)
├── lib/
│   ├── utils.ts           # Utilities & helpers
│   ├── supabase.ts        # Supabase client
│   ├── prisma.ts          # Prisma client
│   ├── openai.ts          # OpenAI integration
│   ├── elevenlabs.ts      # ElevenLabs voiceover
│   ├── stripe.ts          # Stripe payments
│   ├── auth.ts            # Auth helpers
│   └── store.ts           # Zustand stores
├── prisma/
│   └── schema.prisma      # Complete database schema
├── .env.example           # All required env variables
└── tailwind.config.ts     # Custom Tailwind config
```

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourname/storyreel-ai.git
cd storyreel-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your API keys in `.env.local`:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `DATABASE_URL` | Postgres connection string |
| `OPENAI_API_KEY` | OpenAI API key (GPT-4o) |
| `ELEVENLABS_API_KEY` | ElevenLabs API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

### 4. Set up the database

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
```

### 5. Set up Supabase Storage

Create these buckets in your Supabase project:
- `uploads` — user photo/video uploads
- `reels` — generated reel outputs
- `thumbnails` — reel thumbnails

Set both buckets to public access.

### 6. Set up Supabase Auth

Enable these providers in your Supabase Auth settings:
- Email/Password
- Google OAuth
- Magic Links

Set `Site URL` and `Redirect URLs` to your domain.

### 7. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Key Features

### For Users
- **AI Story Director** — Auto-creates emotional storylines from photos
- **16 Content Categories** — Cooking, Travel, Wedding, Pets, Fitness, Business, and more
- **11 Cinematic Moods** — Cinematic, Viral, Dreamy, Emotional, Luxury, etc.
- **AI Voiceover** — 8+ realistic voices via ElevenLabs
- **Auto Subtitles** — Animated captions, word-level sync
- **Music Matching** — Mood-based background music
- **Viral Hook Engine** — AI-generated hooks, captions, hashtags
- **Direct Posting** — Post directly to Instagram, TikTok, YouTube, WhatsApp
- **Smart Export** — 15s, 30s, 60s versions, 9:16 vertical format

### For Business
- **Analytics Dashboard** — Views, engagement, virality scores
- **Team Collaboration** — Multiple seats and workspaces
- **Brand Kits** — Custom watermarks and logos
- **API Access** — Programmatic reel generation
- **Referral System** — Built-in refer-a-friend rewards

### Payment Plans
| Plan | Price | Key Feature |
|------|-------|-------------|
| Free | $0/mo | 3 reels, watermark |
| Pro | $19/mo | Unlimited, HD, no watermark |
| Business | $49/mo | Team, 4K, API, analytics |
| Enterprise | Custom | Custom SLA and integrations |

---

## Deployment

### Vercel (Frontend)

```bash
vercel deploy
```

Set environment variables in Vercel Dashboard.

### Supabase (Backend)

1. Create project at [supabase.com](https://supabase.com)
2. Run `npm run db:push` to create tables
3. Configure Auth providers
4. Create storage buckets

### Stripe Webhooks

1. Create webhook in Stripe Dashboard
2. Point to: `https://yourdomain.com/api/webhooks/stripe`
3. Subscribe to events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`

---

## Database Schema

Key tables in the Prisma schema:

- **users** — User profiles, plans, credits
- **subscriptions** — Stripe subscription data
- **projects** — Reel projects with category/mood
- **uploads** — Uploaded photos and videos
- **reels** — Generated reels with AI metadata
- **exports** — Export history per platform
- **templates** — Reel template library
- **analytics** — User event tracking
- **referrals** — Referral program tracking
- **brand_kits** — Business branding settings

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/ai/generate` | POST | Generate story script + virality score |
| `/api/ai/voiceover` | POST | Generate AI voiceover audio |
| `/api/projects` | GET/POST | List/create projects |
| `/api/projects/[id]` | GET/PATCH/DELETE | Project management |
| `/api/uploads` | POST | Upload files to Supabase Storage |
| `/api/user` | GET/PATCH | User profile |
| `/api/payments/checkout` | POST | Create Stripe checkout session |
| `/api/payments/portal` | POST | Open Stripe billing portal |
| `/api/webhooks/stripe` | POST | Stripe event webhooks |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Support

- Email: support@storyreel.ai
- Help Center: https://storyreel.ai/help
- Discord: https://discord.gg/storyreel

---

Made with ❤️ for creators worldwide. Turn your memories into cinematic stories.
