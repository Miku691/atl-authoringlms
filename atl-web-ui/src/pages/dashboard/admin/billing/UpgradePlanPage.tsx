import React, { useEffect, useState } from 'react';
import api from '../../../../utils/api';
import { motion } from 'framer-motion';
import { Check, Sparkles, Loader2, ShieldCheck, ArrowLeft, Zap, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { initializeRazorpayPayment } from '../../../../util/RazorpayService';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../../store/store';

export interface Plan {
    id: string;
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    currency: string;
    maxStudents: number;
    maxTeachers: number;
    featuresList: string;
}

const UpgradePlanPage: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await api.get('/ims-platform-service/api/v1/platform/public/plans');
            const data = response.data.apiData || response.data;
            setPlans(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to fetch subscription plans");
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (plan: Plan) => {
        if (!user?.tenantId) {
            toast.error("Tenant ID not found. Please log in again.");
            return;
        }

        setProcessingId(plan.id);
        try {
            // 1. Create Order - FIXED API PATH
            const amount = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const orderResponse = await api.post('/ims-platform-service/api/v1/platform/payments/create-order', {
                amount: amount,
                currency: plan.currency,
                tenantId: user.tenantId,
                planId: plan.id,
                billingCycle: billingCycle.toUpperCase()
            });

            const { orderId, keyId, amount: razorpayAmount, currency } = orderResponse.data;

            // 2. Initialize Razorpay
            await initializeRazorpayPayment({
                key: keyId,
                amount: razorpayAmount,
                currency: currency,
                name: "EduMatrix IMS",
                description: `Upgrade to ${plan.name} (${billingCycle})`,
                order_id: orderId,
                prefill: {
                    name: user.username,
                    email: user.email,
                },
                theme: { color: "#4F46E5" },
                handler: async (response: any) => {
                    try {
                        toast.loading("Verifying payment...", { id: 'payment-verify' });
                        // 3. Verify Payment - FIXED API PATH
                        await api.post('/ims-platform-service/api/v1/platform/payments/verify', {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            tenantId: user.tenantId,
                            planId: plan.id,
                            amount: amount,
                            billingCycle: billingCycle.toUpperCase()
                        });
                        
                        toast.success("Subscription upgraded successfully!", { id: 'payment-verify' });
                        // Navigate back to billing page
                        navigate('/billing/subscription');
                        // Optional: trigger a sync
                        window.location.reload();
                    } catch (err) {
                        toast.error("Payment verification failed. Please contact support.", { id: 'payment-verify' });
                    }
                }
            });
        } catch (error: any) {
            console.error("Upgrade error:", error);
            toast.error(error.response?.data?.message || "Failed to initiate upgrade");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-chrome/50">
            {/* Header */}
            <div className="bg-surface border-b border-border sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-chrome rounded-full transition-colors text-content-secondary"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="h-6 w-[1px] bg-chrome"></div>
                        <div>
                            <h1 className="text-xl font-black text-content-primary tracking-tight flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                Upgrade Institution Plan
                            </h1>
                            <p className="text-content-secondary text-xs font-semibold uppercase tracking-wider">Payments & Subscriptions</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-tight">Secure Payment</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Intro Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-surface px-4 py-2 rounded-full border border-border shadow-sm mb-6"
                    >
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-black text-content-primary uppercase tracking-widest">Pricing Plans</span>
                    </motion.div>
                    <h2 className="text-4xl sm:text-5xl font-black text-content-primary tracking-tight mb-4">
                        Scale your institution <span className="text-indigo-600">to new heights.</span>
                    </h2>
                    <p className="text-content-secondary max-w-2xl mx-auto font-medium text-lg">
                        Choose the perfect plan for your needs. Switch billing cycles and enjoy premium features designed for modern education.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="bg-surface p-1.5 rounded-[1.5rem] border border-border shadow-sm flex items-center">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-8 py-3 rounded-[1rem] text-sm font-black transition-all ${billingCycle === 'monthly' ? 'bg-slate-900 text-white shadow-lg' : 'text-content-secondary hover:bg-chrome'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-8 py-3 rounded-[1rem] text-sm font-black transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-slate-900 text-white shadow-lg' : 'text-content-secondary hover:bg-chrome'}`}
                        >
                            Yearly
                            <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">Save 20%</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <Sparkles className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <p className="text-content-muted font-black uppercase tracking-widest text-[10px] mt-6">Loading Available Plans</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => {
                            const features = JSON.parse(plan.featuresList || '[]');
                            const isHighlighted = plan.name.toLowerCase().includes('pro');
                            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`relative flex flex-col p-10 bg-surface rounded-[3rem] border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100 ${isHighlighted ? 'border-indigo-600' : 'border-border'}`}
                                >
                                    {isHighlighted && (
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg shadow-indigo-200">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-10">
                                        <h3 className="text-2xl font-black text-content-primary mb-2">{plan.name}</h3>
                                        <p className="text-content-secondary text-sm font-medium leading-relaxed min-h-[40px]">{plan.description}</p>
                                    </div>

                                    <div className="mb-10">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black text-content-primary italic">₹{price.toLocaleString()}</span>
                                            <span className="text-content-muted font-bold">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-10 flex-1">
                                        <div className="flex items-center gap-3 bg-chrome p-4 rounded-2xl border border-border">
                                            <div className="p-2 bg-surface rounded-xl shadow-sm">
                                                <Zap className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-content-muted uppercase tracking-tighter">Capacity</p>
                                                <p className="text-sm font-black text-content-primary">{plan.maxStudents} Students</p>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-4 space-y-4 border-t border-border">
                                            {features.map((f: string, i: number) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center border border-green-100 shrink-0">
                                                        <Check className="w-3 h-3 text-green-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-content-secondary">{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        disabled={processingId === plan.id}
                                        onClick={() => handleUpgrade(plan)}
                                        className={`w-full py-5 rounded-[1.5rem] text-sm font-black transition-all flex items-center justify-center gap-3 group ${
                                            isHighlighted
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100'
                                                : 'bg-slate-900 text-white hover:bg-slate-800'
                                        }`}
                                    >
                                        {processingId === plan.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Select {plan.name}
                                                <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Secure Payment Note */}
                <div className="mt-16 bg-surface p-8 rounded-[2rem] border border-border text-center">
                    <div className="flex flex-col items-center gap-4 max-w-xl mx-auto">
                        <div className="p-3 bg-indigo-50 rounded-2xl">
                            <ShieldCheck className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h4 className="text-xl font-black text-content-primary tracking-tight">Industrial Grade Security</h4>
                        <p className="text-content-secondary text-sm font-medium leading-relaxed">
                            All transations are encrypted and handled securely by Razorpay. We don't store your card or bank information on our servers.
                        </p>
                        <div className="flex items-center gap-6 mt-4 grayscale opacity-60">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-6" />
                            <div className="h-4 w-[1px] bg-chrome"></div>
                            <span className="text-[10px] font-bold text-content-muted uppercase tracking-[0.2em]">SSL Certified</span>
                        </div>
                    </div>
                </div>

                {/* Refund Policy Note */}
                <div className="mt-8 flex items-center justify-center gap-2 text-content-muted text-xs font-semibold">
                    <Info className="w-3 h-3" />
                    Payments are non-refundable once processed. Please review your selection carefully.
                </div>
            </div>
        </div>
    );
};

export default UpgradePlanPage;
