import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, DollarSign as DollarIcon, Info, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { financeService } from '../../../../api/financeService';
import type { FeeHead } from '../../../../types/finance';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import FloatingLabelInput from '../../../../components/common/FloatingLabelInput';
import Modal from '../../../../components/common/Modal';

const FeeHeadManagementPage: React.FC = () => {
    const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<FeeHead | null>(null);

    // Form states
    const [formData, setFormData] = useState<Partial<FeeHead>>({ name: '', description: '' });
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchHeads();
    }, []);

    const fetchHeads = async () => {
        setLoading(true);
        try {
            const data = await financeService.getFeeHeads();
            setFeeHeads(data);
        } catch (error) {
            toast.error("Failed to fetch fee heads");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        setEditingId(null);
        setFormData({ name: '', description: '' });
        setIsCreateModalOpen(true);
    };

    const handleEdit = (head: FeeHead) => {
        setIsEditMode(true);
        setEditingId(head.id!);
        setFormData({ name: head.name, description: head.description });
        setIsCreateModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode && editingId) {
                await financeService.updateFeeHead(editingId, formData as FeeHead);
                toast.success("Fee Head updated successfully");
            } else {
                await financeService.createFeeHead(formData as FeeHead);
                toast.success("New Fee Head added");
            }
            setIsCreateModalOpen(false);
            fetchHeads();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const confirmDelete = (head: FeeHead) => {
        setItemToDelete(head);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete?.id) return;
        try {
            await financeService.deleteFeeHead(itemToDelete.id);
            toast.success("Fee Head removed");
            setIsDeleteModalOpen(false);
            fetchHeads();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Deletion failed");
        }
    };

    const filteredHeads = feeHeads.filter(head =>
        head.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        head.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 bg-chrome/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl shadow-sm border border-border">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary flex items-center gap-2">
                        <DollarIcon className="text-indigo-600" />
                        Fee Head Management
                    </h1>
                    <p className="text-content-secondary text-sm font-medium mt-1">Define categories for various institutional fees like Tuition, Transport, etc.</p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 font-bold"
                >
                    <Plus size={18} />
                    New Fee Head
                </button>
            </div>

            {/* Stats / Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <DollarIcon size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-content-muted uppercase tracking-widest">Total Heads</p>
                        <h3 className="text-2xl font-black text-content-primary">{feeHeads.length}</h3>
                    </div>
                </div>
                <div className="md:col-span-2 bg-indigo-900 text-white p-6 rounded-2xl shadow-xl flex items-center gap-6 overflow-hidden relative">
                    <Info className="absolute right-0 top-0 text-white/10 w-32 h-32 -mr-8 -mt-8" />
                    <div className="relative z-10">
                        <h4 className="font-bold flex items-center gap-2 mb-1 uppercase tracking-tight">
                            Quick Tip
                        </h4>
                        <p className="text-indigo-100 text-xs leading-relaxed">
                            Fee Heads are the fundamental building blocks of Fee Structures.
                            Ensure each head clearly represents a single cost component for accurate reporting.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters & Table */}
            <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search fee heads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-chrome border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-chrome/50 text-[10px] font-black text-content-muted uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Fee Head Name</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-sm font-bold text-content-muted uppercase tracking-tight">Synchronizing data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredHeads.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-content-secondary font-medium italic">
                                        No fee heads found. Click "New Fee Head" to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredHeads.map(head => (
                                    <tr key={head.id} className="hover:bg-chrome/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-content-primary group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                                {head.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 uppercase tracking-tight">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-sm">
                                            <p className="text-sm text-content-secondary font-medium truncate italic">
                                                {head.description || 'No description provided'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(head)}
                                                    className="p-2 text-content-muted hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit Head"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(head)}
                                                    className="p-2 text-content-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Remove Head"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create / Edit Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={isEditMode ? 'Modify Fee Head' : 'Add New Fee Head'}
                icon={<DollarIcon size={18} />}
                size="sm"
                footer={
                    <>
                        <button type="button" className="modal-btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Dismiss</button>
                        <button type="submit" form="fee-head-form" className="modal-btn-primary">
                            {isEditMode ? 'Update' : 'Confirm'}
                        </button>
                    </>
                }
            >
                <form id="fee-head-form" onSubmit={handleSubmit} className="space-y-4">
                    <FloatingLabelInput
                        label="Fee Head Identifier *"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black uppercase tracking-widest pl-1" style={{ color: 'var(--text-muted)' }}>Description / Purpose</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border rounded-xl outline-none text-sm font-medium min-h-[100px] resize-none"
                            style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            placeholder="Enter details about this fee category..."
                        />
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Abolish Fee Head"
                message={`Are you sure you want to remove '${itemToDelete?.name}'? Note: This might affect existing fee structures using this head.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default FeeHeadManagementPage;
