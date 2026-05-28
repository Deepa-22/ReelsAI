import Link from 'next/link';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PLANS = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for trying StoryReel AI',
    features: [
      '3 reels per month',
      'SD quality (720p)',
      'Watermark on exports',
      'Basic 10 templates',
      'Instagram & TikTok',
      'Email support',
    ],
    notIncluded: ['HD/4K quality', 'No watermark', 'AI voiceover', 'Auto subtitles', 'Priority rendering'],
    cta: 'Start Free',
    href: '/register',
  },
  {
    name: 'Pro',
    price: { monthly: 19, yearly: 15 },
    description: 'For serious content creators',
    badge: '🔥 Most Popular',
    highlighted: true,
    features: [
      'Unlimited reels',
      'HD quality (1080p)',
      'No watermark',
      '50+ premium templates',
      'AI voiceover (8 voices)',
      'Auto animated subtitles',
      'All social platforms',
      'Priority rendering',
      'Viral score & analytics',
      'Direct social posting',
    ],
    cta: 'Start Pro — Free 7-day trial',
    href: '/register?plan=pro',
  },
  {
    name: 'Business',
    price: { monthly: 49, yearly: 39 },
    description: 'For teams, agencies & brands',
    features: [
      'Everything in Pro',
      '4K quality (2160p)',
      '5 team seats',
      'Brand kit & watermarks',
      'Advanced analytics',
      'Multiple workspaces',
      'API access (1000 req/day)',
      'Priority support (< 2h)',
      'Custom transitions',
      'Batch rendering',
      'White-label exports',
    ],
    cta: 'Start Business',
    href: '/register?plan=business',
  },
  {
    name: 'Enterprise',
    price: { monthly: 0, yearly: 0 },
    description: 'Custom solutions for large teams',
    features: [
      'Custom team size',
      'Custom API limits',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations',
      'On-premise option',
      'Custom training',
      'Compliance & security',
    ],
    cta: 'Contact Sales',
    href: '/contact',
  },
];

const FEATURE_COMPARISON = [
  { feature: 'Monthly reels', free: '3', pro: 'Unlimited', business: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Video quality', free: 'SD (720p)', pro: 'HD (1080p)', business: '4K (2160p)', enterprise: '8K' },
  { feature: 'Watermark', free: 'Yes', pro: 'No', business: 'No', enterprise: 'No' },
  { feature: 'AI voiceover', free: '—', pro: '8 voices', business: '20+ voices', enterprise: 'Custom' },
  { feature: 'Auto subtitles', free: '—', pro: '✓', business: '✓', enterprise: '✓' },
  { feature: 'Templates', free: '10 basic', pro: '50+ premium', business: 'All + custom', enterprise: 'All + custom' },
  { feature: 'Team seats', free: '1', pro: '1', business: '5', enterprise: 'Unlimited' },
  { feature: 'API access', free: '—', pro: '—', business: '1,000 req/day', enterprise: 'Unlimited' },
  { feature: 'Support', free: 'Email', pro: 'Priority email', business: '< 2h response', enterprise: 'Dedicated' },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen py-20">
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

      <div className="container pt-16 space-y-20">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="secondary">Pricing</Badge>
          <h1 className="text-5xl font-bold text-white">Simple, transparent pricing</h1>
          <p className="text-white/50 text-lg">Start free. Upgrade when you need more power.</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-violet-600/20 to-purple-600/5 border-2 border-violet-500/50 shadow-[0_0_60px_rgba(139,92,246,0.3)]'
                  : 'glass-card'
              }`}
            >
              {plan.badge && (
                <Badge variant="pro" className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  {plan.badge}
                </Badge>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-white/40 text-sm mt-1">{plan.description}</p>
                <div className="mt-4">
                  {plan.price.monthly === 0 && plan.name !== 'Enterprise' ? (
                    <span className="text-4xl font-black text-white">Free</span>
                  ) : plan.name === 'Enterprise' ? (
                    <span className="text-2xl font-bold text-white">Custom</span>
                  ) : (
                    <>
                      <span className="text-4xl font-black text-white">${plan.price.monthly}</span>
                      <span className="text-white/40 text-sm">/month</span>
                    </>
                  )}
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                    <Check className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button variant={plan.highlighted ? 'gradient' : 'outline'} className="w-full">
                  {plan.cta}
                  {plan.name !== 'Enterprise' && <ArrowRight className="h-4 w-4" />}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/8">
            <h2 className="text-2xl font-bold text-white">Full Feature Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left p-4 text-white/50 font-medium text-sm">Feature</th>
                  {['Free', 'Pro', 'Business', 'Enterprise'].map((p) => (
                    <th key={p} className="text-center p-4 text-white font-semibold text-sm">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                    <td className="p-4 text-white/60 text-sm">{row.feature}</td>
                    <td className="p-4 text-center text-sm text-white/50">{row.free === '—' ? <span className="text-white/20">—</span> : row.free}</td>
                    <td className="p-4 text-center text-sm text-violet-300">{row.pro === '—' ? <span className="text-white/20">—</span> : row.pro}</td>
                    <td className="p-4 text-center text-sm text-white/70">{row.business}</td>
                    <td className="p-4 text-center text-sm text-white/70">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ CTA */}
        <div className="text-center glass-card rounded-3xl p-12 space-y-6">
          <h2 className="text-3xl font-bold text-white">Any questions?</h2>
          <p className="text-white/50">We answer every question within 24 hours.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/help"><Button variant="outline">Help Center</Button></Link>
            <Link href="/contact"><Button variant="gradient">Contact Sales</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
