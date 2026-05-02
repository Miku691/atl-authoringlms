import React, { useState, useEffect } from 'react';
import { 
    Plus, Trash2, Edit2, Save
} from 'lucide-react';
import { financeService } from '../../../../api/financeService';
import type { ExpenseCategory } from '../../../../types/finance';
import toast from 'react-hot-toast';
import Modal from '../../../../components/common/Modal';

export const ExpenseCategoryPage: React.FC = () => {
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
    const [formData, setFormData] = useState<Partial<ExpenseCategory>>({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const data = await financeService.getExpenseCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            toast.error('Failed to load expense categories');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await financeService.createExpenseCategory(formData as ExpenseCategory);
            toast.success(editingCategory ? 'Category updated' : 'Category created');
            setIsModalOpen(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
            fetchCategories();
        } catch (error) {
            toast.error('Failed to save category');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await financeService.deleteExpenseCategory(id);
            toast.success('Category deleted');
            fetchCategories();
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary">Expense Categories</h1>
                    <p className="text-sm text-content-secondary mt-1">Manage categories for institutional spending</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: '', description: '' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </button>
            </div>

            <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-chrome">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Category Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-content-secondary uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-surface">
                        {isLoading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-content-secondary">Loading...</td>
                            </tr>
                        ) : categories.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-content-secondary">No categories found</td>
                            </tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-chrome">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-content-primary">{cat.name}</td>
                                    <td className="px-6 py-4 text-sm text-content-secondary">{cat.description || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => {
                                                setEditingCategory(cat);
                                                setFormData(cat);
                                                setIsModalOpen(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(cat.id!)}
                                            className="text-red-600 hover:text-red-900"
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
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory ? 'Edit Category' : 'New Category'}
                icon={<Plus size={18} />}
                size="sm"
                footer={
                    <>
                        <button
                            type="button"
                            className="modal-btn-secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="exp-cat-form"
                            className="modal-btn-primary"
                        >
                            <Save className="h-4 w-4" />
                            {editingCategory ? 'Update' : 'Create'}
                        </button>
                    </>
                }
            >
                <form id="exp-cat-form" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Category Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2"
                            style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            placeholder="e.g. Utilities, Salary, Maintenance"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 resize-none"
                            style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            rows={3}
                            placeholder="Brief description of the category"
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};
