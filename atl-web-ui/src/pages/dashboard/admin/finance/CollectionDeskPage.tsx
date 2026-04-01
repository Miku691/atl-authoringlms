import React, { useState, useEffect } from 'react';
import { Search, CreditCard, History, Download, ArrowRight, User, CheckCircle2, TrendingUp, BarChart3, Calendar, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { financeService, type CollectionSummary } from '../../../../api/financeService';
import { studentService } from '../../../../api/studentService';
import type { StudentFeeRecord, PaymentMode, Transaction } from '../../../../types/finance';
import type { Student } from '../../../../api/studentService';
import FloatingLabelInput from '../../../../components/common/FloatingLabelInput';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useCurrency } from '../../../../context/CurrencyContext';
import { getCurrencySymbol } from '../../../../utils/currency';

const CollectionDeskPage: React.FC = () => {
    const { format, currencyCode } = useCurrency();

    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [ledger, setLedger] = useState<StudentFeeRecord[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState<CollectionSummary | null>(null);

    const [paymentData, setPaymentData] = useState({
        amount: 0,
        paymentMode: 'CASH' as PaymentMode,
        referenceNumber: '',
        feeRecordIds: [] as string[]
    });
    const [amountsPerRecord, setAmountsPerRecord] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = Math.max(0, now.getTime() - date.getTime());
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (date.toDateString() === now.toDateString()) {
            if (diffInMins < 1) return 'Just now';
            if (diffInMins < 60) return `${diffInMins} min${diffInMins > 1 ? 's' : ''} ago`;
            return `${diffInHours} hr${diffInHours > 1 ? 's' : ''} ago`;
        }
        return date.toLocaleDateString();
    };

    useEffect(() => {
        if (!selectedStudent) {
            fetchCollectionSummary();
        }
    }, [selectedStudent]);

    const fetchCollectionSummary = async () => {
        setIsLoading(true);
        try {
            const data = await financeService.getCollectionSummary();
            setSummary(data);
        } catch (error) {
            console.error('Failed to fetch collection summary', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (term.length < 3) {
            setStudents([]);
            return;
        }

        try {
            const allStudents = await studentService.getAllStudents();
            const filtered = (allStudents.apiData as Student[]).filter(s =>
                `${s.firstName} ${s.lastName}`.toLowerCase().includes(term.toLowerCase()) ||
                s.admissionNo.toLowerCase().includes(term.toLowerCase())
            );
            setStudents(filtered);
        } catch (error) {
            console.error('Search failed', error);
        }
    };

    const fetchStudentData = async (studentId: string) => {
        setIsLoading(true);
        try {
            const [ledgerData, txData] = await Promise.all([
                financeService.getStudentLedger(studentId),
                financeService.getStudentTransactions(studentId)
            ]);
            setLedger(ledgerData);
            setTransactions(txData);

            // Reset payment data
            setPaymentData(prev => ({ ...prev, amount: 0, feeRecordIds: [] }));
            setAmountsPerRecord({});
        } catch (error) {
            toast.error('Failed to fetch student financial data');
        } finally {
            setIsLoading(false);
        }
    };

    const selectStudent = (student: Student) => {
        setSelectedStudent(student);
        setStudents([]);
        setSearchTerm('');
        fetchStudentData(student.id);
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        setIsSubmitting(true);
        try {
            const splitBreakdown = paymentData.feeRecordIds.map(id => ({
                feeRecordId: id,
                amount: amountsPerRecord[id] || 0
            }));

            await financeService.collectPayment({
                studentId: selectedStudent.id,
                ...paymentData,
                splitBreakdown
            });
            toast.success('Payment collected successfully. Invoice generation in progress...');
            fetchStudentData(selectedStudent.id);
            // Don't clear student, just refresh data
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Payment collection failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownloadReceipt = async (txId: string, receiptNo?: string) => {
        try {
            let blob;
            let filename;
            
            if (receiptNo) {
                toast.loading('Fetching detailed receipt...', { id: 'downloading' });
                blob = await financeService.downloadHighFidelityReceipt(receiptNo);
                filename = `receipt_${receiptNo}.pdf`;
                toast.success('Detailed receipt downloaded', { id: 'downloading' });
            } else {
                blob = await financeService.downloadReceipt(txId);
                filename = `receipt_${txId}.pdf`;
            }

            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to download receipt', { id: 'downloading' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Collection Desk</h1>
                    <p className="text-sm text-gray-500">Fast payment collection and receipt generation</p>
                </div>

                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Search student to collect fee..."
                        value={searchTerm}
                        onChange={e => handleSearch(e.target.value)}
                    />

                    {students.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {students.map(s => (
                                <button
                                    key={s.id}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 border-b last:border-0"
                                    onClick={() => selectStudent(s)}
                                >
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                        {s.firstName[0]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{s.firstName} {s.lastName}</p>
                                        <p className="text-xs text-gray-500">ID: {s.admissionNo}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedStudent ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Left Panel: Payment Form & Ledger Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Student Badge */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                <User className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-gray-900">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                                <p className="text-xs text-gray-500">#{selectedStudent.admissionNo} â€¢ {selectedStudent.phone}</p>
                            </div>
                            <button onClick={() => setSelectedStudent(null)} className="text-xs text-indigo-600 hover:underline font-medium">Change Student</button>
                        </div>

                        {/* Payment Collection Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50/50 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-indigo-600" />
                                <h3 className="font-bold text-gray-800">Collect Payment</h3>
                            </div>
                            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FloatingLabelInput
                                        label="Total Amount to Collect"
                                        type="number"
                                        readOnly
                                        value={paymentData.amount}
                                        icon={<span>{getCurrencySymbol(currencyCode)}</span>}
                                        className="bg-gray-50"
                                    />
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase px-1">Payment Mode</label>
                                        <div className="flex gap-2">
                                            {['CASH', 'ONLINE', 'CHEQUE', 'BANK_TRANSFER'].map(mode => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setPaymentData({ ...paymentData, paymentMode: mode as PaymentMode })}
                                                    className={`flex-1 py-2 px-1 text-[10px] font-bold rounded-lg border transition-all ${paymentData.paymentMode === mode
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {mode.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {paymentData.paymentMode !== 'CASH' && (
                                    <FloatingLabelInput
                                        label="Reference Number / Transaction ID"
                                        value={paymentData.referenceNumber}
                                        onChange={e => setPaymentData({ ...paymentData, referenceNumber: e.target.value })}
                                    />
                                )}

                                <div>
                                    <div className="flex items-center justify-between px-1 mb-2">
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Select Fee Heads & Enter Amounts</p>
                                        {paymentData.feeRecordIds.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Selected: {paymentData.feeRecordIds.length}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {ledger.filter(r => r.status !== 'PAID').map(record => (
                                            <div
                                                key={record.id}
                                                className={`p-3 rounded-xl border transition-all flex items-center justify-between ${paymentData.feeRecordIds.includes(record.id)
                                                    ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200 shadow-sm'
                                                    : 'bg-white border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div
                                                        onClick={() => {
                                                            const isSelected = paymentData.feeRecordIds.includes(record.id);
                                                            const newIds = isSelected
                                                                ? paymentData.feeRecordIds.filter(id => id !== record.id)
                                                                : [...paymentData.feeRecordIds, record.id];

                                                            const newAmounts = { ...amountsPerRecord };
                                                            if (!isSelected) {
                                                                newAmounts[record.id] = record.balance;
                                                            } else {
                                                                delete newAmounts[record.id];
                                                            }

                                                            const total = Object.values(newAmounts).reduce((a, b) => a + b, 0);

                                                            setPaymentData(prev => ({
                                                                ...prev,
                                                                feeRecordIds: newIds,
                                                                amount: total
                                                            }));
                                                            setAmountsPerRecord(newAmounts);
                                                        }}
                                                        className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${paymentData.feeRecordIds.includes(record.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'
                                                            }`}>
                                                        {paymentData.feeRecordIds.includes(record.id) && <CheckCircle2 className="w-3 h-3" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800">{record.feeHeadName}</p>
                                                        <p className="text-[10px] text-gray-500 font-medium">Due: {new Date(record.dueDate).toLocaleDateString()} â€¢ Bal: {format(record.balance)}</p>
                                                    </div>
                                                </div>

                                                {paymentData.feeRecordIds.includes(record.id) && (
                                                    <div className="w-32 animate-in slide-in-from-left-2 duration-200">
                                                        <input
                                                            type="number"
                                                            max={record.balance}
                                                            className="block w-full px-2 py-1 text-sm border border-indigo-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                            placeholder="Amount"
                                                            value={amountsPerRecord[record.id] || ''}
                                                            onChange={(e) => {
                                                                const val = parseFloat(e.target.value) || 0;
                                                                const finalVal = Math.min(val, record.balance);
                                                                const newAmounts = { ...amountsPerRecord, [record.id]: finalVal };
                                                                const total = Object.values(newAmounts).reduce((a, b) => a + b, 0);
                                                                setAmountsPerRecord(newAmounts);
                                                                setPaymentData(prev => ({ ...prev, amount: total }));
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || paymentData.amount <= 0 || (paymentData.amount > 0 && paymentData.feeRecordIds.length === 0)}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? 'Processing Payment...' : (
                                        <>
                                            <CreditCard className="w-6 h-6" />
                                            Confirm Collection ({format(paymentData.amount)})
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Panel: Recent Transactions for Selected Student */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <History className="w-5 h-5 text-indigo-600" />
                                    <h3 className="font-bold text-gray-800">Recent Receipts</h3>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                                {isLoading ? (
                                    <div className="p-8 text-center text-gray-400 text-sm italic">Loading history...</div>
                                ) : transactions.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 text-sm italic">No recent transactions</div>
                                ) : (
                                    (() => {
                                        // Grouping transactions by receiptNo
                                        const grouped: Record<string, Transaction[]> = {};
                                        const unformatted: Transaction[] = [];

                                        transactions.forEach((tx: any) => {
                                            if (tx.receiptNo) {
                                                if (!grouped[tx.receiptNo]) grouped[tx.receiptNo] = [];
                                                grouped[tx.receiptNo].push(tx);
                                            } else {
                                                unformatted.push(tx);
                                            }
                                        });

                                        // Convert grouped to comparable list items
                                        const uniqueGroups = Object.keys(grouped).map(rNo => {
                                            const items = grouped[rNo];
                                            const total = items.reduce((sum, tx) => sum + tx.amount, 0);
                                            // Use most recent date in group
                                            const newest = items.reduce((prev, current) => 
                                                new Date(prev.transactionDate) > new Date(current.transactionDate) ? prev : current
                                            );
                                            
                                            return {
                                                id: rNo, // Use receiptNo as ID for list
                                                receiptNo: rNo,
                                                studentName: newest.studentName,
                                                amount: total,
                                                transactionDate: newest.transactionDate,
                                                paymentMode: newest.paymentMode,
                                                offeringName: newest.offeringName,
                                                referenceNumber: newest.referenceNumber,
                                                items: items.map(i => i.feeHeadName).filter(Boolean).join(', ')
                                            };
                                        });

                                        const allItems = [
                                            ...uniqueGroups,
                                            ...unformatted.map(tx => ({ ...tx, items: tx.feeHeadName }))
                                        ].sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());

                                        return allItems.map((item: any) => (
                                            <div key={item.id} className="p-4 hover:bg-gray-50/50 transition-colors group border-b last:border-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex-1 pr-4">
                                                        <p className="text-sm font-black text-gray-900 leading-tight">
                                                            {item.studentName || `${selectedStudent.firstName} ${selectedStudent.lastName}`}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
                                                            {item.offeringName ? `${item.offeringName} • ` : ''}{item.paymentMode} • {formatRelativeTime(item.transactionDate)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-emerald-600">+{format(item.amount)}</span>
                                                        <button
                                                            onClick={() => handleDownloadReceipt(item.id, item.receiptNo)}
                                                            className="p-1.5 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm group-hover:scale-110"
                                                            title={item.receiptNo ? "Download Unified Receipt" : "Download Receipt"}
                                                        >
                                                            <Download className={`w-3.5 h-3.5 ${item.receiptNo ? 'animate-pulse text-indigo-700' : ''}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {item.items && (
                                                    <p className="text-[10px] font-medium text-gray-500 italic truncate mb-1" title={item.items}>
                                                        Incl: {item.items}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-3">
                                                    {item.receiptNo && (
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                            <span className="text-[9px] font-black text-indigo-400 tracking-tighter uppercase">ID: {item.receiptNo}</span>
                                                        </div>
                                                    )}
                                                    {item.referenceNumber && (
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">REF: {item.referenceNumber}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ));
                                    })()
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : summary ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-110 transition-transform" />
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="flex items-center gap-3 text-green-600 mb-4">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">Today's Collection</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-gray-900">{format(summary.todayCollection)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform" />
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="flex items-center gap-3 text-blue-600 mb-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">Monthly Collection</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-gray-900">{format(summary.monthCollection)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-110 transition-transform" />
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="flex items-center gap-3 text-indigo-600 mb-4">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">Yearly Collection</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-gray-900">{format(summary.yearCollection)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Class-wise collection chart */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-indigo-600" />
                                    Class-wise Collection
                                </h3>
                                <div className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Current Academic Year</div>
                            </div>
                            
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={Object.entries(summary.collectionByOffering).map(([id, amount]) => ({
                                            name: summary.offeringNames?.[id] || id.substring(0, 8),
                                            amount: amount
                                        }))}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                                            dy={10}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false}
                                            tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                                            tickFormatter={(value) => `${getCurrencySymbol(currencyCode)}${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                                        />
                                        <Tooltip 
                                            cursor={{ fill: '#F3F4F6' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: any) => [format(value), 'Collected']}
                                        />
                                        <Bar dataKey="amount" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={40}>
                                            {Object.entries(summary.collectionByOffering).map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'][index % 4]} opacity={0.8} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Activity List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm flex items-center gap-2">
                                    <History className="w-4 h-4 text-indigo-600" />
                                    Recent Activity
                                </h3>
                            </div>
                            <div className="flex-1 divide-y divide-gray-50 overflow-y-auto max-h-[400px]">
                                {summary.recentTransactions.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <History className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium">No recent transactions</p>
                                    </div>
                                ) : (
                                    summary.recentTransactions.map((tx: any) => (
                                        <div key={tx.id} className="p-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black uppercase">
                                                    {tx.paymentMode?.[0]}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-gray-900">{tx.studentName || `Student: ${tx.studentId?.substring(0, 8)}`}</p>
                                                        <span className="text-[10px] font-black text-emerald-600">+{format(tx.amount)}</span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">
                                                        {tx.offeringName ? `${tx.offeringName} • ` : ''}{tx.paymentMode} • {formatRelativeTime(tx.transactionDate)}
                                                    </p>
                                                    {tx.feeHeadName && (
                                                        <p className="text-[9px] text-gray-400 font-medium italic truncate max-w-[150px]" title={tx.feeHeadName}>
                                                            {tx.feeHeadName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Updated: {new Date().toLocaleTimeString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-96 flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                    <p className="text-sm text-gray-400 font-medium animate-pulse">Loading Collection Statistics...</p>
                </div>
            )}
        </div>
    );
};

export default CollectionDeskPage;






