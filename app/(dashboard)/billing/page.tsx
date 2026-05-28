'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Building2, Crown, ArrowRight, CreditCard, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';

const PLANS = [
  {
    name: 'Free',
    monthly: 0,
    yearly: 0,
    icon: '⭐',
    description: 'Perfect to get started',
    features: ['3 reels/month', 'SD quality (720p)', 'Watermark on exports', 'Basic templates', 'Instagram & TikTok export'],
    cta: 'Current Plan',
    current: true,
  },
  {
    name: 'Pro',
    monthly: 19,
    yearly: 15,
    icon: '🚀',
    description: 'For serious creators',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      'Unlimited reels', 'HD quality (1080p)', 'No watermark', 'All 50+ templates',
      'AI voiceover', 'Auto subtitles', 'All platforms', 'Priority rendering',
      'Viral score analysis', 'Direct social posting',
    ],
    cta: 'Upgrade to Pro',
    priceId: 'pro',
  },
  {
    name: 'Business',
    monthly: 49,
    yearly: 39,
    icon: '💼',
    description: 'For teams & brands',
    features: [
      'Everything in Pro', '4K quality (2160p)', 'Team collaboration (5 seats)',
      'Brand kits & watermarks', 'Analytics dashboard', 'Multiple workspaces',
      'API access', 'Priority support', 'Custom transitions', 'Batch rendering',
    ],
    cta: 'Upgrade to Business',
    priceId: 'business',
  },
];

const INVOICE_HISTORY = [
  { date: 'Jan 1, 2025', plan: 'Pro', amount: '$19.00', status: 'Paid' },
  { date: 'Dec 1, 2024', plan: 'Pro', amount: '$19.00', status: 'Paid' },
  { date: 'Nov 1, 2024', plan: 'Pro', amount: '$19.00', status: 'Paid' },
];

export default function BillingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, billing }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    try {
      const res = await fetch('/api/payments/portal', { method: 'POST' });
      const { url } = await res.json();
      if (url) window.open(url, '_blank');
    } catch {
      toast.error('Failed to open billing portal');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing & Plans</h1>
        <p className="text-white/40 text-sm mt-1">Manage your subscription and payment details</p>
      </div>

      {/* Current plan */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-violet-500/20 flex items-center justify-center text-2xl">⭐</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Free Plan</span>
                <Badge variant="secondary">Current</Badge>
              </div>
              <p className="text-sm text-white/40 mt-0.5">3 reels remaining this month</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleManage}>
              <CreditCard className="h-4 w-4" />
              Manage Billing
            </Button>
          </div>
        </div>
        <div className="mt-4 h-2 w-full rounded-full bg-white/10">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-violet-600 to-purple-500" />
        </div>
        <p className="text-xs text-white/30 mt-2">1 of 3 reels used this month · Resets on Feb 1</p>
      </Card>

      {/* Billing toggle */}
      <div className="flex justify-center">
        <div className="flex items-center gap-4">
          <Tabs value={billing} onValueChange={(v) => setBilling(v as 'monthly' | 'yearly')}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
          {billing === 'yearly' && (
            <Badge variant="success" className="text-xs">Save 20%</Badge>
          )}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative rounded-2xl p-6 ${
              plan.highlighted
                ? 'bg-gradient-to-b from-violet-600/20 to-purple-600/10 border-2 border-violet-500/50 shadow-[0_0_40px_rgba(139,92,246,0.25)]'
                : 'glass-card'
            }`}
          >
            {plan.badge && (
              <Badge variant="pro" className="absolute -top-3 left-1/2 -translate-x-1/2">{plan.badge}</Badge>
            )}

            <div className="mb-4">
              <div className="text-2xl mb-2">{plan.icon}</div>
              <div className="text-lg font-bold text-white">{plan.name}</div>
              <div className="text-white/40 text-sm">{plan.description}</div>
            </div>

            <div className="mb-6">
              {plan.monthly === 0 ? (
                <span className="text-4xl font-black text-white">Free</span>
              ) : (
                <>
                  <span className="text-4xl font-black text-white">
                    ${billing === 'yearly' ? plan.yearly : plan.monthly}
                  </span>
                  <span className="text-white/40 text-sm">/month</span>
                  {billing === 'yearly' && (
                    <span className="ml-2 text-xs text-green-400">billed annually</span>
                  )}
                </>
              )}
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                  <Check className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            {plan.current ? (
              <Button variant="secondary" className="w-full" disabled>Current Plan</Button>
            ) : (
              <Button
                variant={plan.highlighted ? 'gradient' : 'outline'}
                className="w-full"
                loading={loading === plan.priceId}
                onClick={() => plan.priceId && handleUpgrade(plan.priceId)}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Payment methods & Invoice history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-white">Payment Method</h3>
          <div className="flex items-center gap-4 p-4 glass rounded-xl">
            <CreditCard className="h-6 w-6 text-white/40" />
            <div>
              <div className="text-sm text-white/60">No payment method added</div>
              <div className="text-xs text-white/30 mt-0.5">Add one when you upgrade</div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            <CreditCard className="h-4 w-4" />
            Add Payment Method
          </Button>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Invoice History</h3>
            <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /></Button>
          </div>
          {INVOICE_HISTORY.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-4">No invoices yet</p>
          ) : (
            <div className="space-y-2">
              {INVOICE_HISTORY.map((inv) => (
                <div key={inv.date} className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{inv.date}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white">{inv.amount}</span>
                    <Badge variant="success" className="text-xs">{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
