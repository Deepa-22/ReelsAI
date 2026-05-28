'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Share2, Users, DollarSign, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

const REFERRAL_CODE = 'STORY-REF-XK29';
const REFERRAL_LINK = `https://storyreel.ai/r/${REFERRAL_CODE}`;

const MOCK_REFERRALS = [
  { name: 'Priya Sharma', email: 'p***@gmail.com', status: 'COMPLETED', reward: '$5.00', joinedAt: '3 days ago' },
  { name: 'Rahul M.', email: 'r***@outlook.com', status: 'COMPLETED', reward: '$5.00', joinedAt: '1 week ago' },
  { name: 'Sarah K.', email: 's***@yahoo.com', status: 'PENDING', reward: 'Pending', joinedAt: '2 days ago' },
];

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(REFERRAL_LINK);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Try StoryReel AI!',
        text: 'Create cinematic reels from your photos with AI. Get 1 extra free reel when you sign up!',
        url: REFERRAL_LINK,
      });
    } else {
      copyLink();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Referral Program</h1>
        <p className="text-white/40 text-sm mt-1">Earn rewards by inviting friends to StoryReel AI</p>
      </div>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass-card rounded-3xl p-8 text-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-pink-600/10" />
        <div className="relative space-y-4">
          <div className="h-16 w-16 rounded-3xl bg-violet-500/30 flex items-center justify-center mx-auto">
            <Gift className="h-8 w-8 text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Give $5, Get $5</h2>
            <p className="text-white/50 mt-2 max-w-sm mx-auto">
              Invite friends to StoryReel AI. They get $5 off their first Pro month. You earn $5 credit.
            </p>
          </div>

          {/* Referral link */}
          <div className="flex items-center gap-2 glass rounded-xl p-3 max-w-sm mx-auto">
            <span className="flex-1 text-sm text-white/60 truncate font-mono text-xs">{REFERRAL_LINK}</span>
            <Button variant="ghost" size="icon-sm" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="gradient" onClick={shareReferral}>
              <Share2 className="h-4 w-4" />
              Share Referral Link
            </Button>
            <Button variant="outline" onClick={copyLink}>
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Referred', value: '3', icon: Users, color: 'text-violet-400' },
          { label: 'Completed', value: '2', icon: Check, color: 'text-green-400' },
          { label: 'Earned', value: '$10', icon: DollarSign, color: 'text-amber-400' },
        ].map((stat) => (
          <Card key={stat.label} className="p-5 text-center">
            <stat.icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-white/40 mt-1">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Referral history */}
      <Card className="p-6 space-y-4">
        <CardTitle className="text-white">Referral History</CardTitle>
        {MOCK_REFERRALS.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No referrals yet. Share your link to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {MOCK_REFERRALS.map((ref, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between glass rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-300">
                    {ref.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{ref.name}</div>
                    <div className="text-xs text-white/40">{ref.email} · {ref.joinedAt}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white">{ref.reward}</span>
                  <Badge variant={ref.status === 'COMPLETED' ? 'success' : 'warning'} className="text-xs">
                    {ref.status === 'COMPLETED' ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* How it works */}
      <Card className="p-6 space-y-4">
        <CardTitle className="text-white">How It Works</CardTitle>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Share your unique referral link with friends' },
            { step: '2', text: 'Friend signs up and upgrades to Pro' },
            { step: '3', text: 'They get $5 off their first month' },
            { step: '4', text: 'You earn $5 credit automatically' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3 text-sm text-white/60">
              <div className="h-6 w-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-300 shrink-0">
                {item.step}
              </div>
              {item.text}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
