import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Percent, DollarSign as DollarIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { financeService } from '../../../../api/financeService';
import type { FeeHead, FeeDiscount } from '../../../../types/finance';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import FloatingLabelInput from '../../../../components/common/FloatingLabelInput';
import Modal from '../../../../components/common/Modal';

const FeeConfigPage: React.FC = () => {
    const [loading, setLoading] = useState(false);

    // Data lists
    const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
    const [discounts, setDiscounts] = useState<FeeDiscount[]>([]);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

    // Form states
    const [newDiscount, setNewDiscount] = useState<Partial<FeeDiscount>>({ name: '', type: 'PERCENTAGE', value: 0, scope: 'GLOBAL', applicableFeeHeadIds: [] });

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [data, headsData] = await Promise.all([
                financeService.getFeeDiscounts(),
                financeService.getFeeHeads()
            ]);
            setDiscounts(data);
            setFeeHeads(headsData);
        } catch (error) {
            toast.error("Failed to fetch configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: FeeDiscount) => {
        setIsEditMode(true);
        setEditingId(item.id!);
        setNewDiscount({ 
            name: item.name, 
            type: item.type, 
            value: item.value, 
            scope: item.scope || 'GLOBAL', 
            applicableFeeHeadIds: item.applicableFeeHeadIds || [] 
        });
        setIsCreateModalOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode && editingId) {
                await financeService.updateFeeDiscount(editingId, newDiscount as FeeDiscount);
                toast.success("Discount updated");
            } else {
                await financeService.createFeeDiscount(newDiscount as FeeDiscount);
                toast.success("Discount created");
            }
            setNewDiscount({ name: '', type: 'PERCENTAGE', value: 0, scope: 'GLOBAL', applicableFeeHeadIds: [] });
            setIsCreateModalOpen(false);
            setIsEditMode(false);
            setEditingId(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Creation failed");
        }
    };

    const confirmDelete = (id: string, name: string) => {
        setItemToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await financeService.deleteFeeDiscount(itemToDelete.id);
            toast.success("Discount deleted");
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary">Fee Discounts</h1>
                    <p className="text-sm text-content-secondary">Manage scholarship, sibling, and merit-based discounts.</p>
                </div>
                <button
                    onClick={() => {
                        setIsEditMode(false);
                        setEditingId(null);
                        setNewDiscount({ name: '', type: 'PERCENTAGE', value: 0, scope: 'GLOBAL', applicableFeeHeadIds: [] });
                        setIsCreateModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    Add Discount
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-chrome text-content-secondary text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3 font-medium">Name</th>
                            <th className="px-6 py-3 font-medium">Type</th>
                            <th className="px-6 py-3 font-medium">Value</th>
                            <th className="px-6 py-3 font-medium">Scope</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-content-secondary">Loading...</td></tr>
                        ) : (
                            <>
                                {discounts.map(d => (
                                    <tr key={d.id} className="hover:bg-chrome">
                                        <td className="px-6 py-4 text-sm font-medium text-content-primary">{d.name}</td>
                                        <td className="px-6 py-4 text-sm text-content-secondary">{d.type}</td>
                                        <td className="px-6 py-4 text-sm text-content-primary font-mono">
                                            {d.type === 'PERCENTAGE' ? `${d.value}%` : `₹${d.value}`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-content-secondary uppercase tracking-tight font-bold">{d.scope || 'GLOBAL'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(d)} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => confirmDelete(d.id!, d.name)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </>
                        )}
                        {!loading && discounts.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-content-secondary">No discounts found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={`${isEditMode ? 'Edit' : 'New'} Discount`}
                footer={
                    <>
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 bg-chrome text-content-primary hover:bg-chrome rounded-lg transition-colors font-medium">Cancel</button>
                        <button type="submit" form="discount-form" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold shadow-lg shadow-indigo-500/20">Save Discount</button>
                    </>
                }
            >
                <form id="discount-form" onSubmit={handleCreate} className="p-4 space-y-4 max-h-[calc(100vh-15rem)] overflow-y-auto custom-scrollbar">
                    <FloatingLabelInput label="Discount Name" required value={newDiscount.name} onChange={e => setNewDiscount({ ...newDiscount, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-content-secondary uppercase px-1">Type</label>
                            <select className="w-full p-3 bg-chrome border border-border rounded-lg text-sm text-content-primary outline-none focus:ring-2 focus:ring-indigo-500" value={newDiscount.type} onChange={e => setNewDiscount({ ...newDiscount, type: e.target.value as any })}>
                                <option value="PERCENTAGE">Percentage</option>
                                <option value="FIXED">Fixed Amount</option>
                            </select>
                        </div>
                        <FloatingLabelInput label="Value" type="number" required value={newDiscount.value} onChange={e => setNewDiscount({ ...newDiscount, value: parseFloat(e.target.value) || 0 })} icon={newDiscount.type === 'PERCENTAGE' ? <Percent className="w-4 h-4" /> : <DollarIcon className="w-4 h-4" />} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-content-secondary uppercase px-1">Scope</label>
                            <select className="w-full p-3 bg-surface border border-border rounded-lg outline-none text-sm" value={newDiscount.scope || 'GLOBAL'} onChange={e => setNewDiscount({ ...newDiscount, scope: e.target.value as any })}>
                                <option value="GLOBAL">Global (All)</option>
                                <option value="SIBLING">Sibling Discount</option>
                                <option value="MERIT">Merit / Scholarship</option>
                                <option value="CUSTOM">Custom</option>
                            </select>
                        </div>
                    </div>
                    <div className="border border-border rounded-lg p-4 space-y-2">
                        <label className="text-xs font-semibold text-content-secondary uppercase">Applicable Fee Heads <span className="text-[10px] lowercase font-normal">(Leave empty for all)</span></label>
                        <div className="max-h-32 overflow-y-auto space-y-2">
                            {feeHeads.map(head => (
                                <label key={head.id} className="flex items-center gap-2 text-sm text-content-primary cursor-pointer hover:bg-chrome p-1 rounded transition-colors">
                                    <input
                                        type="checkbox"
                                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                        checked={newDiscount.applicableFeeHeadIds?.includes(head.id!) || false}
                                        onChange={(e) => {
                                            const newHeads = e.target.checked
                                                ? [...(newDiscount.applicableFeeHeadIds || []), head.id!]
                                                : (newDiscount.applicableFeeHeadIds || []).filter(id => id !== head.id);
                                            setNewDiscount({ ...newDiscount, applicableFeeHeadIds: newHeads });
                                        }}
                                    />
                                    {head.name}
                                </label>
                            ))}
                        </div>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete ${itemToDelete?.name}? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default FeeConfigPage;
