import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, X, User, Clock, Server, MessageSquare, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';
import PlatformBadge from '@/components/PlatformBadge';

const ROLE_STYLES = {
  developer: { label: 'Developer', color: '#10B981' },
  admin: { label: 'Admin', color: '#CE0000' },
  global_mod: { label: 'Global Mod', color: '#8B5CF6' },
  cad_moderator: { label: 'CAD Mod', color: '#3B82F6' },
  moderator: { label: 'Moderator', color: '#F59E0B' },
};

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={20}
            fill={(hover || value) >= n ? '#F59E0B' : 'none'}
            className={(hover || value) >= n ? 'text-amber-400' : 'text-white/20'}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProfileReviewModal({ profile, currentUser, onClose }) {
  const queryClient = useQueryClient();
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);

  // Fetch reviews for this profile
  const { data: reviews = [] } = useQuery({
    queryKey: ['profile-reviews', profile?.user_email],
    queryFn: () => base44.entities.ProfileReview.filter({ reviewed_email: profile?.user_email }),
    enabled: !!profile?.user_email,
  });

  // Local reviews fallback
  const allReviews = reviews;

  const avgRating = allReviews.length
    ? (allReviews.reduce((s, r) => s + (r.rating || 0), 0) / allReviews.length).toFixed(1)
    : null;

  const submitMutation = useMutation({
    mutationFn: () => base44.entities.ProfileReview.create({
      reviewed_email: profile.user_email,
      reviewer_email: currentUser?.email,
      reviewer_name: currentUser?.full_name || currentUser?.email,
      text: reviewText,
      rating,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-reviews', profile?.user_email] });
      setReviewText('');
      setRating(0);
    },
  });

  const submitReview = () => {
    if (!reviewText.trim() || !rating) return;
    submitMutation.mutate();
  };

  const roleStyle = ROLE_STYLES[profile?.global_role];
  const badges = profile?.platform_badges || [];

  return (
    <Dialog open={!!profile} onOpenChange={onClose}>
      <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle className="text-white sr-only">Profile</DialogTitle>
        </DialogHeader>

        {/* Profile header */}
        <div className="relative mb-4">
          <div className="h-36 relative overflow-hidden rounded-t-2xl"
            style={{ background: profile?.banner_url ? `url(${profile.banner_url}) center/cover no-repeat` : `linear-gradient(135deg, ${profile?.accent_color || '#CE0000'}55, #0B0B0B)`, backgroundSize: 'cover' }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <div className="px-6 -mt-10 relative flex items-end gap-4 pb-0">
            <div className="w-16 h-16 rounded-2xl border-2 overflow-hidden bg-zinc-800 shadow-xl" style={{ borderColor: profile?.accent_color || '#CE0000' }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><User size={22} className="text-white/30" /></div>}
            </div>
            <div className="pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-white font-bold text-lg">{profile?.display_name || 'Unknown'}</h2>
                {roleStyle && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ color: roleStyle.color, background: roleStyle.color + '20' }}>{roleStyle.label}</span>
                )}
                {avgRating && (
                  <span className="flex items-center gap-1 text-amber-400 text-xs"><Star size={11} fill="#F59E0B" /> {avgRating} ({allReviews.length})</span>
                )}
              </div>
              {profile?.badge && <p className="text-white/30 text-xs">{profile.badge}</p>}
            </div>
          </div>
        </div>

        {/* Bio + Stats */}
        <div className="px-6 pb-6 space-y-3">
          {profile?.bio && (
            <GlassCard className="py-3 px-4">
              <p className="text-white/60 text-sm leading-relaxed">{profile.bio}</p>
            </GlassCard>
          )}
          <div className="flex gap-3 flex-wrap">
            {profile?.total_hours > 0 && (
              <div className="flex items-center gap-1.5 text-white/40 text-xs px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <Clock size={11} /> {profile.total_hours}h logged
              </div>
            )}
            {profile?.servers_joined > 0 && (
              <div className="flex items-center gap-1.5 text-white/40 text-xs px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <Server size={11} /> {profile.servers_joined} servers
              </div>
            )}
          </div>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {badges.map(b => <PlatformBadge key={b} badgeKey={b} />)}
            </div>
          )}

          {/* Reviews section */}
          <div>
            <h3 className="text-white/70 text-sm font-semibold flex items-center gap-2 mb-3">
              <MessageSquare size={14} /> Reviews
            </h3>
            {currentUser?.email !== profile?.user_email && (
              <GlassCard className="mb-4">
                <Label className="text-white/50 text-xs mb-2 block">Leave a Review</Label>
                <StarRating value={rating} onChange={setRating} />
                <Textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Share your experience with this dispatcher/officer..."
                  className="bg-white/[0.05] border-white/10 text-white mt-2 rounded-xl text-sm"
                  rows={2}
                />
                <div className="flex justify-end mt-2">
                  <CrimsonButton onClick={submitReview} disabled={!reviewText.trim() || !rating || submitMutation.isPending} className="h-8 px-3 text-xs">
                    <Send size={11} className="mr-1" /> Submit
                  </CrimsonButton>
                </div>
              </GlassCard>
            )}
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {allReviews.map((r, i) => (
                <div key={r.id || i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white text-xs font-medium">{r.reviewer_name || r.reviewer_email}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => <Star key={n} size={10} fill={r.rating >= n ? '#F59E0B' : 'none'} className={r.rating >= n ? 'text-amber-400' : 'text-white/15'} />)}
                    </div>
                    <span className="text-white/20 text-[10px] ml-auto">{r.created_date ? new Date(r.created_date).toLocaleDateString() : ''}</span>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">{r.text}</p>
                </div>
              ))}
              {allReviews.length === 0 && (
                <div className="text-center py-8 text-white/20 text-xs">No reviews yet.</div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}