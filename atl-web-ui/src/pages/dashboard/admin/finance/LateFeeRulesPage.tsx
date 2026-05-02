import React, { useEffect, useState } from 'react';
import { 
    Clock, 
    Plus, 
    Edit2, 
    Trash2, 
    ShieldAlert, 
    CheckCircle2, 
    X, 
    Save, 
    HelpCircle,
    Percent,
    Banknote
} from 'lucide-react';
import { financeService } from '../../../../api/financeService';
import type { LateFeeRule } from '../../../../types/finance';
import toast from 'react-hot-toast';
import { useCurrency } from '../../../../context/CurrencyContext';
import { getCurrencySymbol } from '../../../../utils/currency';
import Modal from '../../../../components/common/Modal';

const LateFeeRulesPage: React.FC = () => {
    const { format, currencyCode } = useCurrency();
    const [rules, setRules] = useState<LateFeeRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<LateFeeRule | null>(null);
    const [formData, setFormData] = useState<Partial<LateFeeRule>>({
        name: '',
        type: 'FIXED',
        value: 0,
        gracePeriodDays: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await financeService.getLateFeeRules();
            setRules(data);
        } catch (error) {
            toast.error('Failed to fetch late fee rules');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (rule?: LateFeeRule) => {
        if (rule) {
            setEditingRule(rule);
            setFormData({ ...rule });
        } else {
            setEditingRule(null);
            setFormData({ name: '', type: 'FIXED', value: 0, gracePeriodDays: 0 });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRule?.id) {
                await financeService.updateLateFeeRule(editingRule.id, formData);
                toast.success('Rule updated successfully');
            } else {
                await financeService.createLateFeeRule(formData as LateFeeRule);
                toast.success('New rule established');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Abolish this late fee rule? Existing calculations might be affected.')) return;
        try {
            await financeService.deleteLateFeeRule(id);
            toast.success('Rule removed');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete rule');
        }
    };

    if (isLoading) return <div className="p-8 text-center text-content-muted font-medium">Synchronizing Rules...</div>;

    return (
        <div className="p-6 space-y-6 bg-chrome/50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary flex items-center gap-2">
                        <Clock className="text-rose-500" />
                        Late Fee Management
                    </h1>
                    <p className="text-content-secondary text-sm font-medium">Define automated penalty structures for overdue institutional fees.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 font-bold"
                >
                    <Plus size={18} />
                    New Policy Rule
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Rules List */}
                <div className="lg:col-span-2 space-y-4">
                    {rules.map((rule) => (
                        <div key={rule.id} className="bg-surface p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group flex items-center justify-between border-l-4 border-l-indigo-500">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    {rule.type === 'PERCENTAGE' ? <Percent size={20} /> : <Banknote size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-content-primary group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{rule.name}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-bold text-content-muted bg-chrome px-2 py-0.5 rounded uppercase">
                                            {rule.type} PAYALTY
                                        </span>
                                        <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">
                                            Value: {rule.type === 'PERCENTAGE' ? `${rule.value}%` : format(rule.value)}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-content-secondary font-medium italic">
                                        <ShieldAlert size={14} className="text-rose-400" />
                                        Applies after {rule.gracePeriodDays} days grace period.
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleOpenModal(rule)}
                                    className="p-2 text-content-muted hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(rule.id!)}
                                    className="p-2 text-content-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {rules.length === 0 && (
                        <div className="py-20 text-center bg-surface rounded-2xl border-2 border-dashed border-border">
                            <Clock size={48} className="mx-auto text-gray-200 mb-4" />
                            <h4 className="text-content-secondary font-bold text-xl">No policies defined</h4>
                            <p className="text-content-muted text-sm mt-1">Institutional late fees are currently disabled.</p>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="space-y-6">
                    <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 text-indigo-400/20">
                            <ShieldAlert size={120} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Automated Compliance</h3>
                            <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                                Rules defined here are automatically applied by the system's daily audit engine. 
                                Grace periods are calculated from the installment due date.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-xs font-bold">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                    Daily calculation @ 12:00 AM
                                </li>
                                <li className="flex items-center gap-2 text-xs font-bold">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                    Auto-integrated with Web Collections
                                </li>
                                <li className="flex items-center gap-2 text-xs font-bold">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                    Exemption control available per student
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-content-primary text-sm italic">Policy Overview</h3>
                            <HelpCircle size={16} className="text-gray-300" />
                        </div>
                        <p className="text-xs text-content-secondary leading-normal">
                            Properly configured late fee policies encourage timely payments and improve institutional cash flow predictability.
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    <div className="flex items-center gap-2">
                        <Clock size={20} className="text-indigo-600" />
                        <span className="uppercase tracking-tight">
                            {editingRule ? 'Modify Policy Rule' : 'Establish New Policy'}
                        </span>
                    </div>
                }
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2.5 text-sm font-bold text-content-secondary hover:bg-chrome rounded-xl transition-all"
                        >
                            Dismiss
                        </button>
                        <button
                            type="submit"
                            form="late-fee-form"
                            className="flex items-center px-10 py-2.5 text-sm font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all uppercase tracking-widest"
                        >
                            <Save size={18} className="mr-2" />
                            Commit Rule
                        </button>
                    </>
                }
            >
                <form id="late-fee-form" onSubmit={handleSubmit} className="p-4 space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-content-muted uppercase tracking-widest mb-1.5">Policy Identifier *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-chrome border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold placeholder:font-normal text-content-primary"
                            placeholder="e.g. Standard Monthly Penalty"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-content-muted uppercase tracking-widest mb-1.5">Penalty Type *</label>
                            <div className="flex p-1 bg-chrome rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'FIXED' })}
                                    className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${formData.type === 'FIXED' ? 'bg-surface text-indigo-600 shadow-sm' : 'text-content-secondary'}`}
                                >
                                    FIXED
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'PERCENTAGE' })}
                                    className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${formData.type === 'PERCENTAGE' ? 'bg-surface text-indigo-600 shadow-sm' : 'text-content-secondary'}`}
                                >
                                    PERCENT
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-content-muted uppercase tracking-widest mb-1.5">Penalty Value *</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted font-bold">
                                    {formData.type === 'PERCENTAGE' ? '%' : getCurrencySymbol(currencyCode)}
                                </div>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                    className="w-full pl-8 pr-4 py-3 bg-chrome border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-indigo-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-content-muted uppercase tracking-widest mb-1.5">Grace Period (Days) *</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.gracePeriodDays}
                            onChange={(e) => setFormData({ ...formData, gracePeriodDays: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-chrome border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-content-primary"
                        />
                        <p className="text-[10px] text-content-muted mt-2 italic">Policy becomes active X days after installment due date.</p>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default LateFeeRulesPage;
