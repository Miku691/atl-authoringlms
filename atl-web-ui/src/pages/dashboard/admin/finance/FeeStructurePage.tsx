import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Search, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/store';
import { financeService } from '../../../../api/financeService';
import { academicService, type ImsOffering, type AcademicSession } from '../../../../api/academicService';
import type { FeeHead, FeeStructure } from '../../../../types/finance';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import FloatingLabelInput from '../../../../components/common/FloatingLabelInput';
import { useCurrency } from '../../../../context/CurrencyContext';
import { getCurrencySymbol } from '../../../../utils/currency';
import Modal from '../../../../components/common/Modal';

const FeeStructurePage: React.FC = () => {
    const { format, currencyCode } = useCurrency();
    const { user } = useSelector((state: RootState) => state.auth);
    const [structures, setStructures] = useState<FeeStructure[]>([]);
    const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
    const [offerings, setOfferings] = useState<ImsOffering[]>([]);
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newStructure, setNewStructure] = useState<Partial<FeeStructure>>({
        feeHeadId: '',
        offeringId: '',
        amount: 0,
        academicYear: ''
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<FeeStructure | null>(null);

    useEffect(() => {
        if (user?.tenantId) {
            fetchInitialData();
        }
    }, [user?.tenantId]);

    const [selectedOfferingId, setSelectedOfferingId] = useState<string>('ALL');

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [structData, headData, offeringData, sessionData] = await Promise.all([
                financeService.getFeeStructures(),
                financeService.getFeeHeads(),
                academicService.getOfferingsByTenant(user!.tenantId!),
                academicService.getSessionsByTenant(user!.tenantId!)
            ]);
            setStructures(structData);
            setFeeHeads(headData);
            setOfferings(offeringData);
            setSessions(sessionData);

            // Set default academic year to current session if available
            const currentSession = sessionData.find((s: AcademicSession) => s.isCurrent);
            if (currentSession) {
                setNewStructure(prev => ({ ...prev, academicYear: currentSession.name }));
            }
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await financeService.createFeeStructure(newStructure as FeeStructure);
            toast.success("Fee structure mapped successfully");
            setIsCreateModalOpen(false);
            setNewStructure({ ...newStructure, feeHeadId: '', amount: 0 });
            fetchInitialData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Mapping failed");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await financeService.deleteFeeStructure(itemToDelete.id!);
            toast.success("Mapping removed");
            setIsDeleteModalOpen(false);
            fetchInitialData();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const getHeadName = (id: string) => feeHeads.find(h => h.id === id)?.name || id;
    const getOfferingName = (id: string) => offerings.find(o => o.id === id)?.name || id;

    const filteredStructures = structures.filter(s => {
        const matchesOffering = selectedOfferingId === 'ALL' || s.offeringId === selectedOfferingId;
        const matchesSearch = searchTerm === '' ||
            getHeadName(s.feeHeadId).toLowerCase().includes(searchTerm.toLowerCase()) ||
            getOfferingName(s.offeringId).toLowerCase().includes(searchTerm.toLowerCase());
        return matchesOffering && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary">Fee Structure</h1>
                    <p className="text-sm text-content-secondary">Map fee heads to classes/batches and set seasonal amounts.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    New Mapping
                </button>
            </div>

            <div className="bg-surface rounded-xl shadow-sm border border-border">
                <div className="p-6 border-b border-border bg-chrome/30">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-[10px] font-black text-content-muted uppercase tracking-widest px-1">Filter by Class:</span>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => setSelectedOfferingId('ALL')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedOfferingId === 'ALL'
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/30'
                                    : 'bg-surface text-content-secondary border border-border hover:border-indigo-300 hover:text-indigo-600'
                                    }`}
                            >
                                All Classes
                            </button>
                            {offerings.map(offering => (
                                <button
                                    key={offering.id}
                                    onClick={() => setSelectedOfferingId(offering.id)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedOfferingId === offering.id
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/30'
                                        : 'bg-surface text-content-secondary border border-border hover:border-indigo-300 hover:text-indigo-600'
                                        }`}
                                >
                                    {offering.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div className="text-xs font-bold text-content-muted uppercase tracking-widest">
                        Mapped Fee Heads
                        <span className="ml-2 px-2 py-0.5 bg-chrome rounded-full text-content-secondary">{filteredStructures.length}</span>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-content-muted w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search heads..."
                            className="w-full pl-9 pr-4 py-1.5 text-xs bg-chrome border border-border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-content-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-chrome text-content-secondary text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3 font-medium">Offering</th>
                                <th className="px-6 py-3 font-medium">Fee Head</th>
                                <th className="px-6 py-3 font-medium">Academic Year</th>
                                <th className="px-6 py-3 font-medium text-right">Amount</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-content-secondary">Loading mappings...</td></tr>
                            ) : filteredStructures.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-content-secondary">No mappings found.</td></tr>
                            ) : (
                                filteredStructures.map(s => (
                                    <tr key={s.id} className="hover:bg-chrome">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-indigo-500" />
                                                <span className="text-sm font-medium text-content-primary">{getOfferingName(s.offeringId)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-content-primary">{getHeadName(s.feeHeadId)}</td>
                                        <td className="px-6 py-4 text-sm text-content-secondary font-mono">{s.academicYear}</td>
                                        <td className="px-6 py-4 text-sm text-right font-bold text-content-primary">{format(s.amount)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => { setItemToDelete(s); setIsDeleteModalOpen(true); }} className="text-red-600 hover:bg-red-50 p-1 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Map Fee to Offering"
                icon={<Layers size={18} />}
                size="sm"
                footer={
                    <>
                        <button type="button" className="modal-btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                        <button type="submit" form="fee-struct-form" disabled={isCreating} className="modal-btn-primary">
                            {isCreating ? 'Mapping...' : 'Create Mapping'}
                        </button>
                    </>
                }
            >
                <form id="fee-struct-form" onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Offering (Class/Batch)</label>
                        <select required className="w-full px-4 py-2.5 border rounded-xl outline-none" style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} value={newStructure.offeringId} onChange={e => setNewStructure({ ...newStructure, offeringId: e.target.value })}>
                            <option value="">-- Select Offering --</option>
                            {offerings.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Fee Head</label>
                        <select required className="w-full px-4 py-2.5 border rounded-xl outline-none" style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} value={newStructure.feeHeadId} onChange={e => setNewStructure({ ...newStructure, feeHeadId: e.target.value })}>
                            <option value="">-- Select Fee Head --</option>
                            {feeHeads.map(h => {
                                const isMapped = structures.some(s => s.offeringId === newStructure.offeringId && s.feeHeadId === h.id);
                                return (
                                    <option key={h.id} value={h.id} disabled={isMapped}>
                                        {h.name} {isMapped ? '(Already Mapped)' : ''}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <FloatingLabelInput label="Amount" type="number" required value={newStructure.amount} onChange={e => setNewStructure({ ...newStructure, amount: parseFloat(e.target.value) })} icon={<span>{getCurrencySymbol(currencyCode)}</span>} />
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Academic Year</label>
                        <select required className="w-full px-4 py-2.5 border rounded-xl outline-none" style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} value={newStructure.academicYear} onChange={e => setNewStructure({ ...newStructure, academicYear: e.target.value })}>
                            <option value="">-- Select Academic Year --</option>
                            {sessions.sort((a, b) => b.name.localeCompare(a.name)).map(s => (
                                <option key={s.id} value={s.name}>{s.name} {s.isCurrent ? '(Current)' : ''}</option>
                            ))}
                        </select>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Remove Mapping"
                message="Are you sure you want to remove this fee head from the offering? This will not delete existing student records."
                confirmText="Remove"
                variant="danger"
            />
        </div>
    );
};

export default FeeStructurePage;
