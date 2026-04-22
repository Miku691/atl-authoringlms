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
            <div className="py-24 text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-10 w-64 bg-gray-200 rounded mb-4" />
                    <div className="h-4 w-48 bg-gray-200 rounded mb-12" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1200px] px-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[450px] bg-white rounded-[12px] border border-gray-200" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

  return (
    <section id="pricing" className="py-24" style={{ background: '#F7F9FF' }}>
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
            className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] mb-4 px-3 py-1 rounded-full"
            style={{ background: '#EBF1FE', color: '#2A6DF4' }}
          >
            Pricing
          </span>
          <h2 className="text-[36px] lg:text-[42px] font-bold leading-[1.18] tracking-[-0.01em] mb-4" style={{ color: '#0F1D3A' }}>
            Simple, Transparent Pricing
          </h2>
          <p className="text-[16px] leading-relaxed mb-7" style={{ color: '#5A6B88' }}>
            No hidden fees. Choose a plan that fits your institution's size and needs.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full" style={{ background: '#EBF1FE' }}>
            <span
              className="text-[13px] font-semibold cursor-pointer transition-colors"
              style={{ color: annual ? '#8FA3C0' : '#2A6DF4' }}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </span>
            <button
              id="pricing-billing-toggle"
              onClick={() => setAnnual(!annual)}
              className="relative w-11 h-6 rounded-full transition-colors duration-200"
              style={{ background: annual ? '#2A6DF4' : '#C7D8FC' }}
              aria-label="Toggle billing cycle"
            >
              <div
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                style={{ left: annual ? '24px' : '4px' }}
              />
            </button>
            <span
              className="text-[13px] font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
              style={{ color: annual ? '#2A6DF4' : '#8FA3C0' }}
              onClick={() => setAnnual(true)}
            >
              Annual
              {annual && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#16A34A' }}>
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
                  background: '#FFFFFF',
                  border: isHighlighted ? '2px solid #2A6DF4' : '1px solid #E2E8F8',
                  boxShadow: isHighlighted
                    ? '0 16px 48px rgba(42,109,244,0.15)'
                    : '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {/* Most popular badge */}
                {isHighlighted && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-bold text-white"
                    style={{ background: '#2A6DF4' }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                )}

                {/* Plan name & price */}
                <div className="mb-7">
                  <h3 className="text-[18px] font-bold mb-1" style={{ color: '#0F1D3A' }}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1.5 mt-3 mb-3">
                    <span className="text-[42px] font-extrabold leading-none tracking-tight" style={{ color: '#0F1D3A' }}>
                      {currencySymbol}{price.toLocaleString()}
                    </span>
                    <span className="text-[14px] font-medium" style={{ color: '#8FA3C0' }}>/month</span>
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: '#5A6B88' }}>{plan.description}</p>
                </div>

                {/* Feature list */}
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((feature: string) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: isHighlighted ? '#EBF1FE' : '#F7F9FF' }}
                      >
                        <Check className="w-3 h-3" style={{ color: isHighlighted ? '#2A6DF4' : '#8FA3C0' }} />
                      </div>
                      <span className="text-[13px] font-medium" style={{ color: '#5A6B88' }}>{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3">
                    <div
                        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: isHighlighted ? '#EBF1FE' : '#F7F9FF' }}
                    >
                        <Check className="w-3 h-3" style={{ color: isHighlighted ? '#2A6DF4' : '#8FA3C0' }} />
                    </div>
                    <span className="text-[13px] font-medium" style={{ color: '#5A6B88' }}>Up to {plan.maxStudents} Students</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div
                        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: isHighlighted ? '#EBF1FE' : '#F7F9FF' }}
                    >
                        <Check className="w-3 h-3" style={{ color: isHighlighted ? '#2A6DF4' : '#8FA3C0' }} />
                    </div>
                    <span className="text-[13px] font-medium" style={{ color: '#5A6B88' }}>Up to {plan.maxTeachers} Teachers</span>
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
                          background: '#2A6DF4',
                          color: '#FFFFFF',
                          boxShadow: '0 4px 16px rgba(42,109,244,0.35)',
                        }
                      : {
                          background: '#F7F9FF',
                          color: '#0F1D3A',
                          border: '1px solid #E2E8F8',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (isHighlighted) {
                      (e.currentTarget as HTMLButtonElement).style.background = '#1A5CE0';
                    } else {
                      (e.currentTarget as HTMLButtonElement).style.background = '#EBF1FE';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isHighlighted) {
                      (e.currentTarget as HTMLButtonElement).style.background = '#2A6DF4';
                    } else {
                      (e.currentTarget as HTMLButtonElement).style.background = '#F7F9FF';
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
