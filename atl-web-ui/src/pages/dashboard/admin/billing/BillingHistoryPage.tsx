import React, { useState, useEffect } from 'react';
import { 
    FileText, 
    Download, 
    Search, 
    Filter, 
    CreditCard,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronDown,
    ArrowUpRight
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import api from '../../../../utils/api';
import toast from 'react-hot-toast';

interface PaymentRecord {
    id: string;
    planName: string;
    amount: number;
    currency: string;
    status: string;
    razorpayPaymentId: string;
    createdAt: string;
}

const BillingHistoryPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user?.tenantId) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/ims-platform-service/api/v1/platform/payments/history/${user?.tenantId}`);
            setPayments(res.data.apiData || res.data || []);
        } catch (error) {
            console.error("Failed to fetch payment history", error);
            toast.error("Could not load billing history");
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status.toUpperCase()) {
            case 'SUCCESS':
                return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: CheckCircle2 };
            case 'PENDING':
                return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: Clock };
            case 'FAILED':
                return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', icon: XCircle };
            default:
                return { bg: 'bg-chrome', text: 'text-content-secondary', border: 'border-border', icon: FileText };
        }
    };

    const filteredPayments = payments.filter(p => 
        p.planName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-content-primary tracking-tight">Billing History</h1>
                    <p className="text-content-secondary font-medium mt-1">Transaction records for your institution</p>
                </div>
                <button 
                    onClick={fetchHistory}
                    className="px-6 py-3 bg-surface hover:bg-chrome border border-border text-content-primary rounded-2xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                    Refresh Records
                </button>
            </div>

            {/* Table Control Panel */}
            <div className="bg-surface p-4 rounded-[2rem] border border-border shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
                    <input 
                        type="text" 
                        placeholder="Search by plan or payment ID..."
                        className="w-full pl-11 pr-4 py-3 bg-chrome border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none px-4 py-2.5 bg-chrome border border-border rounded-xl text-xs font-black text-content-secondary uppercase flex items-center justify-center gap-2 hover:bg-chrome transition-colors">
                        <Filter className="w-3.5 h-3.5" /> Filter
                    </button>
                    <button className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-black text-indigo-600 uppercase flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors">
                        <FileText className="w-3.5 h-3.5" /> Export PDF
                    </button>
                </div>
            </div>

            {/* Transaction List */}
            <div className="bg-surface rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-chrome border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-black text-content-muted uppercase tracking-widest">Transaction Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-content-muted uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-content-muted uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-content-muted uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-content-muted uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                            <p className="text-xs font-black text-content-muted uppercase tracking-widest">Analyzing records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-6 bg-chrome rounded-full">
                                                <CreditCard className="w-12 h-12 text-slate-200" />
                                            </div>
                                            <div className="max-w-xs mx-auto">
                                                <p className="text-sm font-black text-content-primary uppercase">No History Found</p>
                                                <p className="text-xs font-medium text-content-muted mt-1">
                                                    You haven't made any subscription payments yet. Start by upgrading your plan.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((item) => {
                                    const styles = getStatusStyles(item.status);
                                    return (
                                        <tr key={item.id} className="group hover:bg-chrome/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl ${styles.bg}`}>
                                                        <CreditCard className={`w-5 h-5 ${styles.text}`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-content-primary leading-tight">{item.planName}</p>
                                                        <p className="text-[10px] font-bold text-content-muted uppercase tracking-tight mt-1">ID: {item.razorpayPaymentId || item.id.substring(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-bold text-content-primary">{new Date(item.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                <p className="text-[10px] font-medium text-content-muted mt-0.5">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-content-primary">{item.currency} {new Intl.NumberFormat().format(item.amount)}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${styles.bg} ${styles.text} ${styles.border}`}>
                                                    <styles.icon className="w-3 h-3" />
                                                    {item.status}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <button className="p-2 hover:bg-surface rounded-lg border border-transparent hover:border-border transition-all text-content-muted hover:text-indigo-600">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 hover:bg-surface rounded-lg border border-transparent hover:border-border transition-all text-content-muted hover:text-indigo-600">
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BillingHistoryPage;
