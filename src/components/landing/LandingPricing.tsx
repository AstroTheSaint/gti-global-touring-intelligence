import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../types';

export type PricingTier = 'insights' | 'pro';

interface LandingPricingProps {
  onSubscribe: (tier: PricingTier) => void;
}

const PLANS: {
  tier: PricingTier;
  name: string;
  price: string;
  period: string;
  description: string;
  highlighted?: boolean;
  features: string[];
}[] = [
  {
    tier: 'insights',
    name: 'Insights',
    price: '$9.99',
    period: '/mo',
    description: 'Essential touring intelligence for emerging teams.',
    features: [
      '[PLACEHOLDER] Feature list for Insights tier — pending spec',
      '[PLACEHOLDER] Box office & pacing access level',
      '[PLACEHOLDER] Export allowance',
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: '$19.99',
    period: '/mo',
    description: 'Full-stack touring OS for agencies and managers.',
    highlighted: true,
    features: [
      '[PLACEHOLDER] Feature list for Pro tier — pending spec',
      '[PLACEHOLDER] Advanced demographics & reach',
      '[PLACEHOLDER] Unlimited exports / API access',
    ],
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
            Plans that scale with your roster
          </h2>
          <p className="text-sm text-[#94A3B8] mt-3">
            Start with verified data. Upgrade when you need the full touring OS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.tier}
              className={cn(
                'rounded-xl border p-6 flex flex-col',
                plan.highlighted
                  ? 'border-[#2E66FF] bg-[#12151C] shadow-[0_0_40px_rgba(46,102,255,0.12)]'
                  : 'border-[#242A35] bg-[#12151C]'
              )}
            >
              {plan.highlighted && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#2E66FF] mb-3">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-2 mb-1">
                <span className="text-3xl font-black text-white font-mono">{plan.price}</span>
                <span className="text-sm text-[#94A3B8]">{plan.period}</span>
              </div>
              <p className="text-xs text-[#94A3B8] mb-6">{plan.description}</p>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-[#94A3B8]">
                    <Check size={14} className="text-[#2E66FF] shrink-0 mt-0.5" />
                    <span className={feature.startsWith('[PLACEHOLDER]') ? 'italic text-[#475569]' : ''}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSubscribe(plan.tier)}
                className={cn(
                  'w-full py-3 rounded-lg text-sm font-bold transition-colors cursor-pointer',
                  plan.highlighted
                    ? 'bg-[#2E66FF] hover:bg-[#2558e0] text-white'
                    : 'bg-[#1C212B] hover:bg-[#242A35] border border-[#242A35] text-white'
                )}
              >
                Get {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
