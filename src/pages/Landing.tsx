import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Briefcase, Megaphone, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getCsvTourStats, formatCompactCurrency, formatNumber } from '../lib/landingStats';
import AuthModal from '../components/landing/AuthModal';
import LandingDataSection from '../components/landing/LandingDataSection';
import LandingPricing, { PricingTier } from '../components/landing/LandingPricing';

const { totalShows, totalGross, uniqueArtists } = getCsvTourStats();

const FAQ_ITEMS = [
  {
    q: 'What data does GTI include?',
    a: 'Verified box office receipts, global touring rankings, ticket pacing, and audience demographic models — aggregated from historical settlement reports and live inventory audits.',
  },
  {
    q: 'How often is the data updated?',
    a: 'Rankings and box office records are refreshed as new verified reports are ingested. Ticket pacing metrics are parsed daily from official on-sale inventories.',
  },
  {
    q: 'Can I export reports?',
    a: 'Yes. Subscribers receive export credits to download spreadsheet-ready sheets with gross, sell-through, and demographic summaries for any artist or market.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. Monthly plans can be cancelled at any time from your account. You retain access through the end of your billing period.',
  },
];

const AUDIENCE_CARDS = [
  {
    icon: Briefcase,
    title: 'Agents',
    body: 'Benchmark routing decisions against verified gross and sell-through across comparable tours before you commit dates.',
  },
  {
    icon: Megaphone,
    title: 'Promoters',
    body: 'Track pacing velocity and capacity utilization in real time to adjust marketing spend and hold inventory strategy.',
  },
  {
    icon: Users,
    title: 'Managers',
    body: 'Unify settlement fragments into one touring OS — from box office receipts to audience skews and financial waterfalls.',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAppContext();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const scrollToTeaser = () => {
    document.getElementById('data-teaser')?.scrollIntoView({ behavior: 'smooth' });
  };

  const openSignIn = () => {
    setAuthMode('signin');
    setAuthOpen(true);
  };

  const handleSubscribe = (tier: PricingTier) => {
    // TODO: Wire to Stripe Checkout Session API (tier → price ID mapping).
    console.warn(`handleSubscribe stub called for tier: ${tier}`);
    setAuthMode('signup');
    setAuthOpen(true);
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    setIsAuthenticated(true);
    navigate('/app/health');
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white font-[Inter,sans-serif] selection:bg-[#2E66FF]/30">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-[#242A35] bg-[#0A0C10]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#2E66FF] flex items-center justify-center">
              <span className="text-xs font-black tracking-tighter">GTI</span>
            </div>
            <span className="text-xs font-bold tracking-tight hidden sm:block">
              Global Touring Intelligence
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={scrollToTeaser}
              className="hidden sm:block text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            >
              Data
            </button>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden sm:block text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={openSignIn}
              className="px-4 py-2 bg-[#1C212B] hover:bg-[#242A35] border border-[#242A35] text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* 1. Hero */}
      <section className="relative px-6 pt-20 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#2E66FF]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5"
          >
            Touring Intelligence for the{' '}
            <span className="text-[#2E66FF]">Modern Artist</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Turn fragmented settlement data into a unified touring OS — verified box office,
            live pacing, and audience intelligence in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14"
          >
            <button
              onClick={scrollToTeaser}
              className="w-full sm:w-auto px-7 py-3 bg-[#2E66FF] hover:bg-[#2558e0] text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-[#2E66FF]/20"
            >
              See the Data
              <ArrowRight size={16} />
            </button>
            <button
              onClick={openSignIn}
              className="w-full sm:w-auto px-7 py-3 bg-transparent hover:bg-[#1C212B] border border-[#242A35] text-sm font-bold rounded-lg transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </motion.div>

          {/* Stat bar — sourced from csvToursData rows */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            {[
              { label: 'Shows Tracked', value: formatNumber(totalShows) },
              { label: 'Gross Tracked', value: formatCompactCurrency(totalGross) },
              { label: 'Artists Monitored', value: formatNumber(uniqueArtists) },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#12151C] border border-[#242A35] rounded-lg px-5 py-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#475569] mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-black font-mono text-white">{stat.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2–3. Live data teaser + blur wall */}
      <LandingDataSection />

      {/* 4. Pricing */}
      <LandingPricing onSubscribe={handleSubscribe} />

      {/* 5. Who it's for */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2E66FF] mb-2">
              Built For
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Who it's for
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AUDIENCE_CARDS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-[#12151C] border border-[#242A35] rounded-xl p-6 hover:border-[#2E66FF]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[#2E66FF]/10 border border-[#2E66FF]/20 flex items-center justify-center text-[#2E66FF] mb-4">
                  <Icon size={18} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="py-20 px-6 bg-[#12151C]/30">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white">Frequently asked questions</h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={item.q}
                className="bg-[#12151C] border border-[#242A35] rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-[#1C212B]/50 transition-colors"
                >
                  <span className="text-sm font-semibold text-white">{item.q}</span>
                  <span className="text-[#2E66FF] text-lg leading-none ml-4 shrink-0">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-sm text-[#94A3B8] leading-relaxed border-t border-[#242A35]/50 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-[#242A35] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#2E66FF] flex items-center justify-center">
              <span className="text-[10px] font-black">GTI</span>
            </div>
            <span className="text-xs text-[#475569]">
              © {new Date().getFullYear()} Global Touring Intelligence
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#475569]">
            <button
              onClick={scrollToTeaser}
              className="hover:text-[#94A3B8] transition-colors cursor-pointer"
            >
              Data
            </button>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-[#94A3B8] transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={openSignIn}
              className="hover:text-[#94A3B8] transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </footer>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
    </div>
  );
}
