import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Send, Plus, Trash2, Bell, BellOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function EmailNotifications({ server, serverId, user, isAdmin, isOwner }) {
  const queryClient = useQueryClient();
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subLabel, setSubLabel] = useState('');
  const [showSend, setShowSend] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const canSend = isAdmin || isOwner;

  // Only fetch own subscription
  const { data: mySubs = [] } = useQuery({
    queryKey: ['my-email-subs', serverId, user?.email],
    queryFn: () => base44.entities.EmailSubscriber.filter({ server_id: serverId, subscribed_by_email: user?.email }),
    enabled: !!serverId && !!user?.email,
  });

  // Admins/owners get count only (not emails)
  const { data: allSubs = [] } = useQuery({
    queryKey: ['all-email-subs-count', serverId],
    queryFn: () => base44.entities.EmailSubscriber.filter({ server_id: serverId }),
    enabled: !!serverId && canSend,
  });

  const mySub = mySubs[0];

  const subscribeMutation = useMutation({
    mutationFn: () => base44.entities.EmailSubscriber.create({
      server_id: serverId,
      email: subscribeEmail.trim().toLowerCase(),
      subscribed_by_email: user.email,
      label: subLabel.trim() || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-email-subs', serverId, user?.email] });
      if (canSend) queryClient.invalidateQueries({ queryKey: ['all-email-subs-count', serverId] });
      setSubscribeEmail('');
      setSubLabel('');
    },
  });

  const unsubMutation = useMutation({
    mutationFn: () => base44.entities.EmailSubscriber.delete(mySub.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-email-subs', serverId, user?.email] });
      if (canSend) queryClient.invalidateQueries({ queryKey: ['all-email-subs-count', serverId] });
    },
  });

  const handleSendEmail = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setSendResult(null);
    let successCount = 0;
    let failCount = 0;
    for (const sub of allSubs) {
      try {
        await base44.integrations.Core.SendEmail({
          to: sub.email,
          subject: `[${server?.name || 'Server'}] ${subject}`,
          body: `${body}\n\n---\nThis message was sent by ${server?.name || 'your server'} staff.\nTo unsubscribe, sign in and manage your notification settings in the server.`,
          from_name: server?.name || 'VanguardOS',
        });
        successCount++;
      } catch {
        failCount++;
      }
    }
    setSending(false);
    setSendResult({ successCount, failCount, total: allSubs.length });
    if (failCount === 0) {
      setSubject('');
      setBody('');
    }
  };

  const emailNotificationsEnabled = server?.email_notifications_enabled;

  if (!emailNotificationsEnabled) {
    return (
      <GlassCard>
        <div className="flex items-center gap-3 text-white/40">
          <BellOff size={18} />
          <div>
            <p className="text-sm font-medium text-white/60">Email Notifications Disabled</p>
            <p className="text-xs mt-0.5">
              {isOwner
                ? 'Enable email notifications in the General settings tab to allow members to subscribe.'
                : 'Email notifications are not enabled for this server.'}
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-5">
      {/* Subscription section for current user */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Bell size={14} className="text-crimson" />
          <p className="text-white text-sm font-semibold">Your Notification Subscription</p>
        </div>
        {mySub ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div>
              <p className="text-emerald-400 text-sm font-medium">Subscribed</p>
              <p className="text-white/30 text-xs mt-0.5">
                You will receive session and training emails for this server.
              </p>
            </div>
            <CrimsonButton
              variant="outline"
              onClick={() => unsubMutation.mutate()}
              disabled={unsubMutation.isPending}
              className="h-8 text-xs"
            >
              <BellOff size={12} className="mr-1" /> Unsubscribe
            </CrimsonButton>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-white/40 text-xs">
              Subscribe your email to receive notifications about sessions, training events, and announcements from this server's staff.
            </p>
            <div>
              <Label className="text-white/60 text-xs">Your Email Address</Label>
              <Input
                value={subscribeEmail}
                onChange={e => setSubscribeEmail(e.target.value)}
                placeholder="your@email.com"
                type="email"
                className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"
              />
            </div>
            <div>
              <Label className="text-white/60 text-xs">Label <span className="text-white/25">(optional)</span></Label>
              <Input
                value={subLabel}
                onChange={e => setSubLabel(e.target.value)}
                placeholder="e.g. Patrol Division"
                className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"
              />
            </div>
            <div className="flex justify-end">
              <CrimsonButton
                onClick={() => subscribeMutation.mutate()}
                disabled={!subscribeEmail.trim() || subscribeMutation.isPending}
                className="h-9 text-sm"
              >
                <Plus size={13} className="mr-1" /> Subscribe
              </CrimsonButton>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Admin: send email section */}
      {canSend && (
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Send size={14} className="text-crimson" />
              <p className="text-white text-sm font-semibold">Send Notification Email</p>
            </div>
            <span className="text-white/30 text-xs">{allSubs.length} subscriber{allSubs.length !== 1 ? 's' : ''}</span>
          </div>
          {allSubs.length === 0 ? (
            <p className="text-white/30 text-sm">No subscribers yet. Members can subscribe using the form above.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-white/40 text-xs">
                Send an email to all {allSubs.length} subscriber{allSubs.length !== 1 ? 's' : ''}. Emails are kept private and never shown to other members.
              </p>
              <CrimsonButton onClick={() => { setShowSend(true); setSendResult(null); }} className="h-9 text-sm">
                <Mail size={13} className="mr-1.5" /> Compose & Send
              </CrimsonButton>
            </div>
          )}
        </GlassCard>
      )}

      {/* Send Dialog */}
      <Dialog open={showSend} onOpenChange={setShowSend}>
        <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Mail size={16} className="text-crimson" /> Send Notification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
              <p className="text-white/40 text-xs">Sending to <span className="text-white/70 font-semibold">{allSubs.length} subscriber{allSubs.length !== 1 ? 's' : ''}</span>. Email addresses are private and will not be disclosed.</p>
            </div>
            <div>
              <Label className="text-white/60 text-xs">Subject</Label>
              <Input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Training Session Tonight @ 8PM"
                className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"
              />
            </div>
            <div>
              <Label className="text-white/60 text-xs">Message</Label>
              <Textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write your message here..."
                className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm resize-none h-36"
              />
            </div>
            {sendResult && (
              <div className={`p-3 rounded-xl text-sm ${sendResult.failCount === 0 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'}`}>
                Sent to {sendResult.successCount}/{sendResult.total} subscribers.
                {sendResult.failCount > 0 && ` ${sendResult.failCount} failed.`}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <CrimsonButton variant="ghost" onClick={() => setShowSend(false)}>Cancel</CrimsonButton>
              <CrimsonButton
                onClick={handleSendEmail}
                disabled={sending || !subject.trim() || !body.trim()}
              >
                {sending ? 'Sending...' : <><Send size={13} className="mr-1" /> Send Email</>}
              </CrimsonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}