import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import api from '../../../../utils/api';
import toast from 'react-hot-toast';
import { BookOpen, Layers, GraduationCap, Loader2, Plus, Trash2, Edit2, X, UserCheck } from 'lucide-react';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import SubjectMappingModal from './SubjectMappingModal';
import InstructorAssignmentModal from './InstructorAssignmentModal';

// --- Interfaces ---

interface Program {
    id: string;
    code: string;
    title: string;
    level: string;
    board: string;
}

interface Offering {
    id: string;
    programId: string;
    sessionId: string;
    name: string;
    type: string;
    capacity: number;
}

interface ImsClass {
    id: string;
    tenantId: string;
    name: string;
    code: string;
}

interface ImsSection {
    id: string;
    tenantId: string;
    classId: string;
    name: string;
    offeringId?: string;
    offeringName?: string;
}

// --- Component ---

const AcademicStructurePage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;

    // Data State
    const [programs, setPrograms] = useState<Program[]>([]);
    const [offerings, setOfferings] = useState<Offering[]>([]);
    const [classes, setClasses] = useState<ImsClass[]>([]);
    const [sections, setSections] = useState<ImsSection[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const isAdmin = user?.roles?.some(r => ['TENANT_ADMIN', 'ADMIN'].includes(r));
    const [instructorId, setInstructorId] = useState<string | null>(null);

    // Modals
    const [isAddClassOpen, setIsAddClassOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProgramId, setSelectedProgramId] = useState<string>('');

    // Add Class Form
    const [newClassName, setNewClassName] = useState('');
    const [defaultCapacity, setDefaultCapacity] = useState(40);

    // Add Section Form
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedClassName, setSelectedClassName] = useState<string>('');
    const [newSectionName, setNewSectionName] = useState('');

    const [editedClass, setEditedClass] = useState<{
        id: string;
        offeringId: string;
        name: string;
        capacity: number;
        type: string;
    } | null>(null);

    const [editedSection, setEditedSection] = useState<{
        id: string;
        name: string;
        capacity: number;
        offeringId: string;
    } | null>(null);

    // Subject Mapping State
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [selectedOfferingIdForMapping, setSelectedOfferingIdForMapping] = useState('');
    const [selectedClassNameForMapping, setSelectedClassNameForMapping] = useState('');

    // Instructor Assignment State
    const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
    const [selectedOfferingIdForInstructor, setSelectedOfferingIdForInstructor] = useState('');
    const [selectedClassNameForInstructor, setSelectedClassNameForInstructor] = useState('');

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
                // Resolve instructor ID if not admin and missing
                const res = await api.get(`/ims-instructor-service/instructors/profile/resolve?email=${user.email}&tenantId=${tenantId}`);
                if (res.data.status === 'SUCCESS') {
                    instId = res.data.apiData.id;
                    setInstructorId(instId);
                }
            }

            const [progRes, offRes, classRes, secRes] = await Promise.all([
                api.get(`/ims-academic-service/programs/tenant/${tenantId}`),
                isAdmin
                    ? api.get(`/ims-academic-service/offerings/tenant/${tenantId}`)
                    : (instId ? api.get(`/ims-academic-service/offerings/instructor/${instId}`) : Promise.resolve({ data: { apiData: [] } })),
                api.get(`/ims-academic-service/classes/tenant/${tenantId}`),
                api.get(`/ims-academic-service/sections/tenant/${tenantId}`)
            ]);

            if (progRes.data.status === 'SUCCESS') setPrograms(progRes.data.apiData);
            if (offRes.data.status === 'SUCCESS') setOfferings(offRes.data.apiData);
            if (classRes.data.status === 'SUCCESS') setClasses(classRes.data.apiData);
            if (secRes.data.status === 'SUCCESS') setSections(secRes.data.apiData);
            else setSections([]);

        } catch (error) {
            console.error('Error fetching academic data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Handlers ---

    const handleAddClass = async () => {
        if (!newClassName || !selectedProgramId) return;
        setIsSubmitting(true);
        try {
            await api.post('/ims-academic-service/classes', {
                tenantId,
                name: newClassName,
                code: newClassName.toUpperCase().replace(/\s+/g, '-'),
                programId: selectedProgramId,
                capacity: defaultCapacity
            });

            toast.success("Class Added");
            setIsAddClassOpen(false);
            setNewClassName('');
            fetchData();
        } catch (e: any) {
            console.error(e);
            toast.error(e.response?.data?.message || "Failed to add class");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddSection = async () => {
        if (!newSectionName || !selectedClassId || !selectedProgramId) return;
        setIsSubmitting(true);
        try {
            await api.post('/ims-academic-service/sections', {
                tenantId,
                classId: selectedClassId,
                name: newSectionName,
                programId: selectedProgramId,
                capacity: defaultCapacity
            });

            toast.success("Section Added");
            setIsSectionModalOpen(false);
            setNewSectionName('');
            fetchData();
        } catch (e: any) {
            console.error(e);
            toast.error(e.response?.data?.message || "Failed to add section");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateClass = async () => {
        if (!editedClass) return;
        setIsSubmitting(true);
        try {
            await api.patch(`/ims-academic-service/classes/${editedClass.id}`, {
                name: editedClass.name
            });
            toast.success("Class Updated");
            setEditedClass(null);
            fetchData();
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to update class");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateSection = async () => {
        if (!editedSection) return;
        setIsSubmitting(true);
        try {
            await api.patch(`/ims-academic-service/sections/${editedSection.id}`, {
                name: editedSection.name,
                capacity: editedSection.capacity,
                offeringId: editedSection.offeringId
            });
            toast.success("Section Updated");
            setEditedSection(null);
            fetchData();
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to update section");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        type: 'CLASS' as 'CLASS' | 'SECTION',
        id: '',
        offeringId: ''
    });

    const handleDeleteClass = (classId: string, offeringId: string) => {
        setDeleteModal({
            isOpen: true,
            type: 'CLASS',
            id: classId,
            offeringId: offeringId
        });
    };

    const handleDeleteSection = (sectionId: string) => {
        setDeleteModal({
            isOpen: true,
            type: 'SECTION',
            id: sectionId,
            offeringId: ''
        });
    };

    const confirmDelete = async () => {
        setIsSubmitting(true);
        try {
            if (deleteModal.type === 'CLASS') {
                await api.delete(`/ims-academic-service/classes/${deleteModal.id}`);
                await api.delete(`/ims-academic-service/offerings/${deleteModal.offeringId}`);
                toast.success("Class Deleted");
            } else {
                await api.delete(`/ims-academic-service/sections/${deleteModal.id}`);
                toast.success("Section Deleted");
            }
            fetchData();
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to delete " + deleteModal.type.toLowerCase());
        } finally {
            setIsSubmitting(false);
            setDeleteModal({ ...deleteModal, isOpen: false });
        }
    };

    const openSubjectMapping = (className: string, offeringId: string) => {
        setSelectedClassNameForMapping(className);
        setSelectedOfferingIdForMapping(offeringId);
        setIsSubjectModalOpen(true);
    };

    const openInstructorAssignment = (className: string, offeringId: string) => {
        setSelectedClassNameForInstructor(className);
        setSelectedOfferingIdForInstructor(offeringId);
        setIsInstructorModalOpen(true);
    };

    const getClassesForProgram = (progId: string) => {
        const progOfferingIds = offerings.filter(o => o.programId === progId).map(o => o.id);
        const progSectionClassIds = sections
            .filter(s => s.offeringId && progOfferingIds.includes(s.offeringId))
            .map(s => s.classId);

        return classes
            .filter(c => progSectionClassIds.includes(c.id))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    };

    const getSectionsForClass = (classId: string) => {
        return sections.filter(s => s.classId === classId);
    };

    const getOfferingForSection = (sectionId: string) => {
        const section = sections.find(s => s.id === sectionId);
        return offerings.find(o => o.id === section?.offeringId);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Academic Structure</h1>
                    <p className="text-sm text-gray-500">Manage your classes and sections.</p>
                </div>
                {isAdmin && programs.length > 0 && (
                    <button
                        onClick={() => { setSelectedProgramId(programs[0].id); setIsAddClassOpen(true); }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Class
                    </button>
                )}
            </div>

            <div className="space-y-8">
                {programs.filter(p => isAdmin || getClassesForProgram(p.id).length > 0).map((program) => {
                    const programClasses = getClassesForProgram(program.id);

                    return (
                        <div key={program.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
                            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{program.title}</h3>
                                        <p className="text-xs text-gray-500">{program.code} • {program.level}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                {programClasses.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Layers className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p>No classes found. Add one to get started.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {programClasses.map(cls => {
                                            const clsSections = getSectionsForClass(cls.id);

                                            return (
                                                <div key={cls.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative group">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 text-lg">{cls.name}</h4>
                                                            <p className="text-xs text-gray-400 capitalize">{program.level.toLowerCase()}</p>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            {isAdmin && (
                                                                <>
                                                                    <button
                                                                        onClick={() => setEditedClass({
                                                                            id: cls.id,
                                                                            offeringId: '', // Class no longer has offering
                                                                            name: cls.name,
                                                                            capacity: 0,
                                                                            type: 'SCHOOL_CLASS'
                                                                        })}
                                                                        className="text-gray-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                                        title="Edit Class"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteClass(cls.id, '')}
                                                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                                        title="Delete Class"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase">Sections & Offerings</p>
                                                            {isAdmin && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedClassId(cls.id);
                                                                        setSelectedClassName(cls.name);
                                                                        setSelectedProgramId(program.id);
                                                                        setIsSectionModalOpen(true);
                                                                    }}
                                                                    className="text-indigo-600 hover:text-indigo-700 text-xs flex items-center gap-1 font-medium"
                                                                >
                                                                    <Plus className="w-3 h-3" /> Add Section
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-2">
                                                            {clsSections.map(sec => {
                                                                const secOffering = getOfferingForSection(sec.id);
                                                                return (
                                                                    <div key={sec.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100 group/sec">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="w-8 h-8 flex items-center justify-center bg-white rounded border border-gray-200 text-sm font-bold text-gray-700">
                                                                                {sec.name}
                                                                            </span>
                                                                            <div>
                                                                                <p className="text-xs text-gray-400">Cap: {secOffering?.capacity || '-'}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <button
                                                                                onClick={() => openSubjectMapping(`${cls.name} - ${sec.name}`, sec.offeringId || '')}
                                                                                className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-white rounded transition-colors"
                                                                                title="Manage Subjects"
                                                                                disabled={!sec.offeringId}
                                                                            >
                                                                                <BookOpen className="w-3.5 h-3.5" />
                                                                            </button>
                                                                            {isAdmin && (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() => openInstructorAssignment(`${cls.name} - ${sec.name}`, sec.offeringId || '')}
                                                                                        className="p-1 text-gray-400 hover:text-amber-600 hover:bg-white rounded transition-colors"
                                                                                        title="Assign Faculty"
                                                                                        disabled={!sec.offeringId}
                                                                                    >
                                                                                        <UserCheck className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setEditedSection({
                                                                                                id: sec.id,
                                                                                                name: sec.name,
                                                                                                capacity: secOffering?.capacity || 40,
                                                                                                offeringId: sec.offeringId || ''
                                                                                            });
                                                                                            setSelectedClassName(cls.name);
                                                                                        }}
                                                                                        className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-white rounded transition-colors"
                                                                                        title="Edit Section"
                                                                                    >
                                                                                        <Edit2 className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleDeleteSection(sec.id)}
                                                                                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-white rounded transition-colors"
                                                                                        title="Delete Section"
                                                                                    >
                                                                                        <X className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
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

            {/* Add Class Modal */}
            {isAddClassOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-scaleIn">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Class</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Class Name</label>
                                <input
                                    value={newClassName}
                                    onChange={(e) => setNewClassName(e.target.value)}
                                    placeholder="e.g. Class 5"
                                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Total Capacity</label>
                                <input
                                    type="number"
                                    value={defaultCapacity}
                                    onChange={(e) => setDefaultCapacity(Number(e.target.value))}
                                    className="w-full mt-1 p-2 border rounded-lg"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setIsAddClassOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg" disabled={isSubmitting}>Cancel</button>
                                <button onClick={handleAddClass} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Class Modal */}
            {editedClass && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-scaleIn">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Class</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Class Name</label>
                                <input
                                    value={editedClass.name}
                                    onChange={(e) => setEditedClass({ ...editedClass, name: e.target.value })}
                                    placeholder="e.g. Class 5"
                                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setEditedClass(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg" disabled={isSubmitting}>Cancel</button>
                                <button onClick={handleUpdateClass} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Section Modal */}
            {isSectionModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-scaleIn">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Add Section to {selectedClassName}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Section Name</label>
                                <input
                                    value={newSectionName}
                                    onChange={(e) => setNewSectionName(e.target.value)}
                                    placeholder="e.g. A, B, Rose"
                                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setIsSectionModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg" disabled={isSubmitting}>Cancel</button>
                                <button onClick={handleAddSection} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Subject Mapping Modal */}
            {isSubjectModalOpen && tenantId && (
                <SubjectMappingModal
                    isOpen={isSubjectModalOpen}
                    onClose={() => setIsSubjectModalOpen(false)}
                    offeringId={selectedOfferingIdForMapping}
                    className={selectedClassNameForMapping}
                    tenantId={tenantId}
                />
            )}

            {/* Instructor Assignment Modal */}
            {isInstructorModalOpen && tenantId && (
                <InstructorAssignmentModal
                    isOpen={isInstructorModalOpen}
                    onClose={() => setIsInstructorModalOpen(false)}
                    offeringId={selectedOfferingIdForInstructor}
                    className={selectedClassNameForInstructor}
                    tenantId={tenantId}
                />
            )}

            {/* Edit Section Modal */}
            {editedSection && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-scaleIn">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Section in {selectedClassName}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Section Name</label>
                                <input
                                    value={editedSection.name}
                                    onChange={(e) => setEditedSection({ ...editedSection, name: e.target.value })}
                                    placeholder="e.g. A, B"
                                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                                <input
                                    type="number"
                                    value={editedSection.capacity}
                                    onChange={(e) => setEditedSection({ ...editedSection, capacity: Number(e.target.value) })}
                                    className="w-full mt-1 p-2 border rounded-lg"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setEditedSection(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg" disabled={isSubmitting}>Cancel</button>
                                <button onClick={handleUpdateSection} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
                title={deleteModal.type === 'CLASS' ? "Delete Class" : "Delete Section"}
                message={deleteModal.type === 'CLASS'
                    ? "Are you sure you want to delete this Class? This will also delete all sections associated with it. This action cannot be undone."
                    : "Are you sure you want to delete this Section? This action cannot be undone."}
                variant="danger"
            />
        </div>
    );
};

export default AcademicStructurePage;
