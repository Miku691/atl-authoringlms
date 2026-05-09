import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../../store/store';
import api from '../../../../../utils/api';
import toast from 'react-hot-toast';
import PageHeader from '../../../../../components/common/PageHeader';
import { BookOpen, Layers, GraduationCap, Loader2, Plus, Trash2, Edit2, X, UserCheck } from 'lucide-react';
import ConfirmationModal from '../../../../../components/common/ConfirmationModal';
import SubjectMappingModal from '../SubjectMappingModal';
import InstructorAssignmentModal from '../InstructorAssignmentModal';
import Modal from '../../../../../components/common/Modal';

// --- Interfaces ---

interface Program {
    id: string;
    code: string;
    title: string;
    level: string;
}

interface Offering {
    id: string;
    programId: string;
    courseId?: string;
    name: string;
    type: string;
    capacity: number;
}

interface ImsCourse {
    id: string;
    tenantId: string;
    name: string;
    code: string;
    programId?: string;
}

// --- Component ---

const CoachingStructureView: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;

    // Data State
    const [programs, setPrograms] = useState<Program[]>([]);
    const [courses, setCourses] = useState<ImsCourse[]>([]);
    const [offerings, setOfferings] = useState<Offering[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const isAdmin = user?.roles?.some(r => ['TENANT_ADMIN', 'ADMIN'].includes(r));
    const [instructorId, setInstructorId] = useState<string | null>(null);

    // Modals
    const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProgramId, setSelectedProgramId] = useState<string>('');

    // Add Course Form
    const [newCourseName, setNewCourseName] = useState('');

    // Add Batch Form
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedCourseName, setSelectedCourseName] = useState<string>('');
    const [newBatchName, setNewBatchName] = useState('');
    const [defaultCapacity, setDefaultCapacity] = useState(40);

    const [editedCourse, setEditedCourse] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const [editedBatch, setEditedBatch] = useState<{
        id: string;
        name: string;
        capacity: number;
    } | null>(null);

    // Subject Mapping State
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [selectedOfferingIdForMapping, setSelectedOfferingIdForMapping] = useState('');
    const [selectedCourseNameForMapping, setSelectedCourseNameForMapping] = useState('');

    // Instructor Assignment State
    const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
    const [selectedOfferingIdForInstructor, setSelectedOfferingIdForInstructor] = useState('');
    const [selectedCourseNameForInstructor, setSelectedCourseNameForInstructor] = useState('');

    // Layout Expansion State
    const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (tenantId) {
            fetchData();
        }
    }, [tenantId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            let instId = instructorId;
            if (!isAdmin && !instId && user?.email && tenantId) {
                const res = await api.get(`/ims-instructor-service/instructors/profile/resolve?email=${user.email}&tenantId=${tenantId}`);
                if (res.data.status === 'SUCCESS') {
                    instId = res.data.apiData.id;
                    setInstructorId(instId);
                }
            }

            const [progRes, offRes, courseRes] = await Promise.all([
                api.get(`/ims-academic-service/programs/tenant/${tenantId}`),
                isAdmin
                    ? api.get(`/ims-academic-service/offerings/tenant/${tenantId}`)
                    : (instId ? api.get(`/ims-academic-service/offerings/instructor/${instId}`) : Promise.resolve({ data: { apiData: [] } })),
                api.get(`/ims-academic-service/courses/tenant/${tenantId}`)
            ]);

            if (progRes.data.status === 'SUCCESS') setPrograms(progRes.data.apiData);
            if (offRes.data.status === 'SUCCESS') setOfferings(offRes.data.apiData);
            if (courseRes.data.status === 'SUCCESS') setCourses(courseRes.data.apiData);

        } catch (error) {
            console.error('Error fetching academic data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Handlers ---

    const handleAddCourse = async () => {
        if (!newCourseName || !selectedProgramId) return;
        setIsSubmitting(true);
        try {
            await api.post('/ims-academic-service/courses', {
                tenantId,
                name: newCourseName,
                code: newCourseName.toUpperCase().replace(/\s+/g, '-'),
                programId: selectedProgramId
            });

            toast.success("Course added successfully");
            setIsAddCourseOpen(false);
            setNewCourseName('');
            fetchData();
        } catch (e: any) {
            console.error(e);
            toast.error(e.response?.data?.message || "Failed to add course");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddBatch = async () => {
        if (!newBatchName || !selectedCourseId || !selectedProgramId) return;
        setIsSubmitting(true);
        try {
            await api.post('/ims-academic-service/offerings', {
                tenantId,
                programId: selectedProgramId,
                courseId: selectedCourseId,
                name: newBatchName,
                type: 'COACHING_BATCH',
                capacity: defaultCapacity
            });

            toast.success("Batch added successfully");
            setIsBatchModalOpen(false);
            setNewBatchName('');
            fetchData();
        } catch (e: any) {
            console.error(e);
            toast.error(e.response?.data?.message || "Failed to add batch");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateCourse = async () => {
        if (!editedCourse) return;
        setIsSubmitting(true);
        try {
            await api.patch(`/ims-academic-service/courses/${editedCourse.id}`, {
                name: editedCourse.name
            });
            toast.success("Course updated");
            setEditedCourse(null);
            fetchData();
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to update course");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateBatch = async () => {
        if (!editedBatch) return;
        setIsSubmitting(true);
        try {
            await api.patch(`/ims-academic-service/offerings/${editedBatch.id}`, {
                name: editedBatch.name,
                capacity: editedBatch.capacity
            });
            toast.success("Batch updated");
            setEditedBatch(null);
            fetchData();
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to update batch");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        type: 'COURSE' as 'COURSE' | 'BATCH',
        id: ''
    });

    const confirmDelete = async () => {
        setIsSubmitting(true);
        try {
            if (deleteModal.type === 'COURSE') {
                await api.delete(`/ims-academic-service/courses/${deleteModal.id}`);
                toast.success("Course deleted");
            } else {
                await api.delete(`/ims-academic-service/offerings/${deleteModal.id}`);
                toast.success("Batch deleted");
            }
            fetchData();
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to delete " + deleteModal.type.toLowerCase());
        } finally {
            setIsSubmitting(false);
            setDeleteModal({ ...deleteModal, isOpen: false });
        }
    };

    const openSubjectMapping = (courseName: string, offeringId: string) => {
        setSelectedCourseNameForMapping(courseName);
        setSelectedOfferingIdForMapping(offeringId);
        setIsSubjectModalOpen(true);
    };

    const openInstructorAssignment = (courseName: string, offeringId: string) => {
        setSelectedCourseNameForInstructor(courseName);
        setSelectedOfferingIdForInstructor(offeringId);
        setIsInstructorModalOpen(true);
    };

    const getCoursesForProgram = (progId: string) => {
        return courses
            .filter(c => c.programId === progId || (!c.programId && programs.length > 0 && programs[0].id === progId))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    };

    const getBatchesForCourse = (courseId: string) => {
        return offerings.filter(o => o.courseId === courseId);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Academic Structure"
                description={`Manage your courses and batches.`}
                actions={isAdmin && programs.length > 0 && (
                    <button
                        onClick={() => { 
                            setSelectedProgramId(programs[0].id); 
                            setIsAddCourseOpen(true); 
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Course
                    </button>
                )}
            />

            <div className="space-y-8">
                {programs.filter(p => isAdmin || getCoursesForProgram(p.id).length > 0).map((program) => {
                    const programCourses = getCoursesForProgram(program.id);

                    return (
                        <div key={program.id} className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden animate-fadeIn">
                            <div className="p-4 bg-chrome border-b border-border flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg">
                                        <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-content-primary">{program.title}</h3>
                                        <p className="text-xs text-content-secondary">{program.code} • {program.level}</p>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <button
                                        onClick={() => {
                                            setSelectedProgramId(program.id);
                                            setIsAddCourseOpen(true);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" /> Add Course
                                    </button>
                                )}
                            </div>

                            <div className="p-4">
                                {programCourses.length === 0 ? (
                                    <div className="text-center py-8 text-content-secondary">
                                        <Layers className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p>No courses found. Add one to get started.</p>
                                    </div>
                                ) : (
                                    <div className={`grid gap-6 ${program.level === 'COACHING' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                                        {programCourses.map(course => {
                                            const courseBatches = getBatchesForCourse(course.id);
                                            const isExpanded = expandedCourses[course.id];
                                            const displayedBatches = isExpanded ? courseBatches : courseBatches.slice(0, 3);

                                            return (
                                                <div key={course.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow relative group">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="font-bold text-content-primary text-lg">{course.name}</h4>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {isAdmin && (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedCourseId(course.id);
                                                                            setSelectedCourseName(course.name);
                                                                            setSelectedProgramId(program.id);
                                                                            setIsBatchModalOpen(true);
                                                                        }}
                                                                        className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all border border-indigo-100 dark:border-indigo-500/20 hover:border-indigo-200 dark:hover:border-indigo-500/30"
                                                                    >
                                                                        <Plus className="w-3.5 h-3.5" /> Batch
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditedCourse({ id: course.id, name: course.name })}
                                                                        className="text-gray-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setDeleteModal({ isOpen: true, type: 'COURSE', id: course.id })}
                                                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {courseBatches.length > 0 && (
                                                            <p className="text-xs font-semibold text-content-secondary uppercase">Batches</p>
                                                        )}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {displayedBatches.map(batch => (
                                                                <div key={batch.id} className="flex flex-col bg-chrome/50 rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow p-3">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="font-bold text-content-primary">{batch.name}</span>
                                                                        {isAdmin && (
                                                                            <div className="flex gap-1">
                                                                                <button
                                                                                    onClick={() => setEditedBatch({ id: batch.id, name: batch.name, capacity: batch.capacity })}
                                                                                    className="p-1 text-content-muted hover:text-indigo-600 rounded"
                                                                                >
                                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setDeleteModal({ isOpen: true, type: 'BATCH', id: batch.id })}
                                                                                    className="p-1 text-content-muted hover:text-red-500 rounded"
                                                                                >
                                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[10px] text-content-muted mb-3">Capacity: {batch.capacity || 40}</p>
                                                                    <div className="flex gap-1.5 flex-wrap mt-auto">
                                                                        <button
                                                                            onClick={() => openSubjectMapping(`${course.name} - ${batch.name}`, batch.id)}
                                                                            className="flex-1 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded text-[10px] font-bold flex items-center justify-center gap-1"
                                                                        >
                                                                            <BookOpen className="w-3 h-3" /> Subjects
                                                                        </button>
                                                                        {isAdmin && (
                                                                            <button
                                                                                onClick={() => openInstructorAssignment(`${course.name} - ${batch.name}`, batch.id)}
                                                                                className="flex-1 py-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded text-[10px] font-bold flex items-center justify-center gap-1"
                                                                            >
                                                                                <UserCheck className="w-3 h-3" /> Faculty
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {courseBatches.length > 3 && (
                                                            <button 
                                                                onClick={() => setExpandedCourses(prev => ({...prev, [course.id]: !prev[course.id]}))}
                                                                className="w-full py-2 bg-surface border border-dashed border-border rounded-xl text-content-muted hover:text-indigo-600 transition-all text-xs font-bold uppercase"
                                                            >
                                                                {expandedCourses[course.id] ? 'Show Less' : `View All ${courseBatches.length} Batches`}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            <Modal isOpen={isAddCourseOpen} onClose={() => setIsAddCourseOpen(false)} title="Add Course" footer={
                <>
                    <button onClick={() => setIsAddCourseOpen(false)} className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-lg">Cancel</button>
                    <button onClick={handleAddCourse} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Create
                    </button>
                </>
            }>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-content-primary">Course Name</label>
                        <input value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} placeholder="e.g. JEE Mains" className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!editedCourse} onClose={() => setEditedCourse(null)} title="Edit Course" footer={
                <>
                    <button onClick={() => setEditedCourse(null)} className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-lg">Cancel</button>
                    <button onClick={handleUpdateCourse} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Update
                    </button>
                </>
            }>
                {editedCourse && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Course Name</label>
                            <input value={editedCourse.name} onChange={(e) => setEditedCourse({ ...editedCourse, name: e.target.value })} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title={`Add Batch to ${selectedCourseName}`} footer={
                <>
                    <button onClick={() => setIsBatchModalOpen(false)} className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-lg">Cancel</button>
                    <button onClick={handleAddBatch} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Add
                    </button>
                </>
            }>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-content-primary">Batch Name</label>
                        <input value={newBatchName} onChange={(e) => setNewBatchName(e.target.value)} placeholder="e.g. Morning Batch" className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-content-primary">Capacity</label>
                        <input type="number" value={defaultCapacity} onChange={(e) => setDefaultCapacity(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!editedBatch} onClose={() => setEditedBatch(null)} title="Edit Batch" footer={
                <>
                    <button onClick={() => setEditedBatch(null)} className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-lg">Cancel</button>
                    <button onClick={handleUpdateBatch} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Update
                    </button>
                </>
            }>
                {editedBatch && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Batch Name</label>
                            <input value={editedBatch.name} onChange={(e) => setEditedBatch({ ...editedBatch, name: e.target.value })} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Capacity</label>
                            <input type="number" value={editedBatch.capacity} onChange={(e) => setEditedBatch({ ...editedBatch, capacity: Number(e.target.value) })} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
                title={`Delete ${deleteModal.type === 'COURSE' ? 'Course' : 'Batch'}`}
                message={`Are you sure you want to delete this ${deleteModal.type.toLowerCase()}? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />

            {isSubjectModalOpen && tenantId && (
                <SubjectMappingModal
                    isOpen={isSubjectModalOpen}
                    onClose={() => setIsSubjectModalOpen(false)}
                    offeringId={selectedOfferingIdForMapping}
                    className={selectedCourseNameForMapping}
                    tenantId={tenantId}
                />
            )}

            {isInstructorModalOpen && tenantId && (
                <InstructorAssignmentModal
                    isOpen={isInstructorModalOpen}
                    onClose={() => setIsInstructorModalOpen(false)}
                    offeringId={selectedOfferingIdForInstructor}
                    className={selectedCourseNameForInstructor}
                    tenantId={tenantId}
                />
            )}
        </div>
    );
};

export default CoachingStructureView;
