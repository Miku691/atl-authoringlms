import React, { useState } from 'react';
import { Search, CreditCard, IndianRupee, History, Download, ArrowRight, User, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { financeService } from '../../../../api/financeService';
import { studentService } from '../../../../api/studentService';
import type { StudentFeeRecord, PaymentMode, Transaction } from '../../../../types/finance';
import type { Student } from '../../../../api/studentService';
import FloatingLabelInput from '../../../../components/common/FloatingLabelInput';

const CollectionDeskPage: React.FC = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [ledger, setLedger] = useState<StudentFeeRecord[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Payment Form state
    const [paymentData, setPaymentData] = useState({
        amount: 0,
        paymentMode: 'CASH' as PaymentMode,
        referenceNumber: '',
        feeRecordIds: [] as string[]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

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

            // Let user enter amount manually
            setPaymentData(prev => ({ ...prev, amount: 0, feeRecordIds: [] }));
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
            await financeService.collectPayment({
                studentId: selectedStudent.id,
                ...paymentData
            });
            toast.success('Payment collected successfully');
            fetchStudentData(selectedStudent.id);
            // Don't clear student, just refresh data
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Payment collection failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleFeeSelection = (id: string) => {
        setPaymentData(prev => {
            const isSelected = prev.feeRecordIds.includes(id);
            const newList = isSelected ? prev.feeRecordIds.filter(f => f !== id) : [...prev.feeRecordIds, id];

            // User wants to enter amount manually, so we don't recalculate amount here
            return { ...prev, feeRecordIds: newList };
        });
    };

    const handleDownloadReceipt = async (txId: string) => {
        try {
            const blob = await financeService.downloadReceipt(txId);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt_${txId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to download receipt');
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel: Payment Form & Ledger Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Student Badge */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                <User className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-gray-900">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                                <p className="text-xs text-gray-500">#{selectedStudent.admissionNo} • {selectedStudent.phone}</p>
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
                                        label="Amount to Collect"
                                        type="number"
                                        required
                                        value={paymentData.amount}
                                        onChange={e => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                                        icon={<IndianRupee className="w-4 h-4" />}
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
                                    <p className="text-xs font-semibold text-gray-500 uppercase px-1 mb-2">Select Dues (Optional - FIFO default)</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {ledger.filter(r => r.status !== 'PAID').map(record => (
                                            <div
                                                key={record.id}
                                                onClick={() => toggleFeeSelection(record.id)}
                                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${paymentData.feeRecordIds.includes(record.id)
                                                    ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                                                    : 'bg-white border-gray-100 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentData.feeRecordIds.includes(record.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'
                                                        }`}>
                                                        {paymentData.feeRecordIds.includes(record.id) && <CheckCircle2 className="w-3 h-3" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800">{record.feeHeadName}</p>
                                                        <p className="text-[10px] text-gray-500">Due: {record.dueDate}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-gray-900">₹{record.balance.toLocaleString()}</p>
                                                    <p className="text-[10px] text-gray-400">Total: ₹{record.amountDue}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || paymentData.amount <= 0}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? 'Processing Payment...' : (
                                        <>
                                            <IndianRupee className="w-6 h-6" />
                                            Confirm Collection (₹{paymentData.amount.toLocaleString()})
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Panel: Recent Transactions */}
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
                                    transactions.map(tx => (
                                        <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors group">
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">₹{tx.amount.toLocaleString()}</p>
                                                    <p className="text-[10px] text-gray-500 font-medium">{new Date(tx.transactionDate).toLocaleString()}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDownloadReceipt(tx.id)}
                                                    className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                    title="Download Receipt"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-bold uppercase">{tx.paymentMode}</span>
                                                {tx.referenceNumber && <span className="text-[10px] text-gray-400 truncate">Ref: {tx.referenceNumber}</span>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                    <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-500 rotate-12 group-hover:rotate-0 transition-transform">
                        <CreditCard className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">Collection Desk Ready</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-4 leading-relaxed">
                        Start collecting fees by searching for a student. You can select specific fee heads or let the system apply payment to the oldest balances automatically.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-bold text-gray-600 uppercase">Automatic Receipt</span>
                        </div>
                        <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-bold text-gray-600 uppercase">FIFO allocation</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollectionDeskPage;
