import React, { useState, useEffect } from 'react';
import {
    Plus, Trash2, Search, Filter, Save, X, Banknote, CreditCard
} from 'lucide-react';
import { financeService } from '../../../../api/financeService';
import type { Expense, ExpenseCategory } from '../../../../types/finance';
import { useCurrency } from '../../../../context/CurrencyContext';
import { getCurrencySymbol } from '../../../../utils/currency';
import { format as formatDate } from 'date-fns';
import toast from 'react-hot-toast';
import Modal from '../../../../components/common/Modal';

export const ExpenseEntryPage: React.FC = () => {
    const { format: formatCurrency, currencyCode } = useCurrency();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [formData, setFormData] = useState<Partial<Expense>>({
        categoryId: '',
        amount: 0,
        description: '',
        expenseDate: formatDate(new Date(), 'yyyy-MM-dd'),
        paymentMethod: 'CASH',
        referenceNo: ''
    });

    useEffect(() => {
        fetchExpenses();
        fetchCategories();
    }, []);

    const fetchExpenses = async () => {
        try {
            setIsLoading(true);
            const data = await financeService.getExpenses();
            setExpenses(data);
        } catch (error) {
            toast.error('Failed to load expenses');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await financeService.getExpenseCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!formData.categoryId || !formData.amount || !formData.expenseDate) {
                toast.error('Please fill all required fields');
                return;
            }
            await financeService.recordExpense(formData as Expense);
            toast.success('Expense recorded successfully');
            setIsModalOpen(false);
            setFormData({
                categoryId: '',
                amount: 0,
                description: '',
                expenseDate: formatDate(new Date(), 'yyyy-MM-dd'),
                paymentMethod: 'CASH',
                referenceNo: ''
            });
            fetchExpenses();
        } catch (error) {
            toast.error('Failed to record expense');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this expense record?')) return;
        try {
            await financeService.deleteExpense(id);
            toast.success('Expense record deleted');
            fetchExpenses();
        } catch (error) {
            toast.error('Failed to delete record');
        }
    };

    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || exp.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const totalExpense = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary">Expense Management</h1>
                    <p className="text-sm text-content-secondary mt-1">Record and track institutional operational expenses</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Record Expense
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-xl shadow-sm border border-border flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-content-secondary">Total Expenses (Filtered)</p>
                        <p className="text-2xl font-bold text-content-primary mt-1">{formatCurrency(totalExpense)}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                        <Banknote className="h-6 w-6 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-surface p-4 rounded-xl shadow-sm border border-border flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
                    <input
                        type="text"
                        placeholder="Search by description or reference..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="w-full md:w-64 relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-surface font-medium text-content-primary"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-chrome">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Method</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-content-secondary uppercase">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-content-secondary uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-surface">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-content-secondary">Loading expenses...</td></tr>
                            ) : filteredExpenses.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-content-secondary">No expense records found</td></tr>
                            ) : (
                                filteredExpenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-chrome">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary font-medium">
                                            {formatDate(new Date(exp.expenseDate), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-content-primary font-semibold">
                                            {exp.categoryName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-content-secondary">
                                            {exp.description}
                                            {exp.referenceNo && <div className="text-xs text-content-muted mt-0.5">Ref: {exp.referenceNo}</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary">
                                            <span className="px-2 py-1 bg-chrome rounded text-xs font-medium uppercase">{exp.paymentMethod}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600">
                                            {formatCurrency(exp.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button
                                                onClick={() => handleDelete(exp.id!)}
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
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Record New Expense"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-content-primary bg-surface border border-border rounded-lg hover:bg-chrome"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="expense-form"
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Record Expense
                        </button>
                    </>
                }
            >
                <form id="expense-form" onSubmit={handleSubmit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-content-primary mb-1">Description *</label>
                        <input
                            type="text"
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Purpose of expense"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-content-primary mb-1">Category *</label>
                        <select
                            required
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-surface"
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-content-primary mb-1">Amount ({getCurrencySymbol(currencyCode)}) *</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-content-primary mb-1">Date *</label>
                        <input
                            type="date"
                            required
                            value={formData.expenseDate}
                            onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-content-primary mb-1">Payment Method</label>
                        <select
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-surface"
                        >
                            <option value="CASH">Cash</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="CHEQUE">Cheque</option>
                            <option value="UPI">UPI / Online</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-content-primary mb-1">Reference No / Bill No</label>
                        <input
                            type="text"
                            value={formData.referenceNo}
                            onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Optional bill or transaction reference"
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};
