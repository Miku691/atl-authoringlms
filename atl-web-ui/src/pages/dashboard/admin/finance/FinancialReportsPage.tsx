import React, { useState, useEffect } from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    TrendingDown, 
    Calendar, 
    Download,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { financeService } from '../../../../api/financeService';
import type { Transaction, OutstandingFee, IncomeExpenseReport } from '../../../../types/finance';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useCurrency } from '../../../../context/CurrencyContext';

export const FinancialReportsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'daybook' | 'outstanding' | 'income-expense'>('daybook');
    const { format: formatCurrency } = useCurrency();
    const [isLoading, setIsLoading] = useState(false);
    
    // Day Book state
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [dayBookTransactions, setDayBookTransactions] = useState<Transaction[]>([]);
    
    // Outstanding state
    const [outstandingFees, setOutstandingFees] = useState<OutstandingFee[]>([]);
    
    // Income/Expense state
    const [academicYear, setAcademicYear] = useState('2023-24');
    const [incomeExpenseData, setIncomeExpenseData] = useState<IncomeExpenseReport | null>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab, selectedDate, academicYear]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            if (activeTab === 'daybook') {
                const data = await financeService.getDayBook(selectedDate);
                setDayBookTransactions(data);
            } else if (activeTab === 'outstanding') {
                const data = await financeService.getOutstandingFees();
                setOutstandingFees(data);
            } else if (activeTab === 'income-expense') {
                const data = await financeService.getIncomeExpenseReport(academicYear);
                setIncomeExpenseData(data);
            }
        } catch (error) {
            toast.error('Failed to load report data');
        } finally {
            setIsLoading(false);
        }
    };

    const renderDayBook = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Loading day book...</td></tr>
                        ) : dayBookTransactions.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No transactions for this date</td></tr>
                        ) : (
                            dayBookTransactions.map((t: any) => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.id.substring(0, 8)}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.studentId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                                            {t.paymentMode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.referenceNumber || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">{formatCurrency(t.amount)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-right font-bold text-gray-900">Total Collection:</td>
                            <td className="px-6 py-4 text-right font-bold text-blue-600">
                                {formatCurrency(dayBookTransactions.reduce((sum: number, t: any) => sum + t.amount, 0))}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );

    const renderOutstanding = () => (
        <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offering</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Due</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Loading outstanding fees...</td></tr>
                        ) : outstandingFees.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No outstanding fees found</td></tr>
                        ) : (
                            outstandingFees.map((f) => (
                                <tr key={f.studentId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{f.studentName}</div>
                                        <div className="text-xs text-gray-500">{f.enrollmentId}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.offeringId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">{formatCurrency(f.totalAllocated)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600">{formatCurrency(f.totalOverdue)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">{formatCurrency(f.balance)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderIncomeExpense = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="2023-24">2023-24</option>
                    <option value="2024-25">2024-25</option>
                </select>
                <div className="flex space-x-2">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Download className="h-5 w-5" /></button>
                </div>
            </div>

            {incomeExpenseData && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-500">Total Income</p>
                                <div className="p-2 bg-green-50 rounded-lg text-green-600"><TrendingUp className="h-4 w-4" /></div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(incomeExpenseData.totalIncome)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-500">Total Expense</p>
                                <div className="p-2 bg-red-50 rounded-lg text-red-600"><TrendingDown className="h-4 w-4" /></div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(incomeExpenseData.totalExpense)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-500">Net Position</p>
                                <div className={`p-2 rounded-lg ${incomeExpenseData.netProfit >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                    <BarChart3 className="h-4 w-4" />
                                </div>
                            </div>
                            <p className={`text-2xl font-bold ${incomeExpenseData.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                {formatCurrency(incomeExpenseData.netProfit)}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center">
                                <ArrowUpRight className="h-4 w-4 text-green-500 mr-2" />
                                <h3 className="font-bold text-gray-900">Income Breakdown</h3>
                            </div>
                            <div className="p-6">
                                {Object.entries(incomeExpenseData.incomeByCategory).map(([cat, amount]) => (
                                    <div key={cat} className="flex justify-between items-center mb-3">
                                        <span className="text-sm text-gray-600">{cat}</span>
                                        <span className="text-sm font-bold text-gray-900">{formatCurrency(amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center">
                                <ArrowDownRight className="h-4 w-4 text-red-500 mr-2" />
                                <h3 className="font-bold text-gray-900">Expense Breakdown</h3>
                            </div>
                            <div className="p-6">
                                {Object.entries(incomeExpenseData.expenseByCategory).map(([cat, amount]) => (
                                    <div key={cat} className="flex justify-between items-center mb-3">
                                        <span className="text-sm text-gray-600">{cat}</span>
                                        <span className="text-sm font-bold text-gray-900">{formatCurrency(amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
                    <p className="text-sm text-gray-500 mt-1">Institutional finance analytical reports</p>
                </div>
            </div>

            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('daybook')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'daybook' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Day Book
                </button>
                <button
                    onClick={() => setActiveTab('outstanding')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'outstanding' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Outstanding Fees
                </button>
                <button
                    onClick={() => setActiveTab('income-expense')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'income-expense' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Income vs Expense
                </button>
            </div>

            <div className="mt-6">
                {activeTab === 'daybook' && renderDayBook()}
                {activeTab === 'outstanding' && renderOutstanding()}
                {activeTab === 'income-expense' && renderIncomeExpense()}
            </div>
        </div>
    );
};
