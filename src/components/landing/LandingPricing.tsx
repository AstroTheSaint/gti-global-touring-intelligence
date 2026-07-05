import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../types';

export type PricingPlan = 'monthly' | 'annual';

interface LandingPricingProps {
  onSubscribe: (plan: PricingPlan) => void;
}

const FEATURES = [
  'Full global touring database — 300+ shows tracked',
  'Real-time box office, gross, and sell-through by market',
  'Social audience intelligence for every tour',
  'Verified artist & tour rankings',
  'Spreadsheet exports',
];

const BILLING_OPTIONS: {
  plan: PricingPlan;
  name: string;
  price: string;
  period: string;
  subtext: string;
  cta: string;
  badge?: string;
  bestValue?: boolean;
}[] = [
  {
    plan: 'monthly',
    name: 'Monthly',
    price: '$19.99',
    period: '/ month',
    badge: '3-day free trial',
    subtext: 'Then $19.99/mo. Cancel anytime.',
    cta: 'Start Free Trial',
  },
  {
    plan: 'annual',
    name: 'Annual',
    price: '$200',
    period: '/ year',
    bestValue: true,
    subtext: 'Save $39.88 vs monthly. Billed once annually.',
    cta: 'Get Annual',
  },
];

export default function LandingPricing({ onSubscribe }: LandingPricingProps) {
  return (
    <section id="pricing" className="py-20 px-6 bg-[#12151C]/40">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2E66FF] mb-2">
            Pricing
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            One product. Two ways to pay.
          </h2>
          <p className="text-sm text-[#94A3B8] mt-3">
            Full touring intelligence — start with a 3-day free trial on any plan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BILLING_OPTIONS.map((option) => (
            <div
              key={option.plan}
              className={cn(
                'rounded-xl border p-6 flex flex-col',
                option.bestValue
                  ? 'border-[#2E66FF] bg-[#12151C] shadow-[0_0_40px_rgba(46,102,255,0.12)]'
                  : 'border-[#242A35] bg-[#12151C]'
              )}
            >
              <div className="flex items-center gap-2 mb-3 min-h-[20px]">
                {option.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#2E66FF] bg-[#2E66FF]/10 border border-[#2E66FF]/25 px-2 py-0.5 rounded-full">
                    {option.badge}
                  </span>
                )}
                {option.bestValue && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-full">
                    Best Value
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white">{option.name}</h3>
              <div className="flex items-baseline gap-1 mt-2 mb-1">
                <span className="text-3xl font-black text-white font-mono">{option.price}</span>
                <span className="text-sm text-[#94A3B8]">{option.period}</span>
              </div>
              <p className="text-xs text-[#94A3B8] mb-6">{option.subtext}</p>

              <ul className="space-y-2.5 mb-8 flex-1">
                {FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-[#94A3B8]">
                    <Check size={14} className="text-[#2E66FF] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSubscribe(option.plan)}
                className={cn(
                  'w-full py-3 rounded-lg text-sm font-bold transition-colors cursor-pointer',
                  option.bestValue
                    ? 'bg-[#2E66FF] hover:bg-[#2558e0] text-white'
                    : 'bg-[#1C212B] hover:bg-[#242A35] border border-[#242A35] text-white'
                )}
              >
                {option.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[#94A3B8] mt-8 max-w-lg mx-auto leading-relaxed">
          3-day free trial on all plans. No charge today. Cancel before day 3 and pay nothing.
        </p>
      </div>
    </section>
  );
}
