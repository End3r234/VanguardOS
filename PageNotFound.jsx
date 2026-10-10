import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <Shield size={48} className="text-crimson/30" />
          <div className="absolute inset-0 blur-xl bg-crimson/10 rounded-full" />
        </div>
        <h1 className="text-6xl font-black text-white mb-2">404</h1>
        <p className="text-white/40 mb-6">Page not found.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-crimson to-crimson-dark text-white font-medium text-sm hover:from-crimson-light hover:to-crimson transition-all"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>
    </div>
  );
}