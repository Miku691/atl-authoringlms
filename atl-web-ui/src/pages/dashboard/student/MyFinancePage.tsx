import React, { useEffect, useState } from 'react';
import {
    DollarSign,
    CreditCard,
    AlertCircle,
    History,
    FileText,
    TrendingDown,
    TrendingUp,
    Download
} from 'lucide-react';
import { financeService } from '../../../api/financeService';
import type { StudentFeeRecord, FinanceSummary, Transaction } from '../../../types/finance';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const MyFinancePage: React.FC = () => {
    const [ledger, setLedger] = useState<StudentFeeRecord[]>([]);
    const [summary, setSummary] = useState<FinanceSummary | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ledgerData, summaryData, transactionData] = await Promise.all([
                    financeService.getMyLedger(),
                    financeService.getMySummary(),
                    financeService.getMyTransactions()
                ]);
                setLedger(ledgerData);
                setSummary(summaryData);
                setTransactions(transactionData);
            } catch (error) {
                console.error('Error fetching finance data:', error);
                toast.error('Failed to load financial records');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDownloadReceipt = async (transactionId: string) => {
        try {
            const blob = await financeService.downloadReceipt(transactionId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt_${transactionId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Failed to download receipt');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'PARTIAL': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'UNPAID': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in px-4 lg:px-0">
            {/* Page Header - Professional & Airy */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Settlement Matrix</span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Finance</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px] flex items-center gap-2 opacity-70">
                        Operational Fee Logistics & Asset Tracking
                    </p>
                </div>
                <div className="flex bg-white px-8 py-5 rounded-[2.5rem] border border-slate-50 shadow-sm items-center gap-5 group hover:shadow-xl transition-all duration-500">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100/50 group-hover:rotate-12 transition-transform duration-500">
                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Account Protocol</p>
                         <p className="text-xs font-black text-emerald-600 mt-1 uppercase italic tracking-tight">Active Settlement</p>
                    </div>
                </div>
            </div>

            {/* Summary Grid - Sophisticated Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4 lg:px-0">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none italic">Net Liability</h3>
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                             <DollarSign className="w-5 h-5 text-slate-300" />
                        </div>
                    </div>
                    <div className="space-y-3 relative z-10">
                        <p className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">₹{summary?.totalDue?.toLocaleString() ?? '0'}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none opacity-60">Global Accumulated Due</p>
                    </div>
                    <div className="absolute -right-6 -bottom-6 text-8xl font-black text-slate-50 italic opacity-40 select-none group-hover:scale-110 transition-transform duration-700">Σ</div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none italic">Cleared Assets</h3>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100/50 group-hover:scale-110 transition-transform">
                             <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                    <div className="space-y-3 relative z-10">
                        <p className="text-4xl font-black text-emerald-600 italic tracking-tighter uppercase leading-none">₹{summary?.totalPaid?.toLocaleString() ?? '0'}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none opacity-60">Verified Collections</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-emerald-500/5 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-700"></div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none italic">Deficit Balance</h3>
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100/50 group-hover:scale-110 transition-transform">
                             <TrendingDown className="w-5 h-5 text-rose-400" />
                        </div>
                    </div>
                    <div className="space-y-3 relative z-10">
                        <p className="text-4xl font-black text-rose-600 italic tracking-tighter uppercase leading-none">₹{summary?.balance?.toLocaleString() ?? '0'}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none opacity-60">Outstanding Dues</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-rose-500/5 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-700"></div>
                </div>

                <div className="bg-[#0A0C10] p-10 rounded-[3rem] border border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-700">
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none italic font-bold">Queue Count</h3>
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                             <FileText className="w-5 h-5 text-amber-500" />
                        </div>
                    </div>
                    <div className="space-y-3 relative z-10">
                        <p className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{summary?.pendingInvoices ?? '0'}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none opacity-60 font-bold">Pending Invoices</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-amber-500/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-700"></div>
                </div>
            </div>

            {/* Detailed Ledger - Modern Table Architecture */}
            <div className="bg-white rounded-[4rem] border border-slate-50 shadow-sm overflow-hidden group/ledger hover:shadow-2xl transition-all duration-700">
                <div className="p-10 lg:p-12 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between bg-white relative overflow-hidden">
                    <div className="space-y-2 relative z-10">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Accumulated Inventory</h3>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Fee Ledger Index</p>
                    </div>
                    <div className="flex items-center gap-6 mt-6 md:mt-0 relative z-10">
                         <div className="px-6 py-2.5 bg-slate-50 rounded-full border border-slate-100 flex items-center gap-4 group-hover:bg-white transition-colors duration-500">
                              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse shadow-[0_0_8px_indigo-600]"></div>
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">FY 2026 Operational</span>
                         </div>
                    </div>
                    {/* Abstract background highlight */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-50/50 to-transparent pointer-events-none"></div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/30 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                            <tr>
                                <th className="px-12 py-8 font-black italic">Category Mapping</th>
                                <th className="px-12 py-8 font-black italic">Temporal Due</th>
                                <th className="px-12 py-8 font-black italic">Amount Allocated</th>
                                <th className="px-12 py-8 font-black italic">Settled Assets</th>
                                <th className="px-12 py-8 font-black italic">Current Deficit</th>
                                <th className="px-12 py-8 font-black text-center italic">Node Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                            {ledger.length > 0 ? (
                                ledger.map((record) => (
                                    <tr key={record.id} className="group/row hover:bg-slate-50 transition-all duration-500">
                                        <td className="px-12 py-8">
                                            <div className="flex items-center gap-6 group-hover/row:translate-x-2 transition-transform duration-500">
                                                <div className="w-14 h-14 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/row:bg-slate-900 group-hover/row:text-white group-hover/row:rotate-6 transition-all duration-500 shadow-sm overflow-hidden relative">
                                                    <CreditCard className="w-6 h-6 relative z-10" />
                                                    <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                                                </div>
                                                <div>
                                                    <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1.5 italic">Operational Module</p>
                                                    <span className="text-sm lg:text-base font-black text-slate-900 uppercase tracking-tight italic">{record.feeHeadName}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-8">
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-slate-700 uppercase tracking-tight italic">{format(new Date(record.dueDate), 'MMM dd, yyyy')}</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none italic opacity-50">Log point 8229</p>
                                            </div>
                                        </td>
                                        <td className="px-12 py-8">
                                            <span className="font-black text-slate-900 text-base italic tracking-tighter uppercase leading-none">₹{record.amountDue?.toLocaleString() ?? '0'}</span>
                                        </td>
                                        <td className="px-12 py-8">
                                            <span className="text-emerald-600 font-black text-base italic tracking-tighter uppercase leading-none">₹{record.amountPaid?.toLocaleString() ?? '0'}</span>
                                        </td>
                                        <td className="px-12 py-8">
                                            <span className="text-rose-500 font-black text-base italic tracking-tighter uppercase leading-none">₹{record.balance?.toLocaleString() ?? '0'}</span>
                                        </td>
                                        <td className="px-12 py-8 text-center">
                                            <span className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] italic border-2 transition-all duration-500 shadow-sm ${getStatusColor(record.status)} group-hover/row:scale-105`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-12 py-32 text-center">
                                        <div className="flex flex-col items-center opacity-30 grayscale group hover:opacity-60 transition-all duration-700">
                                            <div className="p-12 bg-slate-50 rounded-full mb-8 border border-slate-100 group-hover:rotate-12 transition-transform">
                                                <AlertCircle className="w-14 h-14 text-slate-200" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Inventory baseline empty • System Ready</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transactions Log - Premium Audit Feed */}
            <div className="bg-white rounded-[4rem] border border-slate-50 shadow-sm overflow-hidden group/tx hover:shadow-2xl transition-all duration-700">
                <div className="p-10 lg:p-12 border-b border-slate-50 flex items-center justify-between bg-white">
                    <div className="space-y-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">System Audit Trail</h3>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Transaction Feed</p>
                    </div>
                    <History className="w-8 h-8 text-slate-100 group-hover/tx:rotate-12 transition-transform duration-700" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/30 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                            <tr>
                                <th className="px-12 py-8 font-black italic">Temporal Marker</th>
                                <th className="px-12 py-8 font-black italic">Acquisition Channel</th>
                                <th className="px-12 py-8 font-black italic">Internal identifier</th>
                                <th className="px-12 py-8 font-black text-right italic">Settlement Allocation</th>
                                <th className="px-12 py-8 font-black text-center italic">Protocol Export</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                            {transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="group/txrow hover:bg-slate-50 transition-all duration-500">
                                        <td className="px-12 py-8">
                                            <div className="space-y-1 group-hover/txrow:translate-x-2 transition-transform duration-500">
                                                <p className="text-xs font-black text-slate-700 uppercase tracking-tight italic">{format(new Date(tx.transactionDate), 'MMM dd, yyyy')}</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic opacity-50">{format(new Date(tx.transactionDate), 'HH:mm:ss')}</p>
                                            </div>
                                        </td>
                                        <td className="px-12 py-8">
                                            <span className="px-5 py-2.5 bg-white text-slate-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] italic border border-slate-100 group-hover/txrow:bg-slate-900 group-hover/txrow:text-white transition-all duration-500 shadow-sm border-2">
                                                {tx.paymentMode}
                                            </span>
                                        </td>
                                        <td className="px-12 py-8">
                                            <code className="text-[10px] font-mono text-slate-300 group-hover/txrow:text-slate-500 transition-colors uppercase tracking-widest bg-slate-50/50 px-3 py-1 rounded-lg">
                                                {tx.referenceNumber || 'INTERNAL-TXN-G8'}
                                            </code>
                                        </td>
                                        <td className="px-12 py-8 text-right">
                                            <span className="font-black text-emerald-600 italic text-lg tracking-tighter uppercase leading-none group-hover/txrow:scale-110 transition-transform inline-block">₹{tx.amount?.toLocaleString() ?? '0'}</span>
                                        </td>
                                        <td className="px-12 py-8 text-center">
                                            <button
                                                onClick={() => handleDownloadReceipt(tx.id)}
                                                className="w-14 h-14 bg-white text-indigo-600 rounded-2xl border border-slate-100 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:rotate-12 transition-all duration-500 mx-auto active:scale-90 shadow-sm group-hover/txrow:shadow-xl"
                                                title="Fetch Manifest"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-12 py-32 text-center">
                                        <div className="flex flex-col items-center opacity-30 grayscale group hover:opacity-60 transition-all duration-700">
                                            <div className="p-12 bg-slate-50 rounded-full mb-8 border border-slate-100 group-hover:rotate-12 transition-transform">
                                                <History className="w-14 h-14 text-slate-200" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Zero activity baseline detected</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyFinancePage;
