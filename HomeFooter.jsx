import React from 'react';
import { Link } from 'react-router-dom';
import VanguardLogo from '@/components/VanguardLogo';
import { openAIAssistant } from '@/lib/openAIAssistant';

const LINKS = {
  Platform: [
    { label: 'Marketplace', to: '/marketplace' },
    { label: 'Blog', to: '/blog' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Get Support', action: 'ai' },
    { label: 'Profile Directory', to: '/directory' },
  ],
  CAD: [
    { label: 'Training (LMS)', to: '/lms' },
    { label: 'Documentation', to: '/docs' },
    { label: 'About', to: '/about' },
    { label: 'Get Support', action: 'ai' },
    { label: 'Staff Applications', to: '/apply' },
  ],
  Legal: [
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Documentation', to: '/docs' },
  ],
};

const DISCORD_URL = 'https://discord.gg/RqVzDvNHxA';

export default function HomeFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#080808] mt-16">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="md:col-span-1">
            <VanguardLogo size="md" />
            <p className="text-white/30 text-sm mt-4 leading-relaxed max-w-xs">
              VanguardOS is the most advanced Computer-Aided Dispatch platform built for FiveM and roleplay communities. Designed for realism, built for performance.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, to, action }) => (
                  <li key={label}>
                    {action === 'ai' ? (
                      <button onClick={openAIAssistant} className="text-white/35 hover:text-white text-sm transition-colors text-left">
                        {label}
                      </button>
                    ) : to ? (
                      <Link to={to} className="text-white/35 hover:text-white text-sm transition-colors">
                        {label}
                      </Link>
                    ) : (
                      <span className="text-white/25 text-sm">{label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.05] mt-12 pt-6 flex items-center justify-between flex-wrap gap-3">
          <p className="text-white/20 text-xs">© {new Date().getFullYear()} VanguardOS. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#7289DA] hover:bg-[#5865F2]/20 transition-all text-xs font-medium"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
              Join our Discord
            </a>
            <p className="text-white/15 text-xs">Built for the community, by the community.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}