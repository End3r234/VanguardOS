import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Pin, Tag, Megaphone, Zap, CalendarDays, BookOpen } from 'lucide-react';
import VanguardLogo from '@/components/VanguardLogo';
import GlassCard from '@/components/GlassCard';
import ReactMarkdown from 'react-markdown';

const TYPE_CONFIG = {
  announcement: { label: 'Announcement', icon: Megaphone, color: 'text-crimson', bg: 'bg-crimson/10 border-crimson/30' },
  update: { label: 'Update', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  event: { label: 'Event', icon: CalendarDays, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  blog: { label: 'Blog', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
};

const FILTERS = ['all', 'announcement', 'update', 'event', 'blog'];

export default function Blog() {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => base44.entities.Announcement.list('-created_date', 100),
  });

  const filtered = posts.filter(p => filter === 'all' || p.type === filter);
  const pinned = filtered.filter(p => p.pinned);
  const regular = filtered.filter(p => !p.pinned);
  const ordered = [...pinned, ...regular];

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <header className="border-b border-crimson/20 bg-[#1a0000]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white/40 hover:text-white transition-colors"><ArrowLeft size={18} /></Link>
            <VanguardLogo size="sm" />
            <span className="text-white/30 text-sm hidden sm:block">/ Blog & Announcements</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">VanguardOS <span className="text-crimson">News</span></h1>
          <p className="text-white/40">Update logs, announcements, events, and more.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                filter === f
                  ? 'bg-crimson text-white border-crimson'
                  : 'bg-white/[0.04] border-white/10 text-white/50 hover:text-white hover:border-white/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="glass rounded-2xl h-28 animate-pulse" />)}
          </div>
        )}

        {!isLoading && ordered.length === 0 && (
          <GlassCard className="text-center py-16">
            <BookOpen size={40} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40">No posts yet. Check back soon.</p>
          </GlassCard>
        )}

        <div className="space-y-4">
          {ordered.map(post => {
            const cfg = TYPE_CONFIG[post.type] || TYPE_CONFIG.announcement;
            const Icon = cfg.icon;
            const isExpanded = expanded === post.id;
            const formattedDate = new Date(post.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <GlassCard key={post.id} className="cursor-pointer hover:bg-white/[0.06] transition-all" onClick={() => setExpanded(isExpanded ? null : post.id)}>
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 ${cfg.bg}`}>
                    <Icon size={16} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {post.pinned && <Pin size={11} className="text-yellow-400" />}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-white/30 text-xs">{formattedDate}</span>
                      {post.author_name && <span className="text-white/20 text-xs">by {post.author_name}</span>}
                    </div>
                    <h3 className="text-white font-bold text-base mb-1">{post.title}</h3>
                    {!isExpanded && (
                      <p className="text-white/40 text-sm line-clamp-2">{post.body.replace(/[#*`]/g, '')}</p>
                    )}
                    {isExpanded && (
                      <div className="prose prose-sm prose-invert max-w-none mt-3 text-white/70">
                        <ReactMarkdown>{post.body}</ReactMarkdown>
                      </div>
                    )}
                    {post.tags?.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-2">
                        {post.tags.map(t => (
                          <span key={t} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/40">
                            <Tag size={8} /> {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}