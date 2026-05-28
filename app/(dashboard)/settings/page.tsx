'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Globe, Key, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    toast.success('Settings saved!');
  };

  const NOTIFICATION_SETTINGS = [
    { key: 'reel_complete', label: 'Reel completed', desc: 'Get notified when your reel is ready' },
    { key: 'trending_tips', label: 'Trending tips', desc: 'Weekly AI tips to go viral' },
    { key: 'product_updates', label: 'Product updates', desc: 'New features and improvements' },
    { key: 'billing_alerts', label: 'Billing alerts', desc: 'Payment and subscription notifications' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Manage your account preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-1.5" />Profile</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1.5" />Notifications</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 mr-1.5" />Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-violet-500/30">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl">👤</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">Change Photo</Button>
                <p className="text-xs text-white/30 mt-1.5">JPG, PNG, GIF up to 5MB</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Username" placeholder="@username" />
              <Input label="Website" placeholder="https://yoursite.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Bio</label>
              <textarea
                rows={3}
                placeholder="Tell the world about your content..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
              />
            </div>

            <Button variant="gradient" onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </Card>

          <Card className="p-6 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-white">Brand Kit</CardTitle>
              <CardDescription>Customize your reel watermarks and branding</CardDescription>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-4 text-center cursor-pointer hover:border-violet-500/30 transition-colors">
                <div className="text-2xl mb-2">🎨</div>
                <div className="text-sm text-white/60">Upload Logo</div>
              </div>
              <div className="glass-card rounded-xl p-4 space-y-3">
                <div className="text-sm font-medium text-white/60">Brand Colors</div>
                <div className="flex gap-2">
                  {['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b'].map((c) => (
                    <div key={c} className="h-7 w-7 rounded-full border-2 border-white/20 cursor-pointer" style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-6 space-y-5">
            {NOTIFICATION_SETTINGS.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{label}</div>
                  <div className="text-xs text-white/40 mt-0.5">{desc}</div>
                </div>
                <Switch defaultChecked={key !== 'trending_tips'} />
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="p-6 space-y-5">
            <CardTitle className="text-white">Password</CardTitle>
            <div className="space-y-3">
              <Input label="Current Password" type="password" placeholder="••••••••" />
              <Input label="New Password" type="password" placeholder="Min. 8 characters" />
              <Input label="Confirm New Password" type="password" placeholder="Repeat new password" />
            </div>
            <Button variant="outline">Update Password</Button>
          </Card>

          <Card className="p-6 space-y-4 border-red-500/20">
            <div>
              <CardTitle className="text-red-400">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions — proceed with caution</CardDescription>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Delete Account</div>
                <div className="text-xs text-white/40 mt-0.5">All data will be permanently removed</div>
              </div>
              <Button variant="destructive" size="sm" onClick={() => toast.error('Please contact support to delete your account')}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
