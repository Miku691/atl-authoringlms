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
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">My Finance</h1>
                <p className="text-muted-foreground mt-1">Track your fees, payments, and upcoming dues.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-blue-600/70 uppercase tracking-wider">Total Due</p>
                        <h3 className="text-xl font-bold text-gray-900">₹{summary?.totalDue?.toLocaleString() ?? '0'}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-emerald-600/70 uppercase tracking-wider">Total Paid</p>
                        <h3 className="text-xl font-bold text-gray-900">₹{summary?.totalPaid?.toLocaleString() ?? '0'}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-rose-50 rounded-xl">
                        <TrendingDown className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-rose-600/70 uppercase tracking-wider">Balance</p>
                        <h3 className="text-xl font-bold text-gray-900">₹{summary?.balance?.toLocaleString() ?? '0'}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-xl">
                        <FileText className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-amber-600/70 uppercase tracking-wider">Pending</p>
                        <h3 className="text-xl font-bold text-gray-900">{summary?.pendingInvoices ?? '0'}</h3>
                    </div>
                </div>
            </div>

            {/* Fee Records Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-white">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Fee Records
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fee Head</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Due</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Paid</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {ledger.length > 0 ? (
                                ledger.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="p-4 font-semibold text-gray-900">{record.feeHeadName}</td>
                                        <td className="p-4 text-sm text-gray-500 font-medium">
                                            {format(new Date(record.dueDate), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="p-4 font-bold text-gray-900">₹{record.amountDue?.toLocaleString() ?? '0'}</td>
                                        <td className="p-4 text-emerald-600 font-bold">₹{record.amountPaid?.toLocaleString() ?? '0'}</td>
                                        <td className="p-4 text-rose-500 font-bold">₹{record.balance?.toLocaleString() ?? '0'}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${getStatusColor(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-gray-50 rounded-full">
                                                <AlertCircle className="w-8 h-8 opacity-40" />
                                            </div>
                                            <p className="font-medium">No fee records found in your account.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-white">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        Recent Transactions
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mode</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reference</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="p-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                                            {format(new Date(tx.transactionDate), 'MMM dd, yyyy HH:mm')}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                                {tx.paymentMode}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-mono text-gray-400">
                                            {tx.referenceNumber || 'N/A'}
                                        </td>
                                        <td className="p-4 font-bold text-right text-emerald-600">
                                            ₹{tx.amount?.toLocaleString() ?? '0'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleDownloadReceipt(tx.id)}
                                                className="p-2 text-primary hover:bg-primary/5 rounded-xl transition-colors"
                                                title="Download Receipt"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-gray-50 rounded-full">
                                                <History className="w-8 h-8 opacity-40" />
                                            </div>
                                            <p className="font-medium">No transactions found.</p>
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
