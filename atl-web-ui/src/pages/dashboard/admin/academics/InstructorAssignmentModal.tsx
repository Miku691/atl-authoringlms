import React, { useEffect, useState } from 'react';
import { instructorService } from '../../../../api/instructorService';
import { academicService } from '../../../../api/academicService';
import { Plus, Trash2, X, UserCheck, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    offeringId: string;
    className: string;
    tenantId: string;
}

interface Instructor {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
}

interface OfferingSubject {
    id: string; // Mapping ID
    subjectId: string;
    subjectName: string;
}

interface Assignment {
    id: string;
    instructorId: string;
    subjectId: string;
    role: string;
    instructorName?: string; // We'll need to enrich this
    subjectName?: string;
}

const InstructorAssignmentModal: React.FC<Props> = ({ isOpen, onClose, offeringId, className, tenantId }) => {
    const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
    const [offeringSubjects, setOfferingSubjects] = useState<OfferingSubject[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    // Add State
    const [selectedInstructorId, setSelectedInstructorId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [role, setRole] = useState('PRIMARY');
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
            const [instRes, subjectsRes, assignRes] = await Promise.all([
                instructorService.getInstructorsByTenant(tenantId),
                academicService.getOfferingSubjects(offeringId),
                instructorService.getAssignmentsByOffering(offeringId)
            ]);

            setAllInstructors(instRes.status === 'SUCCESS' ? instRes.apiData : []);
            setOfferingSubjects(subjectsRes.status === 'SUCCESS' ? subjectsRes.apiData : []);

            const rawAssignments = assignRes.status === 'SUCCESS' ? assignRes.apiData : [];

            // Enrich assignments with names
            const enriched = rawAssignments
                .filter((a: any) => a != null)
                .map((a: any) => {
                    const inst = instRes.apiData?.find((i: any) => i && i.id === a.instructorId);
                    const sub = subjectsRes.apiData?.find((s: any) => s && s.subjectId === a.subjectId);
                    return {
                        ...a,
                        instructorName: inst ? `${inst.firstName || ''} ${inst.lastName || ''}`.trim() || inst.username : 'Unknown Instructor',
                        subjectName: sub ? sub.subjectName : 'All Subjects'
                    };
                });

            setAssignments(enriched);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load assignment data");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedInstructorId) return;

        setIsAdding(true);
        try {
            await instructorService.assignToOffering({
                offeringId: offeringId,
                instructorId: selectedInstructorId,
                subjectId: selectedSubjectId || undefined,
                role: role,
                startDate: new Date().toISOString().split('T')[0]
            });
            toast.success("Instructor assigned successfully");
            setSelectedInstructorId('');
            setSelectedSubjectId('');
            loadData(); // Refresh list
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to assign instructor");
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemove = (assignmentId: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Remove Instructor',
            message: 'Are you sure you want to remove this instructor assignment? They will no longer be linked to this particular class and subject.',
            onConfirm: async () => {
                setBusyId(assignmentId);
                try {
                    await instructorService.removeAssignment(assignmentId);
                    toast.success("Assignment removed");
                    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
                } catch (error) {
                    toast.error("Failed to remove assignment");
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
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 animate-scaleIn h-[85vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <UserCheck className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Faculty Assignment</h3>
                            <p className="text-sm text-gray-500">for {className}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-8">
                    {/* Add Assignment Section */}
                    <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-100">
                        <h4 className="text-sm font-bold text-amber-900 mb-4 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> New Assignment
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div className="lg:col-span-1">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Instructor</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                                    value={selectedInstructorId}
                                    onChange={(e) => setSelectedInstructorId(e.target.value)}
                                >
                                    <option value="">-- Choose --</option>
                                    {allInstructors?.filter(i => i != null).map(inst => (
                                        <option key={inst.id} value={inst.id}>
                                            {inst.firstName} {inst.lastName} ({inst.specialization || 'No Specialization'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="lg:col-span-1">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Subject (Optional)</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                                    value={selectedSubjectId}
                                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                                >
                                    <option value="">Class Teacher (General)</option>
                                    {offeringSubjects?.filter(s => s != null).map(sub => (
                                        <option key={sub.subjectId} value={sub.subjectId}>
                                            {sub.subjectName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="lg:col-span-1">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Role</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="PRIMARY">Primary</option>
                                    <option value="SUBSTITUTE">Substitute</option>
                                    <option value="CO_TEACHER">Co-Teacher</option>
                                </select>
                            </div>

                            <button
                                onClick={handleAssign}
                                disabled={!selectedInstructorId || isAdding || !!busyId}
                                className="px-6 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 h-[38px]"
                            >
                                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Assign
                            </button>
                        </div>
                    </div>

                    {/* Active Assignments Section */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                            Active Faculty ({assignments.length})
                        </h4>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Plus className="w-8 h-8 animate-spin text-amber-500 mb-2" />
                                <p className="text-gray-500 text-sm italic">Loading assignments...</p>
                            </div>
                        ) : assignments.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                                <UserCheck className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                <p className="text-gray-500 text-sm">No faculty assigned to this class yet.</p>
                                <p className="text-xs text-gray-400 mt-1">Assign an instructor to manage attendance and curriculum.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {assignments?.filter(a => a != null).map(a => (
                                    <div key={a.id} className="group relative flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-amber-200 hover:shadow-md transition-all animate-fadeIn">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg">
                                                {a.instructorName?.[0] || '?'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{a.instructorName}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${a.role === 'PRIMARY' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {a.role}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                                        <BookOpen className="w-3 h-3" /> {a.subjectName}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(a.id)}
                                            disabled={busyId === a.id}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-100"
                                            title="Remove Assignment"
                                        >
                                            {busyId === a.id ? <Loader2 className="w-5 h-5 animate-spin text-red-500" /> : <Trash2 className="w-5 h-5" />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t pt-6 mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Done
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

export default InstructorAssignmentModal;
