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
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/store';
import { academicService, type AcademicSession, type ImsOffering } from '../../../../api/academicService';

export const FinancialReportsPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<'daybook' | 'outstanding' | 'income-expense'>('daybook');
    const { format: formatCurrency } = useCurrency();
    const [isLoading, setIsLoading] = useState(false);
    
    const [offerings, setOfferings] = useState<ImsOffering[]>([]);
    const [sessions, setSessions] = useState<AcademicSession[]>([]);

    // Day Book state
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [dayBookTransactions, setDayBookTransactions] = useState<Transaction[]>([]);

    // Outstanding state
    const [outstandingFees, setOutstandingFees] = useState<OutstandingFee[]>([]);

    // Income/Expense state
    const [academicYear, setAcademicYear] = useState('');
    const [incomeExpenseData, setIncomeExpenseData] = useState<IncomeExpenseReport | null>(null);

    useEffect(() => {
        if (user?.tenantId) {
            fetchInitialData();
        }
    }, [user?.tenantId]);

    const fetchInitialData = async () => {
        try {
            const [offeringsData, sessionsData] = await Promise.all([
                academicService.getOfferingsByTenant(user!.tenantId!),
                academicService.getSessionsByTenant(user!.tenantId!)
            ]);
            
            let processedOfferings = [...offeringsData];
            if (user?.tenantType === 'COLLEGE') {
                try {
                    const [branchesData, yearsData] = await Promise.all([
                        academicService.getBranchesByTenant(user!.tenantId!),
                        academicService.getYearsByTenant(user!.tenantId!)
                    ]);
                    const branchesMap = new Map(branchesData.map((b: any) => [b.id, b]));
                    const yearsMap = new Map(yearsData.map((y: any) => [y.id, y]));
                    processedOfferings = processedOfferings.map(off => {
                        if (off.yearId) {
                            const year = yearsMap.get(off.yearId) as any;
                            if (year) {
                                const branch = branchesMap.get(year.branchId) as any;
                                return { ...off, displayName: branch ? `${branch.name} - ${year.name}` : year.name };
                            }
                        }
                        return off;
                    });
                } catch (e) {}
            } else if (user?.tenantType === 'COACHING') {
                try {
                    const coursesData = await academicService.getCoursesByTenant(user!.tenantId!);
                    const coursesMap = new Map(coursesData.map((c: any) => [c.id, c]));
                    processedOfferings = processedOfferings.map(off => {
                        if (off.courseId) {
                            const course = coursesMap.get(off.courseId) as any;
                            if (course) return { ...off, displayName: course.name };
                        }
                        return off;
                    });
                } catch (e) {}
            }
            setOfferings(processedOfferings);
            setSessions(sessionsData);
            
            const currentSession = sessionsData.find((s: AcademicSession) => s.isCurrent);
            if (currentSession) setAcademicYear(currentSession.name);
            else if (sessionsData.length > 0) setAcademicYear(sessionsData[0].name);
            
        } catch (error) {
            console.error("Failed to fetch initial report context", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, selectedDate, academicYear]);

    const getOfferingName = (id: string | null | undefined) => {
        if (!id) return '-';
        const off = offerings.find(o => o.id === id);
        return off ? (off.displayName || off.name) : id;
    };

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
                    <Calendar className="h-5 w-5 text-content-muted" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button className="flex items-center px-4 py-2 bg-chrome text-content-primary rounded-lg hover:bg-chrome transition-colors">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                </button>
            </div>

            <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-chrome">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Transaction ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Mode</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Reference</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-content-secondary uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-content-secondary">Loading day book...</td></tr>
                        ) : dayBookTransactions.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-content-secondary">No transactions for this date</td></tr>
                        ) : (
                            dayBookTransactions.map((t: any) => (
                                <tr key={t.id} className="hover:bg-chrome">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-content-primary">{t.id.substring(0, 8)}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {t.studentName ? (
                                            <>
                                                <div className="text-sm font-bold text-content-primary">{t.studentName}</div>
                                                <div className="text-xs text-content-secondary">{t.studentId}</div>
                                            </>
                                        ) : (
                                            <div className="text-sm text-content-primary">{t.studentId}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                                            {t.paymentMode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary">{t.referenceNumber || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-content-primary">{formatCurrency(t.amount)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot className="bg-chrome">
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-right font-bold text-content-primary">Total Collection:</td>
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
            <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-chrome">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Offering</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-content-secondary uppercase tracking-wider">Total Due</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-content-secondary uppercase tracking-wider">Overdue</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-content-secondary uppercase tracking-wider">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-content-secondary">Loading outstanding fees...</td></tr>
                        ) : outstandingFees.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-content-secondary">No outstanding fees found</td></tr>
                        ) : (
                            outstandingFees.map((f) => (
                                <tr key={f.studentId} className="hover:bg-chrome">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-content-primary">{f.studentName}</div>
                                        <div className="text-xs text-content-secondary">{f.enrollmentId}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary">
                                        <div className="px-3 py-1 bg-surface border border-border rounded-lg inline-block font-medium">
                                            {getOfferingName(f.offeringId)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">{formatCurrency(f.totalAllocated)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600">{formatCurrency(f.totalOverdue)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-content-primary">{formatCurrency(f.balance)}</td>
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
                    className="border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-surface"
                    disabled={sessions.length === 0}
                >
                    {sessions.length === 0 && <option value="">Loading...</option>}
                    {sessions.map(s => (
                        <option key={s.id} value={s.name}>{s.name} {s.isCurrent ? '(Current)' : ''}</option>
                    ))}
                </select>
                <div className="flex space-x-2">
                    <button className="p-2 text-content-secondary hover:bg-chrome rounded-lg"><Download className="h-5 w-5" /></button>
                </div>
            </div>

            {incomeExpenseData && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-surface p-6 rounded-xl shadow-sm border border-border">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-content-secondary">Total Income</p>
                                <div className="p-2 bg-green-50 rounded-lg text-green-600"><TrendingUp className="h-4 w-4" /></div>
                            </div>
                            <p className="text-2xl font-bold text-content-primary">{formatCurrency(incomeExpenseData.totalIncome)}</p>
                        </div>
                        <div className="bg-surface p-6 rounded-xl shadow-sm border border-border">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-content-secondary">Total Expense</p>
                                <div className="p-2 bg-red-50 rounded-lg text-red-600"><TrendingDown className="h-4 w-4" /></div>
                            </div>
                            <p className="text-2xl font-bold text-content-primary">{formatCurrency(incomeExpenseData.totalExpense)}</p>
                        </div>
                        <div className="bg-surface p-6 rounded-xl shadow-sm border border-border">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-content-secondary">Net Position</p>
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
                        <div className="bg-surface rounded-xl shadow-sm border border-border">
                            <div className="px-6 py-4 border-b border-border flex items-center">
                                <ArrowUpRight className="h-4 w-4 text-green-500 mr-2" />
                                <h3 className="font-bold text-content-primary">Income Breakdown</h3>
                            </div>
                            <div className="p-6">
                                {Object.entries(incomeExpenseData.incomeByCategory).map(([cat, amount]) => (
                                    <div key={cat} className="flex justify-between items-center mb-3">
                                        <span className="text-sm text-content-secondary">{cat}</span>
                                        <span className="text-sm font-bold text-content-primary">{formatCurrency(amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-surface rounded-xl shadow-sm border border-border">
                            <div className="px-6 py-4 border-b border-border flex items-center">
                                <ArrowDownRight className="h-4 w-4 text-red-500 mr-2" />
                                <h3 className="font-bold text-content-primary">Expense Breakdown</h3>
                            </div>
                            <div className="p-6">
                                {Object.entries(incomeExpenseData.expenseByCategory).map(([cat, amount]) => (
                                    <div key={cat} className="flex justify-between items-center mb-3">
                                        <span className="text-sm text-content-secondary">{cat}</span>
                                        <span className="text-sm font-bold text-content-primary">{formatCurrency(amount)}</span>
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
                    <h1 className="text-2xl font-bold text-content-primary">Financial Reports</h1>
                    <p className="text-sm text-content-secondary mt-1">Institutional finance analytical reports</p>
                </div>
            </div>

            <div className="flex space-x-1 bg-chrome p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('daybook')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'daybook' ? 'bg-surface text-blue-600 shadow-sm' : 'text-content-secondary hover:text-content-primary'
                        }`}
                >
                    Day Book
                </button>
                <button
                    onClick={() => setActiveTab('outstanding')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'outstanding' ? 'bg-surface text-blue-600 shadow-sm' : 'text-content-secondary hover:text-content-primary'
                        }`}
                >
                    Outstanding Fees
                </button>
                <button
                    onClick={() => setActiveTab('income-expense')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'income-expense' ? 'bg-surface text-blue-600 shadow-sm' : 'text-content-secondary hover:text-content-primary'
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
