import React, { useState, useEffect } from 'react';
import { 
    Plus, Trash2, Save, X, Target, BarChart3
} from 'lucide-react';
import { financeService } from '../../../../api/financeService';
import type { Budget, ExpenseCategory } from '../../../../types/finance';
import { useCurrency } from '../../../../context/CurrencyContext';
import { getCurrencySymbol } from '../../../../utils/currency';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/store';
import { academicService, type AcademicSession } from '../../../../api/academicService';
import toast from 'react-hot-toast';

export const BudgetPage: React.FC = () => {
    const { format, currencyCode } = useCurrency();
    const { user } = useSelector((state: RootState) => state.auth);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [academicYear, setAcademicYear] = useState('');
    const [formData, setFormData] = useState<Partial<Budget>>({
        categoryId: '',
        allocatedAmount: 0,
        academicYear: ''
    });

    useEffect(() => {
        if (user?.tenantId) {
            fetchData();
        }
    }, [academicYear, user?.tenantId]);

    const fetchData = async () => {
        if (!user?.tenantId) return;
        try {
            setIsLoading(true);
            const [budgetData, catData, sessionData] = await Promise.all([
                financeService.getBudgets(academicYear),
                financeService.getExpenseCategories(),
                academicService.getSessionsByTenant(user.tenantId)
            ]);
            setBudgets(budgetData);
            setCategories(catData);
            setSessions(sessionData);

            // Set default academic year if not already set
            if (!academicYear) {
                const current = sessionData.find((s: AcademicSession) => s.isCurrent);
                if (current) {
                    setAcademicYear(current.name);
                    setFormData(prev => ({ ...prev, academicYear: current.name }));
                } else if (sessionData.length > 0) {
                    setAcademicYear(sessionData[0].name);
                    setFormData(prev => ({ ...prev, academicYear: sessionData[0].name }));
                }
            }
        } catch (error) {
            toast.error('Failed to load initial data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!formData.categoryId || !formData.allocatedAmount) {
                toast.error('Please fill all fields');
                return;
            }
            await financeService.saveBudget(formData as Budget);
            toast.success('Budget saved successfully');
            setIsModalOpen(false);
            setFormData({ categoryId: '', allocatedAmount: 0, academicYear });
            fetchData();
        } catch (error) {
            toast.error('Failed to save budget');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Remove this budget allocation?')) return;
        try {
            await financeService.deleteBudget(id);
            toast.success('Budget removed');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete budget');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Budget Allocation</h1>
                    <p className="text-sm text-gray-500 mt-1">Set spending limits for each expense category</p>
                </div>
                <div className="flex items-center space-x-3">
                    <select
                        value={academicYear}
                        onChange={(e) => {
                            setAcademicYear(e.target.value);
                            setFormData(prev => ({ ...prev, academicYear: e.target.value }));
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white text-sm font-medium"
                    >
                        <option value="">Select Year</option>
                        {sessions.sort((a,b) => b.name.localeCompare(a.name)).map(s => (
                            <option key={s.id} value={s.name}>
                                {s.name} {s.isCurrent ? '(Current)' : ''}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Set Budget
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Budget</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                            {format(budgets.reduce((sum, b) => sum + b.allocatedAmount, 0))}
                        </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <Target className="h-6 w-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Categorized</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{budgets.length}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-green-600">
                        <BarChart3 className="h-6 w-6" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expense Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocated Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {isLoading ? (
                            <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">Loading budgets...</td></tr>
                        ) : budgets.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">No budgets defined for this year</td></tr>
                        ) : (
                            budgets.map((b) => (
                                <tr key={b.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{b.categoryName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                                        {format(b.allocatedAmount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.academicYear}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <button 
                                            onClick={() => {
                                                setFormData(b);
                                                setIsModalOpen(true);
                                            }}
                                            className="text-blue-500 hover:text-blue-700 mr-4"
                                        >
                                            Update
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(b.id!)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Set Category Budget</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Category *</label>
                                <select
                                    required
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Allocated Amount ({getCurrencySymbol(currencyCode)}) *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.allocatedAmount}
                                    onChange={(e) => setFormData({ ...formData, allocatedAmount: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={academicYear}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 outline-none"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Budget
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
