import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Zap } from 'lucide-react';

export default function FinalCTA({ onCreateServer }) {
  return (
    <section className="relative z-10 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-crimson/20 via-[#1a0000] to-[#0B0B0B]" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 40%, rgba(206,0,0,0.15), transparent 60%)' }} />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-crimson/30 bg-crimson/10 text-crimson text-xs font-semibold uppercase tracking-widest mb-6">
            <Zap size={11} /> Get Started
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
            Ready to Modernize Your<br />Roleplay Server?
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Create your free VanguardOS server in seconds. No setup, no hosting — just pure, professional-grade dispatch.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={onCreateServer}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-crimson to-crimson-dark hover:from-crimson-light hover:to-crimson text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-crimson/30"
            >
              Create Your Server <ArrowRight size={15} />
            </button>
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-semibold text-sm px-7 py-3.5 rounded-xl transition-all"
            >
              <BookOpen size={15} /> Read the Docs
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}