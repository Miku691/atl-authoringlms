import React, { useEffect, useState } from 'react';
import { academicService } from '../../../../api/academicService';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import Modal from '../../../../components/common/Modal';

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
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Manage Subjects"
                size="2xl"
                footer={
                    <button type="button" onClick={onClose} className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-lg">
                        Close
                    </button>
                }
            >
                <div className="flex flex-col h-full">
                    <p className="text-sm text-content-secondary mb-4">for {className}</p>

                    <div className="flex-1 overflow-y-auto pr-2">
                        {/* Add New Section */}
                        <div className="bg-chrome p-4 rounded-lg mb-6 border border-border">
                            <h4 className="text-sm font-semibold text-content-primary mb-3">Map New Subject</h4>
                            <div className="flex flex-col md:flex-row gap-3 items-end">
                                <div className="flex-1 w-full">
                                    <label className="text-xs text-content-secondary mb-1 block">Select Subject</label>
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
                                            className="rounded border-border text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-content-primary">Optional</span>
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
                            <h4 className="text-sm font-semibold text-content-primary mb-3">Mapped Subjects ({mappedSubjects.length})</h4>
                            {loading ? (
                                <p className="text-center text-content-secondary text-sm py-4">Loading...</p>
                            ) : mappedSubjects.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                                    <p className="text-content-secondary text-sm">No subjects mapped to this class yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {mappedSubjects?.filter(ms => ms != null).map(ms => (
                                        <div key={ms.id} className="flex justify-between items-center p-3 bg-surface border border-border rounded-lg shadow-sm hover:border-indigo-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-8 rounded-full ${ms.isOptional ? 'bg-orange-400' : 'bg-green-500'}`}></div>
                                                <div>
                                                    <p className="font-medium text-content-primary">{ms.subjectName}</p>
                                                    <p className="text-xs text-content-secondary">
                                                        {ms.isOptional ? 'Optional Subject' : 'Core Subject'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSubject(ms.id)}
                                                disabled={busyId === ms.id}
                                                className="p-1 text-content-muted hover:text-red-500 transition-colors rounded hover:bg-red-50 disabled:opacity-100"
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
                </div>
            </Modal>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                variant="danger"
            />
        </>
    );
};

export default SubjectMappingModal;
