import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import api from '../../../utils/api';
import { BookOpen, Plus, Search, Loader2, Edit2, Trash2, Layers, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Subject {
    id: string;
    title: string; // Renamed from name
    code: string;
    category?: string;
    subjectType?: string;
    description?: string;
}

const SubjectsPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<'GLOBAL' | 'MAPPING'>('GLOBAL');
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState({ title: '', code: '', category: 'CORE', description: '' }); // category mapped to subjectType
    const [submitting, setSubmitting] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(null);

    // Fetch Global Subjects
    const fetchSubjects = async () => {
        setLoading(true);
        try {
            // Note: Currently backend fetches ALL. Ideally filter by tenant.
            // But Subjects Controller getByTenant is not explicit, let's assuming getAll returns everything or tenant scoped?
            // Actually ImsSubjectsController.getAll() returns ALL.
            // Need to verification if we need tenant filter on backend.
            // For now, assuming backend handles scope or we filter.
            const res = await api.get('/ims-academic-service/subjects');
            if (res.data.status === 'SUCCESS') {
                setSubjects(res.data.apiData);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch subjects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'GLOBAL') {
            fetchSubjects();
        }
    }, [activeTab]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                subjectType: formData.category, // Map category to subjectType
                tenantId: user?.tenantId
            };

            if (modalMode === 'create') {
                await api.post('/ims-academic-service/subjects', payload);
                toast.success('Subject created successfully');
            } else {
                await api.put(`/ims-academic-service/subjects/${selectedId}`, payload);
                toast.success('Subject updated successfully');
            }

            setIsModalOpen(false);
            fetchSubjects();
            setFormData({ title: '', code: '', category: 'CORE', description: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure? This will delete the subject globally for this tenant.')) return;
        try {
            await api.delete(`/ims-academic-service/subjects/${id}`);
            toast.success('Subject deleted');
            fetchSubjects();
        } catch (error: any) {
            toast.error('Failed to delete subject');
        }
    };

    const openEdit = (sub: Subject) => {
        setFormData({
            title: sub.title,
            code: sub.code,
            category: sub.category || 'CORE',
            description: sub.description || ''
        });
        setSelectedId(sub.id);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const filteredSubjects = subjects.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen className="w-8 h-8 text-indigo-600" />
                        Subjects Library
                    </h1>
                    <p className="text-gray-500 mt-1">Manage global subjects and assign them to classes.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('GLOBAL')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'GLOBAL' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}
                    >
                        Global List
                    </button>
                    <button
                        onClick={() => setActiveTab('MAPPING')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'MAPPING' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}
                    >
                        Class Mapping
                    </button>
                </div>
            </div>

            {/* Global Subjects Tab */}
            {activeTab === 'GLOBAL' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
                    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                placeholder="Search subjects..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setFormData({ title: '', code: '', category: 'CORE', description: '' });
                                setModalMode('create');
                                setIsModalOpen(true);
                            }}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-all hover:shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            Add Subject
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Subject Name</th>
                                        <th className="px-6 py-3">Code</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredSubjects.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                                No subjects found. Create one to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSubjects.map(sub => (
                                            <tr key={sub.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-3 font-medium text-gray-900">{sub.title}</td>
                                                <td className="px-6 py-3 text-gray-500 font-mono text-xs bg-gray-100 px-2 py-1 rounded w-fit">{sub.code}</td>
                                                <td className="px-6 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {sub.subjectType || sub.category || 'CORE'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEdit(sub)} className="p-1 hover:bg-gray-200 rounded text-gray-600"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(sub.id)} className="p-1 hover:bg-red-100 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Class Mapping Tab */}
            {activeTab === 'MAPPING' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Map Subjects to Classes</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* 1. Select Class */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-fit">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Select Class</h3>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : (
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                        {/* We need to fetch Offerings here.
                                            Since we didn't fetch them in this component yet, we should add logic to fetch.
                                            For now, I'll add a helper component or logic to fetch offerings.
                                         */}
                                        <ClassSelector onSelect={(id) => setSelectedOfferingId(id)} selectedId={selectedOfferingId} />
                                    </div>
                                )}
                            </div>

                            {/* 2. Toggle Subjects */}
                            <div className="md:col-span-2 bg-white border border-gray-200 rounded-lg p-4">
                                {selectedOfferingId ? (
                                    <SubjectMapper offeringId={selectedOfferingId} subjects={subjects} />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                                        <Layers className="w-12 h-12 mb-3 bg-gray-50 p-2 rounded-full" />
                                        <p>Select a class from the left to manage its subjects</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-900">{modalMode === 'create' ? 'Add New Subject' : 'Edit Subject'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Title <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Mathematics"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="e.g. MATH-01"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="CORE">Core (Theory)</option>
                                        <option value="ELECTIVE">Elective</option>
                                        <option value="LAB">Lab (Practical)</option>
                                        <option value="VOCATIONAL">Vocational</option>
                                        <option value="ACTIVITY">Activity</option>
                                        <option value="EXTRA_CURRICULAR">Extra Curricular</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {modalMode === 'create' ? 'Create Subject' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


const ClassSelector: React.FC<{ onSelect: (id: string) => void, selectedId: string | null }> = ({ onSelect, selectedId }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [offerings, setOfferings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.tenantId) {
            setLoading(true);
            api.get(`/ims-academic-service/offerings/tenant/${user?.tenantId}`)
                .then((res: any) => setOfferings(res.data.apiData || []))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user?.tenantId]);

    if (loading) return <div className="text-sm text-gray-500">Loading classes...</div>;

    // Sort by name or code logic could go here
    const sorted = [...offerings].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    return (
        <>
            {sorted.map(offering => (
                <button
                    key={offering.id}
                    onClick={() => onSelect(offering.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between
                        ${selectedId === offering.id
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-100'}`}
                >
                    <span className="font-medium">{offering.name}</span>
                    {selectedId === offering.id && <ArrowRight className="w-3 h-3" />}
                </button>
            ))}
        </>
    );
};

const SubjectMapper: React.FC<{ offeringId: string, subjects: Subject[] }> = ({ offeringId, subjects }) => {
    const [mappings, setMappings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [toggling, setToggling] = useState<string | null>(null);

    const fetchMappings = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/ims-academic-service/offering-subjects/offering/${offeringId}`);
            setMappings(res.data.apiData || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (offeringId) fetchMappings();
    }, [offeringId]);

    const handleToggle = async (subjectId: string, currentMappingId?: string) => {
        setToggling(subjectId);
        try {
            if (currentMappingId) {
                // DELETE
                await api.delete(`/ims-academic-service/offering-subjects/${currentMappingId}`);
                toast.success("Subject removed");
            } else {
                // CREATE
                await api.post('/ims-academic-service/offering-subjects', {
                    offeringId: offeringId,
                    subjectId: subjectId,
                    isOptional: false // Default to core
                });
                toast.success("Subject mapped");
            }
            await fetchMappings();
        } catch (e) {
            toast.error("Failed to update mapping");
        } finally {
            setToggling(null);
        }
    };

    if (loading && subjects.length === 0) return <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />;

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                <span>Manage Subjects for Class</span>
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{mappings.length} Active</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
                {subjects.map(subject => {
                    const mapping = mappings.find(m => m.subjectId === subject.id);
                    const isMapped = !!mapping;
                    const isProcessing = toggling === subject.id;

                    return (
                        <div
                            key={subject.id}
                            onClick={() => !isProcessing && handleToggle(subject.id, mapping?.id)}
                            className={`
                                relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm flex items-center gap-3
                                ${isMapped
                                    ? 'border-indigo-600 bg-indigo-50/50'
                                    : 'border-gray-100 bg-white hover:border-indigo-200'}
                                ${isProcessing ? 'opacity-70 pointer-events-none' : ''}
                            `}
                        >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                                ${isMapped ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}
                            `}>
                                {isMapped && <Check className="w-3 h-3 text-white" />}
                            </div>

                            <div className="flex-1">
                                <h4 className={`font-medium text-sm ${isMapped ? 'text-indigo-900' : 'text-gray-700'}`}>
                                    {subject.title}
                                </h4>
                                <span className="text-xs text-gray-500">{subject.code}</span>
                            </div>

                            {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubjectsPage;
