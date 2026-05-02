import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { initializeRazorpayPayment } from '../../util/RazorpayService';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

interface Plan {
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

interface UpgradePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlanId?: string;
}

const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({ isOpen, onClose, currentPlanId }) => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
        }
    }, [isOpen]);

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
            // 1. Create Order
            const amount = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const orderResponse = await api.post('/ims-platform-service/api/v1/payments/create-order', {
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
                name: "EduFlow IMS",
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
                        // 3. Verify Payment
                        await api.post('/ims-platform-service/api/v1/payments/verify-payment', {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            tenantId: user.tenantId,
                            planId: plan.id,
                            amount: amount,
                            billingCycle: billingCycle.toUpperCase()
                        });
                        
                        toast.success("Subscription upgraded successfully!", { id: 'payment-verify' });
                        onClose();
                        // Refresh page or update state to reflect new plan
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

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-surface rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-border flex justify-between items-center bg-chrome/50">
                        <div>
                            <h2 className="text-2xl font-bold text-content-primary flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-indigo-600" />
                                Upgrade Your Institution
                            </h2>
                            <p className="text-content-secondary text-sm mt-1">Select a plan that scales with your growth</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors border border-transparent hover:border-border">
                            <X className="w-6 h-6 text-content-muted" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-surface">
                        {/* Billing Toggle */}
                        <div className="flex justify-center mb-10">
                            <div className="bg-chrome p-1 rounded-2xl flex items-center gap-1">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-surface text-indigo-600 shadow-sm' : 'text-content-secondary hover:text-content-primary'}`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-surface text-indigo-600 shadow-sm' : 'text-content-secondary hover:text-content-primary'}`}
                                >
                                    Yearly
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Save 20%</span>
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                                <p className="text-content-secondary font-medium">Fetching best plans for you...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {plans.map((plan) => {
                                    const features = JSON.parse(plan.featuresList || '[]');
                                    const isCurrent = plan.id === currentPlanId;
                                    const isHighlighted = plan.name.toLowerCase().includes('pro');
                                    const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

                                    return (
                                        <div
                                            key={plan.id}
                                            className={`relative flex flex-col p-6 rounded-3xl border-2 transition-all duration-300 ${isHighlighted ? 'border-indigo-600 shadow-xl shadow-indigo-100' : 'border-border hover:border-border'}`}
                                        >
                                            {isHighlighted && (
                                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" /> Recommended
                                                </div>
                                            )}

                                            <div className="mb-6">
                                                <h3 className="text-lg font-bold text-content-primary">{plan.name}</h3>
                                                <div className="flex items-baseline gap-1 mt-2">
                                                    <span className="text-3xl font-black text-content-primary">₹{price.toLocaleString()}</span>
                                                    <span className="text-content-muted text-xs font-medium">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                                                </div>
                                                <p className="text-xs text-content-secondary mt-2 min-h-[32px]">{plan.description}</p>
                                            </div>

                                            <ul className="space-y-3 mb-8 flex-1">
                                                <li className="flex items-start gap-2 text-xs font-semibold text-content-primary">
                                                    <Check className="w-4 h-4 text-green-500 shrink-0" /> Up to {plan.maxStudents} Students
                                                </li>
                                                <li className="flex items-start gap-2 text-xs font-semibold text-content-primary">
                                                    <Check className="w-4 h-4 text-green-500 shrink-0" /> Up to {plan.maxTeachers} Teachers
                                                </li>
                                                {features.map((f: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-xs text-content-secondary">
                                                        <Check className="w-4 h-4 text-slate-300 shrink-0" /> {f}
                                                    </li>
                                                ))}
                                            </ul>

                                            <button
                                                disabled={isCurrent || processingId === plan.id}
                                                onClick={() => handleUpgrade(plan)}
                                                className={`w-full py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                                    isCurrent 
                                                    ? 'bg-chrome text-content-muted cursor-not-allowed' 
                                                    : isHighlighted
                                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                                        : 'bg-surface text-content-primary border border-border hover:bg-chrome'
                                                }`}
                                            >
                                                {processingId === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                                {isCurrent ? 'Current Plan' : 'Select Plan'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-chrome border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2 text-content-muted text-xs font-medium">
                            <ShieldCheck className="w-4 h-4" />
                            Secure 256-bit SSL Encrypted Payment via Razorpay
                        </div>
                        <div className="flex gap-2">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-4 opacity-50" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UpgradePlanModal;
