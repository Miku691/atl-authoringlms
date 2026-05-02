import React, { useEffect, useState } from 'react';
import {
    Users,
    DollarSign,
    CreditCard,
    AlertCircle,
    Download,
    History,
    FileText,
    TrendingDown,
    TrendingUp,
    ChevronDown
} from 'lucide-react';
import { financeService } from '../../../api/financeService';
import type { StudentFeeRecord, FinanceSummary, Transaction } from '../../../types/finance';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const WardFinancePage: React.FC = () => {
    const [wardsData, setWardsData] = useState<Record<string, StudentFeeRecord[]>>({});
    const [wardsTransactions, setWardsTransactions] = useState<Record<string, Transaction[]>>({});
    const [selectedWardId, setSelectedWardId] = useState<string>('');
    const [summary, setSummary] = useState<FinanceSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllWardsData = async () => {
            try {
                const [ledgerData, transactionData] = await Promise.all([
                    financeService.getWardsLedger(),
                    financeService.getWardsTransactions()
                ]);
                setWardsData(ledgerData);
                setWardsTransactions(transactionData);

                const wardIds = Object.keys(ledgerData);
                if (wardIds.length > 0) {
                    setSelectedWardId(wardIds[0]);
                }
            } catch (error) {
                console.error('Error fetching wards finance data:', error);
                toast.error('Failed to load wards data');
            } finally {
                setLoading(false);
            }
        };

        fetchAllWardsData();
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

    useEffect(() => {
        if (!selectedWardId) return;

        // In a real app, we might have a specific summary API for guardians or we calculate it here
        // For now, let's calculate the summary from the ledger we already have
        const records = wardsData[selectedWardId] || [];
        const totalDue = records.reduce((acc, r) => acc + r.amountDue, 0);
        const totalPaid = records.reduce((acc, r) => acc + r.amountPaid, 0);
        const balance = records.reduce((acc, r) => acc + r.balance, 0);
        const pendingInvoices = records.filter(r => r.status !== 'PAID').length;

        setSummary({
            totalDue,
            totalPaid,
            balance,
            pendingInvoices
        });
    }, [selectedWardId, wardsData]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'PARTIAL': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'UNPAID': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-chrome text-content-primary dark:bg-gray-800 dark:text-content-muted';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const wardIds = Object.keys(wardsData);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header & Ward Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Ward Finance</h1>
                    <p className="text-muted-foreground mt-1">Manage and track your child's educational financial records.</p>
                </div>

                {wardIds.length > 1 && (
                    <div className="relative inline-block w-full md:w-64">
                        <select
                            value={selectedWardId}
                            onChange={(e) => setSelectedWardId(e.target.value)}
                            className="block w-full appearance-none bg-surface dark:bg-gray-800 border border-border px-4 py-2.5 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        >
                            {wardIds.map((id) => (
                                <option key={id} value={id}>Ward ID: {id}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    </div>
                )}
            </div>

            {wardIds.length === 0 ? (
                <div className="bg-surface dark:bg-gray-800 rounded-2xl border border-border p-12 text-center">
                    <div className="bg-chrome dark:bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No Wards Linked</h2>
                    <p className="text-muted-foreground mb-6">We couldn't find any student profiles linked to your account.</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-surface dark:bg-gray-800 p-6 rounded-xl border border-border flex items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Due</p>
                                <h3 className="text-2xl font-bold">₹{summary?.totalDue.toLocaleString()}</h3>
                            </div>
                        </div>

                        <div className="bg-surface dark:bg-gray-800 p-6 rounded-xl border border-border flex items-center gap-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Paid</p>
                                <h3 className="text-2xl font-bold">₹{summary?.totalPaid.toLocaleString()}</h3>
                            </div>
                        </div>

                        <div className="bg-surface dark:bg-gray-800 p-6 rounded-xl border border-border flex items-center gap-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Balance</p>
                                <h3 className="text-2xl font-bold">₹{summary?.balance.toLocaleString()}</h3>
                            </div>
                        </div>

                        <div className="bg-surface dark:bg-gray-800 p-6 rounded-xl border border-border flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
                                <h3 className="text-2xl font-bold">{summary?.pendingInvoices}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Fee Records Table */}
                    <div className="bg-surface dark:bg-gray-800 rounded-xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Fee Ledger for {selectedWardId}
                            </h2>
                            <button className="flex items-center gap-2 text-primary hover:bg-primary/5 px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-primary/20">
                                <Download className="w-4 h-4" />
                                Download Ledger
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-chrome dark:bg-gray-900/50">
                                        <th className="p-4 text-sm font-semibold uppercase tracking-wider">Fee Head</th>
                                        <th className="p-4 text-sm font-semibold uppercase tracking-wider">Due Date</th>
                                        <th className="p-4 text-sm font-semibold uppercase tracking-wider">Amount Due</th>
                                        <th className="p-4 text-sm font-semibold uppercase tracking-wider">Paid</th>
                                        <th className="p-4 text-sm font-semibold uppercase tracking-wider">Balance</th>
                                        <th className="p-4 text-sm font-semibold uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {(wardsData[selectedWardId] || []).length > 0 ? (
                                        (wardsData[selectedWardId] || []).map((record) => (
                                            <tr key={record.id} className="hover:bg-chrome/50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="p-4 font-medium">{record.feeHeadName}</td>
                                                <td className="p-4 text-sm text-muted-foreground">
                                                    {format(new Date(record.dueDate), 'MMM dd, yyyy')}
                                                </td>
                                                <td className="p-4 font-semibold">₹{record.amountDue.toLocaleString()}</td>
                                                <td className="p-4 text-green-600 font-medium">₹{record.amountPaid.toLocaleString()}</td>
                                                <td className="p-4 text-red-500 font-semibold">₹{record.balance.toLocaleString()}</td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <AlertCircle className="w-8 h-8 opacity-20" />
                                                    <p>No fee records found for this ward.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-surface dark:bg-gray-800 rounded-xl border border-border overflow-hidden">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <History className="w-5 h-5 text-primary" />
                                Recent Transactions for {selectedWardId}
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-chrome dark:bg-gray-900/50">
                                        <th className="p-4 text-sm font-semibold uppercase tracking-wider">Date</th>
                                        <th className="p-4 text-sm font-semibold uppercase tracking-wider">Mode</th>
                                        <th className="p-4 text-sm font-semibold uppercase tracking-wider">Reference</th>
                                        <th className="p-4 text-sm font-semibold uppercase tracking-wider text-right">Amount</th>
                                        <th className="p-4 text-sm font-semibold uppercase tracking-wider text-center">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {(wardsTransactions[selectedWardId] || []).length > 0 ? (
                                        (wardsTransactions[selectedWardId] || []).map((tx) => (
                                            <tr key={tx.id} className="hover:bg-chrome/50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="p-4 text-sm whitespace-nowrap">
                                                    {format(new Date(tx.transactionDate), 'MMM dd, yyyy HH:mm')}
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 bg-chrome dark:bg-gray-800 rounded text-xs">
                                                        {tx.paymentMode}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm font-mono text-muted-foreground">
                                                    {tx.referenceNumber || 'N/A'}
                                                </td>
                                                <td className="p-4 font-bold text-right text-green-600">
                                                    ₹{tx.amount.toLocaleString()}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={() => handleDownloadReceipt(tx.id)}
                                                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                        title="Download Receipt"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <History className="w-8 h-8 opacity-20" />
                                                    <p>No transactions found for this ward.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default WardFinancePage;
