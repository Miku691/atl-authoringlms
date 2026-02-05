import React, { useEffect, useState } from 'react';
import { academicService } from '../../../../api/academicService';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    offeringId: string;
    className: string;
    tenantId: string;
}

interface Subject {
    id: string;
    code: string;
    title: string;
}

interface OfferingSubject {
    id: string; // Mapping ID
    subjectId: string;
    subjectName: string;
    isOptional: boolean;
    credits: number;
}

const SubjectMappingModal: React.FC<Props> = ({ isOpen, onClose, offeringId, className, tenantId }) => {
    const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
    const [mappedSubjects, setMappedSubjects] = useState<OfferingSubject[]>([]);
    const [loading, setLoading] = useState(true);

    // Add State
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [isOptional, setIsOptional] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    useEffect(() => {
        if (isOpen && offeringId && tenantId) {
            loadData();
        }
    }, [isOpen, offeringId, tenantId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [subjectsRes, mappedRes] = await Promise.all([
                academicService.getSubjects(tenantId),
                academicService.getOfferingSubjects(offeringId)
            ]);
            setAllSubjects(subjectsRes);
            if (mappedRes.status === 'SUCCESS') {
                setMappedSubjects(mappedRes.apiData);
            } else {
                setMappedSubjects([]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load subject data");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = async () => {
        if (!selectedSubjectId) return;

        // Check duplicate
        if (mappedSubjects.some(ms => ms.subjectId === selectedSubjectId)) {
            toast.error("Subject already mapped to this class");
            return;
        }

        setIsAdding(true);
        try {
            await academicService.mapSubjectToOffering({
                offeringId,
                subjectId: selectedSubjectId,
                isOptional,
                credits: 0 // Default
            });
            toast.success("Subject mapped successfully");
            setSelectedSubjectId('');
            setIsOptional(false);
            loadData(); // Refresh list
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to map subject");
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveSubject = (mappingId: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Unmap Subject',
            message: 'Are you sure you want to remove this subject from the class? Any timetable entries for this subject in this class will become invalid.',
            onConfirm: async () => {
                setBusyId(mappingId);
                try {
                    await academicService.unmapSubjectFromOffering(mappingId);
                    toast.success("Subject removed");
                    setMappedSubjects(prev => prev.filter(ms => ms.id !== mappingId));
                } catch (error) {
                    toast.error("Failed to remove subject");
                } finally {
                    setBusyId(null);
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 animate-scaleIn h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Manage Subjects</h3>
                        <p className="text-sm text-gray-500">for {className}</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    {/* Add New Section */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Map New Subject</h4>
                        <div className="flex flex-col md:flex-row gap-3 items-end">
                            <div className="flex-1 w-full">
                                <label className="text-xs text-gray-500 mb-1 block">Select Subject</label>
                                <select
                                    className="w-full p-2 border rounded-md text-sm"
                                    value={selectedSubjectId}
                                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                                >
                                    <option value="">-- Choose Subject --</option>
                                    {allSubjects?.filter(s => s != null).map(sub => (
                                        <option key={sub.id} value={sub.id} disabled={mappedSubjects?.some(ms => ms && ms.subjectId === sub.id)}>
                                            {sub.code} - {sub.title} {mappedSubjects?.some(ms => ms && ms.subjectId === sub.id) ? '(Mapped)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-32">
                                <label className="flex items-center gap-2 cursor-pointer mt-6">
                                    <input
                                        type="checkbox"
                                        checked={isOptional}
                                        onChange={(e) => setIsOptional(e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700">Optional</span>
                                </label>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddSubject}
                                disabled={!selectedSubjectId || isAdding || !!busyId}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add
                            </button>
                        </div>
                    </div>

                    {/* Mapped List */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Mapped Subjects ({mappedSubjects.length})</h4>
                        {loading ? (
                            <p className="text-center text-gray-500 text-sm py-4">Loading...</p>
                        ) : mappedSubjects.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                <p className="text-gray-500 text-sm">No subjects mapped to this class yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {mappedSubjects?.filter(ms => ms != null).map(ms => (
                                    <div key={ms.id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-indigo-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-8 rounded-full ${ms.isOptional ? 'bg-orange-400' : 'bg-green-500'}`}></div>
                                            <div>
                                                <p className="font-medium text-gray-900">{ms.subjectName}</p>
                                                <p className="text-xs text-gray-500">
                                                    {ms.isOptional ? 'Optional Subject' : 'Core Subject'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSubject(ms.id)}
                                            disabled={busyId === ms.id}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded hover:bg-red-50 disabled:opacity-100"
                                            title="Remove Subject"
                                        >
                                            {busyId === ms.id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t pt-4 mt-4 flex justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        Close
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                variant="danger"
            />
        </div>
    );
};

export default SubjectMappingModal;
