import React, { useEffect, useState } from 'react';
import { 
    Tag, 
    UserCheck, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Search, 
    Filter,
    ArrowUpRight,
    FileText,
    AlertCircle,
    User
} from 'lucide-react';
import { financeService } from '../../../../api/financeService';
import toast from 'react-hot-toast';
import { useCurrency } from '../../../../context/CurrencyContext';

const ConcessionWorkflowPage: React.FC = () => {
    const { format } = useCurrency();
    const [concessions, setConcessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'history'>('pending');

    // Mocking some professional data for the workflow demonstration
    const mockPendingConcessions = [
        { 
            id: 'c1', 
            studentName: 'Aarav Sharma', 
            studentId: 'ST-2023-001', 
            discountName: 'Merit Scholarship', 
            value: '50%', 
            requestedDate: '2023-10-15', 
            reason: 'Top 1% in entrance exam',
            status: 'PENDING'
        },
        { 
            id: 'c2', 
            studentName: 'Isha Patel', 
            studentId: 'ST-2023-042', 
            discountName: 'Sibling Discount', 
            value: '₹5,000', 
            requestedDate: '2023-10-18', 
            reason: 'Brother enrolled in Grade 5',
            status: 'PENDING'
        }
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            await financeService.getFeeDiscounts();
            // In a real scenario, we'd fetch pending concessions from a dedicated API
            setConcessions(mockPendingConcessions);
        } catch (error) {
            toast.error('Failed to load concession workflow data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = (id: string, action: 'APPROVE' | 'REJECT') => {
        toast.success(`${action === 'APPROVE' ? 'Concession Granted' : 'Request Declined'}`);
        setConcessions(prev => prev.filter(c => c.id !== id));
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Initializing Workflow Engine...</div>;

    return (
        <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Tag className="text-indigo-600" />
                        Concession Workflow
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Professional approval pipeline for institutional fee discounts and merits.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl">
                    <AlertCircle className="text-indigo-600" size={18} />
                    <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">{concessions.length} Pending Approval</span>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex space-x-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit">
                    {(['pending', 'active', 'history'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search Student..." 
                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all text-sm font-bold"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 shadow-sm">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Work Item List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeTab === 'pending' && concessions.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Tag size={120} />
                        </div>
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 tracking-tight">{item.studentName}</h3>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.studentId}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{item.value.includes('%') ? item.value : format(parseFloat(item.value.replace(/[^0-9.]/g, '')))} OFF</span>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-tighter uppercase">{item.discountName}</p>
                                </div>
                            </div>

                            <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText size={14} className="text-gray-400" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason for Request</span>
                                </div>
                                <p className="text-sm text-gray-600 font-medium leading-relaxed italic">"{item.reason}"</p>
                                <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                                    <Clock size={14} />
                                    Requested: {item.requestedDate}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-auto relative z-10">
                                <button 
                                    onClick={() => handleAction(item.id, 'REJECT')}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-rose-600 bg-rose-50 hover:bg-rose-100 border border-transparent transition-all text-xs font-black uppercase tracking-widest"
                                >
                                    <XCircle size={16} />
                                    Decline
                                </button>
                                <button 
                                    onClick={() => handleAction(item.id, 'APPROVE')}
                                    className="flex-[2] flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all text-xs font-black uppercase tracking-widest"
                                >
                                    <CheckCircle2 size={16} />
                                    Grant Concession
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {activeTab === 'pending' && concessions.length === 0 && (
                    <div className="lg:col-span-2 py-32 text-center">
                        <UserCheck size={64} className="mx-auto text-gray-100 mb-6" />
                        <h4 className="text-gray-400 font-bold text-2xl uppercase tracking-tighter">Queue Clear</h4>
                        <p className="text-gray-400 text-sm font-medium mt-2">All concession requests have been processed.</p>
                    </div>
                )}
                
                {activeTab !== 'pending' && (
                    <div className="lg:col-span-2 py-32 text-center bg-white border border-gray-100 rounded-3xl border-dashed">
                        <Clock size={48} className="mx-auto text-gray-200 mb-4" />
                        <h4 className="text-gray-400 font-bold text-lg italic">View coming soon in Phase 17</h4>
                    </div>
                )}
            </div>
            
            {/* Recommendation Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-700/50 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30">
                                <ArrowUpRight size={20} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">Advanced Control Engine</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight mb-4">Financial Guardrails & Merit Incentives</h2>
                        <p className="text-indigo-100/70 text-lg leading-relaxed font-medium">
                            Our concession workflow ensures institutional integrity by requiring multi-level validation before discounts are applied to the general ledger.
                        </p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl min-w-[240px]">
                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-4">Quick Statistics</p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl">
                                <span className="text-xs font-bold">Approval Rate</span>
                                <span className="text-emerald-400 font-black">84%</span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl">
                                <span className="text-xs font-bold">Avg. Turnaround</span>
                                <span className="text-indigo-300 font-black">1.2d</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConcessionWorkflowPage;
