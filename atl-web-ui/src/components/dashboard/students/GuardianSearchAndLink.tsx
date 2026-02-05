import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { guardianService, type Guardian, type StudentGuardianMapping } from '../../../api/guardianService';
import {
    Search,
    UserPlus,
    Link as LinkIcon,
    Phone,
    CheckCircle2,
    X,
    Loader2,
    Save
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    studentId: string;
    onMappingCreated?: (mapping: StudentGuardianMapping) => void;
}

const GuardianSearchAndLink: React.FC<Props> = ({ studentId, onMappingCreated }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;

    const [searchPhone, setSearchPhone] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [foundGuardian, setFoundGuardian] = useState<Guardian | null>(null);
    const [hasAttemptedSearch, setHasAttemptedSearch] = useState(false);

    // Link/Mapping State
    const [mappingData, setMappingData] = useState({
        relation: 'Father',
        isPrimary: false
    });
    const [isLinking, setIsLinking] = useState(false);

    // Create New Guardian State
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newGuardian, setNewGuardian] = useState<Guardian>({
        name: '',
        phone: '',
        email: '',
        occupation: '',
        address: ''
    });

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchPhone.trim()) return;

        setIsSearching(true);
        setHasAttemptedSearch(true);
        setFoundGuardian(null);
        setShowCreateForm(false);

        try {
            const response = await guardianService.searchGuardianByPhone(tenantId!, searchPhone);
            if (response.data.status === 'SUCCESS') {
                setFoundGuardian(response.data.apiData);
            }
        } catch (error: any) {
            if (error.response?.status === 404) {
                // Not found is fine, we will offer to create
            } else {
                toast.error("Error searching guardian");
            }
        } finally {
            setIsSearching(false);
        }
    };

    const handleLink = async () => {
        if (!foundGuardian?.id) return;
        setIsLinking(true);
        try {
            const payload: StudentGuardianMapping = {
                studentId,
                guardianId: foundGuardian.id,
                relation: mappingData.relation,
                isPrimary: mappingData.isPrimary
            };
            const response = await guardianService.linkStudentToGuardian(payload);
            if (response.data.status === 'SUCCESS') {
                toast.success("Guardian linked successfully");
                setFoundGuardian(null);
                setSearchPhone('');
                setHasAttemptedSearch(false);
                if (onMappingCreated) onMappingCreated(response.data.apiData);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to link guardian");
        } finally {
            setIsLinking(false);
        }
    };

    const handleCreateAndLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLinking(true);
        try {
            // 1. Create Guardian
            const gResponse = await guardianService.createGuardian({ ...newGuardian, tenantId: tenantId! });
            const createdGuardian = gResponse.data.apiData;

            // 2. Link Student
            const payload: StudentGuardianMapping = {
                studentId,
                guardianId: createdGuardian.id,
                relation: mappingData.relation,
                isPrimary: mappingData.isPrimary
            };
            const mResponse = await guardianService.linkStudentToGuardian(payload);

            toast.success("Guardian created and linked");
            setShowCreateForm(false);
            setSearchPhone('');
            setHasAttemptedSearch(false);
            if (onMappingCreated) onMappingCreated(mResponse.data.apiData);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create/link guardian");
        } finally {
            setIsLinking(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 text-white rounded-lg">
                        <UserPlus className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-gray-900">Add Guardian</h3>
                </div>
            </div>

            <div className="p-6">
                {!foundGuardian && !showCreateForm && (
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1 group">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="tel"
                                placeholder="Search by phone number..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium"
                                value={searchPhone}
                                onChange={(e) => setSearchPhone(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching || !searchPhone}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            Find
                        </button>
                    </form>
                )}

                {/* Found Guardian Result */}
                {foundGuardian && (
                    <div className="animate-slide-down">
                        <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-indigo-900">{foundGuardian.name}</p>
                                    <p className="text-xs text-indigo-600/70 font-bold">{foundGuardian.phone}</p>
                                </div>
                            </div>
                            <button onClick={() => setFoundGuardian(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Relation to Student</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                                    value={mappingData.relation}
                                    onChange={(e) => setMappingData({ ...mappingData, relation: e.target.value })}
                                >
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Brother">Brother</option>
                                    <option value="Sister">Sister</option>
                                    <option value="Guardian">Guardian</option>
                                </select>
                            </div>
                            <div className="flex items-end pb-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-lg border-gray-100 text-indigo-600 focus:ring-indigo-600"
                                        checked={mappingData.isPrimary}
                                        onChange={(e) => setMappingData({ ...mappingData, isPrimary: e.target.checked })}
                                    />
                                    <span className="text-sm font-bold text-gray-700">Set as Primary</span>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={handleLink}
                            disabled={isLinking}
                            className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isLinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                            Link Existing Guardian
                        </button>
                    </div>
                )}

                {/* Not Found -> Offer to Create */}
                {hasAttemptedSearch && !foundGuardian && !showCreateForm && !isSearching && (
                    <div className="text-center py-6 animate-fade-in">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Search className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">Guardian Not Found</h4>
                        <p className="text-xs text-gray-500 mb-4">No master record exists for phone: {searchPhone}</p>
                        <button
                            onClick={() => {
                                setNewGuardian({ ...newGuardian, phone: searchPhone });
                                setShowCreateForm(true);
                            }}
                            className="bg-gray-900 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all"
                        >
                            Create New Guardian Record
                        </button>
                    </div>
                )}

                {/* Create Form */}
                {showCreateForm && (
                    <form onSubmit={handleCreateAndLink} className="space-y-5 animate-slide-up">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-full">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                                    placeholder="e.g. Robert Smith"
                                    value={newGuardian.name}
                                    onChange={(e) => setNewGuardian({ ...newGuardian, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Relation</label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700"
                                    value={mappingData.relation}
                                    onChange={(e) => setMappingData({ ...mappingData, relation: e.target.value })}
                                >
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Brother">Brother</option>
                                    <option value="Sister">Sister</option>
                                    <option value="Guardian">Guardian</option>
                                </select>
                            </div>
                            <div className="flex items-center pt-4 pl-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-lg border-gray-100 text-indigo-600 focus:ring-indigo-600"
                                        checked={mappingData.isPrimary}
                                        onChange={(e) => setMappingData({ ...mappingData, isPrimary: e.target.checked })}
                                    />
                                    <span className="text-[11px] font-bold text-gray-500 uppercase">Primary Contact</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="flex-1 py-3 border border-gray-100 rounded-2xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all"
                            >
                                Back to Search
                            </button>
                            <button
                                type="submit"
                                disabled={isLinking}
                                className="flex-[2] py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isLinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Create & Link
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default GuardianSearchAndLink;
