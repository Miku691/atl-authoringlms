import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../../store/store';
import { guardianService, type Guardian, type StudentGuardianMapping } from '../../../../../api/guardianService';
import {
    Users,
    Search,
    Edit,
    Trash2,
    Phone,
    Mail,
    ChevronDown,
    ChevronRight,
    Loader2,
    X,
    Save,
    UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

const GuardianManagementPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;

    const [guardians, setGuardians] = useState<Guardian[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedGuardianId, setExpandedGuardianId] = useState<string | null>(null);
    const [guardianStudents, setGuardianStudents] = useState<Record<string, StudentGuardianMapping[]>>({});

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);
    const [formData, setFormData] = useState<Guardian>({
        name: '',
        phone: '',
        email: '',
        occupation: '',
        address: ''
    });

    useEffect(() => {
        if (tenantId) fetchGuardians();
    }, [tenantId]);

    const fetchGuardians = async () => {
        setLoading(true);
        try {
            const response = await guardianService.getTenantGuardians(tenantId!);
            if (response.data.status === 'SUCCESS') {
                setGuardians(response.data.apiData);
            }
        } catch (error) {
            toast.error("Failed to fetch guardians");
        } finally {
            setLoading(false);
        }
    };

    const fetchLinkedStudents = async (guardianId: string) => {
        try {
            const response = await guardianService.getGuardianStudents(guardianId);
            if (response.data.status === 'SUCCESS') {
                setGuardianStudents(prev => ({
                    ...prev,
                    [guardianId]: response.data.apiData
                }));
            }
        } catch (error) {
            console.error("Failed to fetch linked students", error);
        }
    };

    const toggleExpand = (guardianId: string) => {
        if (expandedGuardianId === guardianId) {
            setExpandedGuardianId(null);
        } else {
            setExpandedGuardianId(guardianId);
            if (!guardianStudents[guardianId]) {
                fetchLinkedStudents(guardianId);
            }
        }
    };

    const handleEdit = (guardian: Guardian) => {
        setSelectedGuardian(guardian);
        setFormData({ ...guardian });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.phone.trim()) {
            toast.error("Name and Phone are required");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { ...formData, tenantId: tenantId as string };
            if (selectedGuardian?.id) {
                await guardianService.updateGuardian(selectedGuardian.id, payload);
                toast.success("Guardian updated");
            } else {
                await guardianService.createGuardian(payload);
                toast.success("Guardian created");
            }
            setIsModalOpen(false);
            fetchGuardians();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredGuardians = guardians.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.phone.includes(searchTerm) ||
        g.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Guardian Network</h1>
                        <p className="text-sm text-gray-500 font-medium">Manage family contacts and student links</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, phone or email..."
                            className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all w-full md:w-80 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => {
                            setSelectedGuardian(null);
                            setFormData({ name: '', phone: '', email: '', occupation: '', address: '' });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 whitespace-nowrap"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Guardian
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-indigo-500" />
                        <p className="font-medium">Loading guardian records...</p>
                    </div>
                ) : filteredGuardians.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No Guardians Found</h3>
                        <p className="text-sm text-gray-500 mb-6">Start building your community by adding family contacts.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-indigo-600 font-bold hover:underline"
                        >
                            Add your first guardian
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredGuardians.map(guardian => (
                            <div key={guardian.id} className="animate-fade-in group hover:bg-gray-50/50 transition-colors">
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg border border-indigo-100">
                                                {guardian.name[0]}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{guardian.name}</h3>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                                        <Phone className="w-3.5 h-3.5" /> {guardian.phone}
                                                    </span>
                                                    {guardian.email && (
                                                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                                            <Mail className="w-3.5 h-3.5" /> {guardian.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleExpand(guardian.id!)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${expandedGuardianId === guardian.id
                                                    ? 'bg-indigo-600 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {guardianStudents[guardian.id!]?.length || 0} Students
                                                {expandedGuardianId === guardian.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(guardian)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded: Linked Students */}
                                    {expandedGuardianId === guardian.id && (
                                        <div className="mt-6 pt-6 border-t border-gray-100 animate-slide-down">
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Wards / Students Linked</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {guardianStudents[guardian.id!]?.map(mapping => (
                                                    <div key={mapping.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-indigo-200 transition-colors group/ward">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                                                                {mapping.studentName?.[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">{mapping.studentName}</p>
                                                                <p className="text-[10px] text-gray-400 uppercase font-bold">{mapping.relation}</p>
                                                            </div>
                                                        </div>
                                                        {mapping.isPrimary && (
                                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-black uppercase tracking-tighter shadow-sm">Primary</span>
                                                        )}
                                                    </div>
                                                ))}
                                                {(!guardianStudents[guardian.id!] || guardianStudents[guardian.id!].length === 0) && (
                                                    <p className="col-span-full text-sm text-gray-400 italic py-2">No students linked to this guardian yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-slide-up">
                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">{selectedGuardian ? 'Update Profile' : 'New Family Contact'}</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Guardian Master Record</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 bg-white shadow-sm rounded-xl border border-gray-100"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-full">
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium"
                                        placeholder="e.g. John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium"
                                        placeholder="e.g. 9876543210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium"
                                        placeholder="e.g. john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Occupation</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium"
                                        placeholder="e.g. Software Engineer"
                                        value={formData.occupation}
                                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Residential Address</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium resize-none"
                                    rows={3}
                                    placeholder="Full home or office address..."
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3.5 bg-gray-50 text-gray-500 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all border border-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-70"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {selectedGuardian ? 'Update Records' : 'Save Guardian'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuardianManagementPage;
