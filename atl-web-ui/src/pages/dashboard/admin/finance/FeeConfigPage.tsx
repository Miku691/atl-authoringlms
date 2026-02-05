import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Percent, DollarSign as DollarIcon, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { financeService } from '../../../../api/financeService';
import type { FeeHead, FeeDiscount, LateFeeRule } from '../../../../types/finance';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import FloatingLabelInput from '../../../../components/common/FloatingLabelInput';

const FeeConfigPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'HEADS' | 'DISCOUNTS' | 'RULES'>('HEADS');
    const [loading, setLoading] = useState(false);

    // Data lists
    const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
    const [discounts, setDiscounts] = useState<FeeDiscount[]>([]);
    const [rules, setRules] = useState<LateFeeRule[]>([]);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string; name: string } | null>(null);

    // Form states
    const [newFeeHead, setNewFeeHead] = useState<Partial<FeeHead>>({ name: '', description: '' });
    const [newDiscount, setNewDiscount] = useState<Partial<FeeDiscount>>({ name: '', type: 'PERCENTAGE', value: 0 });
    const [newRule, setNewRule] = useState<Partial<LateFeeRule>>({ name: '', type: 'FIXED', value: 0, gracePeriodDays: 0 });

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'HEADS') {
                const data = await financeService.getFeeHeads();
                setFeeHeads(data);
            } else if (activeTab === 'DISCOUNTS') {
                const data = await financeService.getFeeDiscounts();
                setDiscounts(data);
            } else if (activeTab === 'RULES') {
                const data = await financeService.getLateFeeRules();
                setRules(data);
            }
        } catch (error) {
            toast.error("Failed to fetch configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (type: 'HEAD' | 'DISCOUNT' | 'RULE', item: any) => {
        setIsEditMode(true);
        setEditingId(item.id);
        if (type === 'HEAD') {
            setNewFeeHead({ name: item.name, description: item.description });
        } else if (type === 'DISCOUNT') {
            setNewDiscount({ name: item.name, type: item.type, value: item.value });
        } else if (type === 'RULE') {
            setNewRule({ name: item.name, type: item.type, value: item.value, gracePeriodDays: item.gracePeriodDays });
        }
        setIsCreateModalOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (activeTab === 'HEADS') {
                if (isEditMode && editingId) {
                    await financeService.updateFeeHead(editingId, newFeeHead as FeeHead);
                    toast.success("Fee Head updated");
                } else {
                    await financeService.createFeeHead(newFeeHead as FeeHead);
                    toast.success("Fee Head created");
                }
                setNewFeeHead({ name: '', description: '' });
            } else if (activeTab === 'DISCOUNTS') {
                if (isEditMode && editingId) {
                    await financeService.updateFeeDiscount(editingId, newDiscount as FeeDiscount);
                    toast.success("Discount updated");
                } else {
                    await financeService.createFeeDiscount(newDiscount as FeeDiscount);
                    toast.success("Discount created");
                }
                setNewDiscount({ name: '', type: 'PERCENTAGE', value: 0 });
            } else if (activeTab === 'RULES') {
                if (isEditMode && editingId) {
                    await financeService.updateLateFeeRule(editingId, newRule as LateFeeRule);
                    toast.success("Rule updated");
                } else {
                    await financeService.createLateFeeRule(newRule as LateFeeRule);
                    toast.success("Rule created");
                }
                setNewRule({ name: '', type: 'FIXED', value: 0, gracePeriodDays: 0 });
            }
            setIsCreateModalOpen(false);
            setIsEditMode(false);
            setEditingId(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Creation failed");
        }
    };

    const confirmDelete = (type: string, id: string, name: string) => {
        setItemToDelete({ type, id, name });
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            if (itemToDelete.type === 'HEAD') await financeService.deleteFeeHead(itemToDelete.id);
            else if (itemToDelete.type === 'DISCOUNT') await financeService.deleteFeeDiscount(itemToDelete.id);
            else if (itemToDelete.type === 'RULE') await financeService.deleteLateFeeRule(itemToDelete.id);

            toast.success("Item deleted");
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
                    <h1 className="text-2xl font-bold text-gray-900">Finance Configuration</h1>
                    <p className="text-sm text-gray-500">Manage fee heads, discounts, and late fee policies.</p>
                </div>
                <button
                    onClick={() => {
                        setIsEditMode(false);
                        setEditingId(null);
                        setNewFeeHead({ name: '', description: '' });
                        setNewDiscount({ name: '', type: 'PERCENTAGE', value: 0 });
                        setNewRule({ name: '', type: 'FIXED', value: 0, gracePeriodDays: 0 });
                        setIsCreateModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    Add {activeTab === 'HEADS' ? 'Fee Head' : activeTab === 'DISCOUNTS' ? 'Discount' : 'Rule'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
                {(['HEADS', 'DISCOUNTS', 'RULES'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                    </button>
                ))}
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3 font-medium">Name</th>
                            {activeTab !== 'HEADS' && <th className="px-6 py-3 font-medium">Type</th>}
                            {activeTab !== 'HEADS' && <th className="px-6 py-3 font-medium">Value</th>}
                            {activeTab === 'RULES' && <th className="px-6 py-3 font-medium">Grace Period</th>}
                            {activeTab === 'HEADS' && <th className="px-6 py-3 font-medium">Description</th>}
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                        ) : (
                            <>
                                {activeTab === 'HEADS' && feeHeads.map(head => (
                                    <tr key={head.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{head.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{head.description || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit('HEAD', head)} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => confirmDelete('HEAD', head.id!, head.name)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'DISCOUNTS' && discounts.map(d => (
                                    <tr key={d.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{d.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{d.type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                                            {d.type === 'PERCENTAGE' ? `${d.value}%` : `₹${d.value}`}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit('DISCOUNT', d)} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => confirmDelete('DISCOUNT', d.id!, d.name)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'RULES' && rules.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{r.type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                                            {r.type === 'PERCENTAGE' ? `${r.value}%` : `₹${r.value}`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{r.gracePeriodDays} Days</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit('RULE', r)} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => confirmDelete('RULE', r.id!, r.name)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </>
                        )}
                        {!loading && ((activeTab === 'HEADS' && feeHeads.length === 0) || (activeTab === 'DISCOUNTS' && discounts.length === 0) || (activeTab === 'RULES' && rules.length === 0)) && (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No items found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit' : 'New'} {activeTab === 'HEADS' ? 'Fee Head' : activeTab === 'DISCOUNTS' ? 'Discount' : 'Late Fee Rule'}</h2>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            {activeTab === 'HEADS' && (
                                <>
                                    <FloatingLabelInput label="Fee Head Name" required value={newFeeHead.name} onChange={e => setNewFeeHead({ ...newFeeHead, name: e.target.value })} icon={<Plus className="w-4 h-4" />} />
                                    <FloatingLabelInput label="Description" value={newFeeHead.description} onChange={e => setNewFeeHead({ ...newFeeHead, description: e.target.value })} />
                                </>
                            )}
                            {activeTab === 'DISCOUNTS' && (
                                <>
                                    <FloatingLabelInput label="Discount Name" required value={newDiscount.name} onChange={e => setNewDiscount({ ...newDiscount, name: e.target.value })} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase px-1">Type</label>
                                            <select className="w-full p-3 border rounded-lg" value={newDiscount.type} onChange={e => setNewDiscount({ ...newDiscount, type: e.target.value as any })}>
                                                <option value="PERCENTAGE">Percentage</option>
                                                <option value="FIXED">Fixed Amount</option>
                                            </select>
                                        </div>
                                        <FloatingLabelInput label="Value" type="number" required value={newDiscount.value} onChange={e => setNewDiscount({ ...newDiscount, value: parseFloat(e.target.value) })} icon={newDiscount.type === 'PERCENTAGE' ? <Percent className="w-4 h-4" /> : <DollarIcon className="w-4 h-4" />} />
                                    </div>
                                </>
                            )}
                            {activeTab === 'RULES' && (
                                <>
                                    <FloatingLabelInput label="Rule Name" required value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase px-1">Penalty Type</label>
                                            <select className="w-full p-3 border rounded-lg" value={newRule.type} onChange={e => setNewRule({ ...newRule, type: e.target.value as any })}>
                                                <option value="FIXED">Fixed Amount</option>
                                                <option value="PERCENTAGE">Percentage</option>
                                            </select>
                                        </div>
                                        <FloatingLabelInput label="Value" type="number" required value={newRule.value} onChange={e => setNewRule({ ...newRule, value: parseFloat(e.target.value) })} icon={newRule.type === 'PERCENTAGE' ? <Percent className="w-4 h-4" /> : <DollarIcon className="w-4 h-4" />} />
                                    </div>
                                    <FloatingLabelInput label="Grace Period (Days)" type="number" required value={newRule.gracePeriodDays} onChange={e => setNewRule({ ...newRule, gracePeriodDays: parseInt(e.target.value) })} icon={<Clock className="w-4 h-4" />} />
                                </>
                            )}
                            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Config</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
