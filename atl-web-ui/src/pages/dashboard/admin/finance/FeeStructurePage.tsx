import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Search, Layers, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/store';
import { financeService } from '../../../../api/financeService';
import { academicService, type ImsOffering } from '../../../../api/academicService';
import type { FeeHead, FeeStructure } from '../../../../types/finance';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import FloatingLabelInput from '../../../../components/common/FloatingLabelInput';
import { useCurrency } from '../../../../context/CurrencyContext';
import { getCurrencySymbol } from '../../../../utils/currency';

const FeeStructurePage: React.FC = () => {
    const { format, currencyCode } = useCurrency();
    const { user } = useSelector((state: RootState) => state.auth);
    const [structures, setStructures] = useState<FeeStructure[]>([]);
    const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
    const [offerings, setOfferings] = useState<ImsOffering[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newStructure, setNewStructure] = useState<Partial<FeeStructure>>({
        feeHeadId: '',
        offeringId: '',
        amount: 0,
        academicYear: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString().slice(-2)
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
            const [structData, headData, offeringData] = await Promise.all([
                financeService.getFeeStructures(),
                financeService.getFeeHeads(),
                academicService.getOfferingsByTenant(user!.tenantId!)
            ]);
            setStructures(structData);
            setFeeHeads(headData);
            setOfferings(offeringData);
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
                    <h1 className="text-2xl font-bold text-gray-900">Fee Structure</h1>
                    <p className="text-sm text-gray-500">Map fee heads to classes/batches and set seasonal amounts.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    New Mapping
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Filter by Class:</span>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => setSelectedOfferingId('ALL')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedOfferingId === 'ALL'
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 ring-2 ring-indigo-100'
                                    : 'bg-white text-gray-500 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                                    }`}
                            >
                                All Classes
                            </button>
                            {offerings.map(offering => (
                                <button
                                    key={offering.id}
                                    onClick={() => setSelectedOfferingId(offering.id)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedOfferingId === offering.id
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 ring-2 ring-indigo-100'
                                        : 'bg-white text-gray-500 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                                        }`}
                                >
                                    {offering.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Mapped Fee Heads 
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">{filteredStructures.length}</span>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search heads..."
                            className="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3 font-medium">Offering</th>
                                <th className="px-6 py-3 font-medium">Fee Head</th>
                                <th className="px-6 py-3 font-medium">Academic Year</th>
                                <th className="px-6 py-3 font-medium text-right">Amount</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading mappings...</td></tr>
                            ) : filteredStructures.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No mappings found.</td></tr>
                            ) : (
                                filteredStructures.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-indigo-500" />
                                                <span className="text-sm font-medium text-gray-900">{getOfferingName(s.offeringId)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{getHeadName(s.feeHeadId)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">{s.academicYear}</td>
                                        <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">{format(s.amount)}</td>
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
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="p-6 border-b bg-gray-50">
                            <h2 className="text-xl font-bold">Map Fee to Offering</h2>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase px-1">Offering (Class/Batch)</label>
                                <select required className="w-full p-3 border rounded-lg" value={newStructure.offeringId} onChange={e => setNewStructure({ ...newStructure, offeringId: e.target.value })}>
                                    <option value="">-- Select Offering --</option>
                                    {offerings.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase px-1">Fee Head</label>
                                <select required className="w-full p-3 border rounded-lg" value={newStructure.feeHeadId} onChange={e => setNewStructure({ ...newStructure, feeHeadId: e.target.value })}>
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
                            <FloatingLabelInput label="Academic Year" placeholder="e.g. 2024-25" required value={newStructure.academicYear} onChange={e => setNewStructure({ ...newStructure, academicYear: e.target.value })} icon={<Calendar className="w-4 h-4" />} />

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={isCreating} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                    {isCreating ? 'Mapping...' : 'Create Mapping'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
