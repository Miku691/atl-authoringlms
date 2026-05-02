import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

interface Plan {
    id: string;
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    currency: string;
    maxStudents: number;
    maxTeachers: number;
    featuresList: string; // JSON string
    highlight?: boolean;
}

const Pricing: React.FC = () => {
    const navigate = useNavigate();
    const [annual, setAnnual] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await api.get('/ims-platform-service/api/v1/platform/public/plans');
                // Backend uses ApiResponse wrapper { status, apiData, ... }
                const plansData = response.data.apiData || response.data;
                setPlans(Array.isArray(plansData) ? plansData : []);
            } catch (error) {
                console.error("Failed to fetch plans:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    if (loading) {
        return (
            <div className="py-24 text-center" style={{ background: 'var(--bg-chrome)' }}>
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-10 w-64 rounded mb-4" style={{ background: 'var(--border)' }} />
                    <div className="h-4 w-48 rounded mb-12" style={{ background: 'var(--border)' }} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1200px] px-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[450px] rounded-[12px] border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

  return (
    <section id="pricing" className="py-24" style={{ background: 'var(--bg-chrome)' }}>
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-[560px] mx-auto mb-12"
        >
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] mb-4 px-3 py-1 rounded-full border"
            style={{ background: 'var(--brand-subtle)', color: 'var(--brand)', borderColor: 'var(--brand-border)' }}
          >
            Pricing
          </span>
          <h2 className="text-[36px] lg:text-[42px] font-bold leading-[1.18] tracking-[-0.01em] mb-4" style={{ color: 'var(--text-primary)' }}>
            Simple, Transparent Pricing
          </h2>
          <p className="text-[16px] leading-relaxed mb-7" style={{ color: 'var(--text-secondary)' }}>
            No hidden fees. Choose a plan that fits your institution's size and needs.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <span
              className="text-[13px] font-semibold cursor-pointer transition-colors"
              style={{ color: annual ? 'var(--text-muted)' : 'var(--brand)' }}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </span>
            <button
              id="pricing-billing-toggle"
              onClick={() => setAnnual(!annual)}
              className="relative w-11 h-6 rounded-full transition-colors duration-200"
              style={{ background: annual ? 'var(--brand)' : 'var(--text-muted)' }}
              aria-label="Toggle billing cycle"
            >
              <div
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                style={{ left: annual ? '24px' : '4px' }}
              />
            </button>
            <span
              className="text-[13px] font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
              style={{ color: annual ? 'var(--brand)' : 'var(--text-muted)' }}
              onClick={() => setAnnual(true)}
            >
              Annual
              {annual && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(22,163,74,0.1)', color: '#16A34A', border: '1px solid rgba(22,163,74,0.2)' }}>
                  Save 20%
                </span>
              )}
            </span>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, index) => {
            const features = JSON.parse(plan.featuresList || '[]');
            const isHighlighted = plan.highlight || plan.name.toLowerCase() === 'professional' || plan.name.toLowerCase() === 'pro';
            const price = annual ? plan.priceYearly : plan.priceMonthly;
            const currencySymbol = plan.currency === 'INR' ? '₹' : '$';

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.55 }}
                className="relative flex flex-col rounded-[12px] p-8"
                style={{
                  background: 'var(--bg-surface)',
                  border: isHighlighted ? '2px solid var(--brand)' : '1px solid var(--border)',
                  boxShadow: isHighlighted
                    ? '0 16px 48px var(--brand-shadow, rgba(42,109,244,0.15))'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {/* Most popular badge */}
                {isHighlighted && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-bold text-white shadow-md"
                    style={{ background: 'var(--brand)' }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                )}

                {/* Plan name & price */}
                <div className="mb-7">
                  <h3 className="text-[18px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1.5 mt-3 mb-3">
                    <span className="text-[42px] font-extrabold leading-none tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      {currencySymbol}{price.toLocaleString()}
                    </span>
                    <span className="text-[14px] font-medium" style={{ color: 'var(--text-muted)' }}>/month</span>
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{plan.description}</p>
                </div>

                {/* Feature list */}
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((feature: string) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: isHighlighted ? 'var(--brand-subtle)' : 'var(--bg-surface-2)' }}
                      >
                        <Check className="w-3 h-3" style={{ color: isHighlighted ? 'var(--brand)' : 'var(--text-muted)' }} />
                      </div>
                      <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3">
                    <div
                        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: isHighlighted ? 'var(--brand-subtle)' : 'var(--bg-surface-2)' }}
                    >
                        <Check className="w-3 h-3" style={{ color: isHighlighted ? 'var(--brand)' : 'var(--text-muted)' }} />
                    </div>
                    <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>Up to {plan.maxStudents} Students</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div
                        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: isHighlighted ? 'var(--brand-subtle)' : 'var(--bg-surface-2)' }}
                    >
                        <Check className="w-3 h-3" style={{ color: isHighlighted ? 'var(--brand)' : 'var(--text-muted)' }} />
                    </div>
                    <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>Up to {plan.maxTeachers} Teachers</span>
                  </li>
                </ul>

                {/* CTA */}
                <button
                  id={`pricing-cta-${plan.name.toLowerCase()}`}
                  onClick={() => navigate(plan.name === 'Enterprise' ? '#contact' : `/register-institute?plan=${encodeURIComponent(plan.name)}`)}
                  className="w-full py-3.5 rounded-[10px] text-[14px] font-semibold flex items-center justify-center gap-2 group transition-all duration-150"
                  style={
                    isHighlighted
                      ? {
                          background: 'var(--brand)',
                          color: '#FFFFFF',
                          boxShadow: '0 4px 16px rgba(42,109,244,0.30)',
                        }
                      : {
                          background: 'var(--bg-surface-2)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (isHighlighted) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-hover)';
                    } else {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-subtle)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isHighlighted) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand)';
                    } else {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-2)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                    }
                  }}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
