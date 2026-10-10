import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Globe, Lock, ArrowRight, Crown, BadgeCheck } from 'lucide-react';

export default function ServerCard({ server, owned }) {
  return (
    <Link to={`/server/${server.id}`} className="block group">
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.14] transition-all duration-300 hover:shadow-xl hover:shadow-black/30">
        {/* Banner */}
        <div className="h-28 relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800">
          {server.banner_url ? (
            <img src={server.banner_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, #CE000022, #0B0B0B)` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {/* Tier badge */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            {server.is_verified && (
              <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-medium">
                <BadgeCheck size={10} /> Verified
              </div>
            )}
            {server.server_tier === 'premium' && (
              <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-medium">
                <Crown size={9} /> Premium
              </div>
            )}
          </div>
        </div>

        <div className="p-4 -mt-6 relative">
          <div className="flex items-end gap-3 mb-3">
            {server.icon_url ? (
              <img src={server.icon_url} alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-[#0B0B0B] shadow-lg flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-crimson/20 border-2 border-[#0B0B0B] flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-crimson font-black text-xl">{server.name?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1 min-w-0 pb-1">
              <h3 className="text-white font-bold text-base leading-tight truncate">{server.name}</h3>
              <div className="flex items-center gap-2 text-white/40 text-xs mt-0.5">
                <Users size={11} /><span>{server.member_count || 0}</span>
                {server.is_public ? <Globe size={11} /> : <Lock size={11} />}
                {owned && <span className="text-crimson text-[10px] font-medium">Owner</span>}
              </div>
            </div>
          </div>

          {server.description && (
            <p className="text-white/40 text-sm leading-relaxed line-clamp-2 mb-3">{server.description}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {(server.tags || []).slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] uppercase tracking-wider text-crimson/70 bg-crimson/10 px-2 py-0.5 rounded border border-crimson/20">{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-1 text-white/30 text-xs group-hover:text-crimson transition-colors">
              Enter <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}