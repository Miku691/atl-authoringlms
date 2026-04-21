import React, { useEffect, useState } from 'react';
import {
    CreditCard,
    AlertCircle,
    History,
    FileText,
    TrendingDown,
    TrendingUp,
    Download,
    Loader2,
    CheckCircle2
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

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'PAID':    return { bg: 'bg-[#dae2ff]', text: 'text-[#0054d1]', dot: 'bg-[#0054d1]' };
            case 'PARTIAL': return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
            case 'UNPAID':  return { bg: 'bg-[#ffdad6]', text: 'text-[#ba1a1a]', dot: 'bg-[#ba1a1a]' };
            default:        return { bg: 'bg-[#eceef4]', text: 'text-[#424655]', dot: 'bg-[#424655]' };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2a6df4]" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">

            {/* ── Page Header ── */}
            <div className="rounded-2xl bg-[#f1f3f9] p-8 md:p-10 relative overflow-hidden">
                <div className="relative z-10">
                    <span className="text-[10px] font-semibold text-[#3c5ba9] uppercase tracking-widest">Financial Ledger</span>
                    <h1 className="mt-2 text-3xl font-bold text-[#1a3d8a]">My Finance</h1>
                    <p className="text-sm text-[#424655] mt-1">Fee records, transactions, and payment status</p>
                </div>
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#2a6df4]/8 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* ── 3 Summary KPI Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Fees */}
                <div className="group bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(26,61,138,0.1)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">Total Fees</p>
                        <div className="w-9 h-9 rounded-xl bg-[#f1f3f9] flex items-center justify-center">
                            <FileText className="w-4 h-4 text-[#424655]" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-[#181c20]">₹{summary?.totalDue?.toLocaleString() ?? '0'}</p>
                    <p className="text-xs text-[#64748b] mt-2">Total amount due</p>
                </div>

                {/* Amount Paid */}
                <div className="group bg-white rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(26,61,138,0.1)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">Amount Paid</p>
                        <div className="w-9 h-9 rounded-xl bg-[#dae2ff] flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-[#0054d1]" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-[#0054d1]">₹{summary?.totalPaid?.toLocaleString() ?? '0'}</p>
                    <p className="text-xs text-[#64748b] mt-2">Verified payments</p>
                </div>

                {/* Outstanding Balance */}
                <div className={`group rounded-2xl p-6 shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(26,61,138,0.1)] transition-all duration-300 ${
                    (summary?.balance ?? 0) > 0 ? 'bg-gradient-to-br from-[#9e3f00] to-[#c65100] text-white' : 'bg-white'
                }`}>
                    <div className="flex items-center justify-between mb-5">
                        <p className={`text-[10px] font-semibold uppercase tracking-widest ${(summary?.balance ?? 0) > 0 ? 'text-white/70' : 'text-[#64748b]'}`}>
                            Outstanding
                        </p>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${(summary?.balance ?? 0) > 0 ? 'bg-white/20' : 'bg-[#ffdad6]'}`}>
                            {(summary?.balance ?? 0) > 0
                                ? <TrendingDown className="w-4 h-4 text-white" />
                                : <CheckCircle2 className="w-4 h-4 text-[#0054d1]" />
                            }
                        </div>
                    </div>
                    <p className={`text-3xl font-bold ${(summary?.balance ?? 0) > 0 ? 'text-white' : 'text-[#0054d1]'}`}>
                        {(summary?.balance ?? 0) > 0 ? `₹${summary?.balance?.toLocaleString()}` : 'Cleared'}
                    </p>
                    <p className={`text-xs mt-2 ${(summary?.balance ?? 0) > 0 ? 'text-white/70' : 'text-[#64748b]'}`}>
                        {(summary?.balance ?? 0) > 0 ? 'Balance due' : 'All payments complete'}
                    </p>
                </div>
            </div>

            {/* ── Fee Ledger Table ── */}
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#f1f3f9] flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest mb-1">Fee Structure</p>
                        <h3 className="text-base font-bold text-[#181c20]">Fee Ledger</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#2a6df4] animate-pulse" />
                        <span className="text-xs text-[#64748b] font-medium">FY 2026</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#f7f9ff] text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">
                                <th className="px-6 py-4 font-semibold">Fee Type</th>
                                <th className="px-6 py-4 font-semibold">Due Date</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Paid</th>
                                <th className="px-6 py-4 font-semibold">Balance</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ledger.length > 0 ? (
                                ledger.map((record) => {
                                    const statusConfig = getStatusConfig(record.status);
                                    return (
                                        <tr key={record.id} className="border-t border-[#f7f9ff] hover:bg-[#f7f9ff] transition-colors duration-150">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-[#f1f3f9] flex items-center justify-center shrink-0">
                                                        <CreditCard className="w-4 h-4 text-[#424655]" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-[#181c20]">{record.feeHeadName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-[#424655]">{format(new Date(record.dueDate), 'MMM dd, yyyy')}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-[#181c20]">₹{record.amountDue?.toLocaleString() ?? '0'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-[#0054d1]">₹{record.amountPaid?.toLocaleString() ?? '0'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-semibold ${(record.balance ?? 0) > 0 ? 'text-[#ba1a1a]' : 'text-[#0054d1]'}`}>
                                                    ₹{record.balance?.toLocaleString() ?? '0'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 bg-[#f1f3f9] rounded-2xl flex items-center justify-center">
                                                <AlertCircle className="w-7 h-7 text-[#c2c6d7]" />
                                            </div>
                                            <p className="text-sm text-[#424655]">No fee records found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Transaction History ── */}
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#f1f3f9] flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest mb-1">Payment History</p>
                        <h3 className="text-base font-bold text-[#181c20]">Transaction Feed</h3>
                    </div>
                    <History className="w-5 h-5 text-[#c2c6d7]" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#f7f9ff] text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Payment Mode</th>
                                <th className="px-6 py-4 font-semibold">Reference</th>
                                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                <th className="px-6 py-4 font-semibold text-center">Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="border-t border-[#f7f9ff] hover:bg-[#f7f9ff] transition-colors duration-150">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-[#181c20]">{format(new Date(tx.transactionDate), 'MMM dd, yyyy')}</p>
                                            <p className="text-[10px] text-[#64748b]">{format(new Date(tx.transactionDate), 'HH:mm')}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1.5 bg-[#f1f3f9] text-[#424655] rounded-xl text-xs font-semibold">
                                                {tx.paymentMode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-[10px] font-mono text-[#424655] bg-[#f1f3f9] px-2 py-1 rounded-lg">
                                                {tx.referenceNumber || 'INTERNAL-TXN'}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-[#0054d1]">₹{tx.amount?.toLocaleString() ?? '0'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDownloadReceipt(tx.id)}
                                                className="w-9 h-9 bg-[#f1f3f9] text-[#424655] rounded-xl flex items-center justify-center hover:bg-[#dae2ff] hover:text-[#0054d1] transition-all mx-auto"
                                                title="Download Receipt"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 bg-[#f1f3f9] rounded-2xl flex items-center justify-center">
                                                <History className="w-7 h-7 text-[#c2c6d7]" />
                                            </div>
                                            <p className="text-sm text-[#424655]">No transactions found</p>
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
