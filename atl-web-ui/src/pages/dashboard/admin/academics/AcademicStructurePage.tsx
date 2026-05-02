import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import api from '../../../../utils/api';
import toast from 'react-hot-toast';
import PageHeader from '../../../../components/common/PageHeader';
import { BookOpen, Layers, GraduationCap, Loader2, Plus, Trash2, Edit2, X, UserCheck } from 'lucide-react';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import SubjectMappingModal from './SubjectMappingModal';
import InstructorAssignmentModal from './InstructorAssignmentModal';
import Modal from '../../../../components/common/Modal';

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
    classId?: string;
    name: string;
    type: string;
    capacity: number;
}

interface ImsClass {
    id: string;
    tenantId: string;
    name: string;
    code: string;
    programId?: string;
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
    const [semesterCount, setSemesterCount] = useState(8);

    // Terminology Helper
    const getTerm = (level: string, type: 'BRANCH' | 'SEMESTER' | 'SECTION' | 'ADD_BRANCH' | 'TOTAL_BRANCHES' = 'BRANCH') => {
        const isCollege = ['UNDERGRAD', 'POSTGRAD'].includes(level);
        const isCoaching = level === 'COACHING';
        const isSchool = level === 'SCHOOL';

        switch (type) {
            case 'ADD_BRANCH': return isCollege ? 'Add Branch' : isCoaching ? 'Add Course' : 'Add Class';
            case 'BRANCH': return isCollege ? 'Branch' : isCoaching ? 'Course' : 'Class';
            case 'SEMESTER': return isCollege ? 'Semester' : isCoaching ? 'Batch' : isSchool ? 'Section' : 'Offering';
            case 'TOTAL_BRANCHES': return isCollege ? 'Total Semesters' : isCoaching ? 'Total Batches' : 'Total Sections';
            case 'SECTION': return 'Section';
            default: return '';
        }
    };

    // Add Section Form
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedClassName, setSelectedClassName] = useState<string>('');
    const [newSectionName, setNewSectionName] = useState('');
    const [newSectionOfferingId, setNewSectionOfferingId] = useState('');
    const [sectionError, setSectionError] = useState('');

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

    // Layout Expansion State
    const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});

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
                capacity: defaultCapacity,
                semesterCount: semesterCount
            });

            toast.success("Success");
            setIsAddClassOpen(false);
            setNewClassName('');
            fetchData();
        } catch (e: any) {
            console.error(e);
            toast.error(e.response?.data?.message || "Failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddSemester = async (clsId: string, progId: string, currentOffCount: number) => {
        setIsSubmitting(true);
        try {
            const level = programs.find(p => p.id === progId)?.level || 'COLLEGE';
            const clsName = classes.find(c => c.id === clsId)?.name || '';
            const offName = level === 'SCHOOL' 
                ? `${clsName} - ${String.fromCharCode(65 + currentOffCount)}` 
                : getTerm(level, 'SEMESTER') + " " + (currentOffCount + 1);
            const offeringType = level === 'SCHOOL' ? 'SCHOOL_CLASS' : level === 'COLLEGE' ? 'COLLEGE_PROGRAM' : 'COACHING_BATCH';
            
            const response = await api.post('/ims-academic-service/offerings', {
                tenantId,
                programId: progId,
                classId: clsId,
                name: offName,
                type: offeringType,
                capacity: defaultCapacity
            });

            if (level === 'SCHOOL') {
                await api.post('/ims-academic-service/sections', {
                    tenantId,
                    classId: clsId,
                    name: String.fromCharCode(65 + currentOffCount),
                    programId: progId,
                    capacity: defaultCapacity,
                    offeringId: response.data.id
                });
            }

            toast.success(`${getTerm(level, 'SEMESTER')} Added`);
            fetchData();
        } catch (e: any) {
            toast.error("Failed to add " + getTerm('', 'SEMESTER'));
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
                capacity: defaultCapacity,
                offeringId: newSectionOfferingId || undefined
            });

            toast.success("Section Added");
            setIsSectionModalOpen(false);
            setNewSectionName('');
            setNewSectionOfferingId('');
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
        type: 'CLASS' as 'CLASS' | 'SECTION' | 'OFFERING',
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
            } else if (deleteModal.type === 'OFFERING') {
                // Delete offering and its sections
                await api.delete(`/ims-academic-service/offerings/${deleteModal.offeringId}`);
                toast.success("Section Group Deleted");
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
        return classes
            .filter(c => c.programId === progId || (!c.programId && programs.length > 0 && programs[0].id === progId))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    };

    const getOfferingsForClass = (classId: string) => {
        // Fallback: If offerings don't have classId directly (legacy school data), we use sections as bridge
        const directOfferings = offerings.filter(o => o.classId === classId);
        if (directOfferings.length > 0) return directOfferings;
        
        // Legacy bridge
        const secOfferingIds = sections.filter(s => s.classId === classId && s.offeringId).map(s => s.offeringId!);
        return offerings.filter(o => secOfferingIds.includes(o.id));
    };

    const getSectionsForClassAndOffering = (classId: string, offeringId: string) => {
        return sections.filter(s => s.classId === classId && s.offeringId === offeringId);
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
        <div className="space-y-6">
            <PageHeader
                title="Academic Structure"
                description={`Manage your ${getTerm(programs[0]?.level || '').toLowerCase()}es and sections.`}
                actions={isAdmin && programs.length > 0 && (
                    <button
                        onClick={() => { 
                            const level = programs[0]?.level || '';
                            setSelectedProgramId(programs[0].id); 
                            setSemesterCount(['UNDERGRAD', 'POSTGRAD'].includes(level) ? 8 : 1);
                            setIsAddClassOpen(true); 
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> {getTerm(programs[0]?.level || '', 'ADD_BRANCH')}
                    </button>
                )}
            />

            <div className="space-y-8">
                {programs.filter(p => isAdmin || getClassesForProgram(p.id).length > 0).map((program) => {
                    const programClasses = getClassesForProgram(program.id);
                    const isSchool = program.level === 'SCHOOL';

                    return (
                        <div key={program.id} className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden animate-fadeIn">
                            {/* ... header ... */}
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
                                            setSemesterCount(['UNDERGRAD', 'POSTGRAD'].includes(program.level) ? 8 : 1);
                                            setIsAddClassOpen(true);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" /> {getTerm(program.level, 'ADD_BRANCH')}
                                    </button>
                                )}
                            </div>

                            <div className="p-4">
                                {programClasses.length === 0 ? (
                                    <div className="text-center py-8 text-content-secondary">
                                        <Layers className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p>No {getTerm(program.level).toLowerCase()}es found. Add one to get started.</p>
                                    </div>
                                ) : (
                                    <div className={`grid gap-6 ${
                                        program.level === 'UNDERGRAD' || program.level === 'POSTGRAD' || program.level === 'COACHING' || program.level === 'SCHOOL'
                                        ? 'grid-cols-1' 
                                        : 'grid-cols-1 md:grid-cols-2'
                                    }`}>
                                        {programClasses.map(cls => {
                                            const classOfferingsCount = getOfferingsForClass(cls.id).length;

                                            return (
                                                <div key={cls.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow relative group">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="font-bold text-content-primary text-lg">{cls.name}</h4>
                                                            <p className="text-xs text-content-muted capitalize">{program.level.toLowerCase()}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {isAdmin && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleAddSemester(cls.id, program.id, classOfferingsCount)}
                                                                        className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all border border-indigo-100 dark:border-indigo-500/20 hover:border-indigo-200 dark:hover:border-indigo-500/30"
                                                                        title={`Add ${getTerm(program.level, 'SEMESTER')}`}
                                                                    >
                                                                        <Plus className="w-3.5 h-3.5" /> {getTerm(program.level, 'SEMESTER')}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditedClass({
                                                                            id: cls.id,
                                                                            offeringId: '', // Class no longer has offering
                                                                            name: cls.name,
                                                                            capacity: 0,
                                                                            type: 'SCHOOL_CLASS'
                                                                        })}
                                                                        className="text-gray-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                                        title={`Edit ${getTerm(program.level)}`}
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteClass(cls.id, '')}
                                                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                                        title={`Delete ${getTerm(program.level)}`}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                            <p className="text-xs font-semibold text-content-secondary uppercase">
                                                                {isSchool ? `${getTerm(program.level, 'SECTION')}s` : `${getTerm(program.level, 'SEMESTER')}s & ${getTerm(program.level, 'SECTION')}s`}
                                                            </p>

                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                                {(() => {
                                                                    const classOfferings = getOfferingsForClass(cls.id);
                                                                    const isExpanded = expandedBranches[cls.id];
                                                                    const displayedOfferings = isExpanded ? classOfferings : classOfferings.slice(0, 3);

                                                                    return displayedOfferings.map((offering) => {
                                                                        const groupSections = getSectionsForClassAndOffering(cls.id, offering.id);
                                                                        return (
                                                                            <div key={offering.id} className="flex flex-col bg-chrome/50 rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                                                                                <div className="px-4 py-2 bg-chrome/50 border-b border-border flex flex-wrap justify-between items-center gap-2">
                                                                                    <span className="text-[11px] font-bold text-content-secondary uppercase tracking-wider truncate max-w-[120px]">
                                                                                        {offering.name}
                                                                                    </span>
                                                                                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                                                                                        <button
                                                                                            onClick={() => openSubjectMapping(`${cls.name} (${offering.name})`, offering.id)}
                                                                                            className="p-1.5 px-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-md transition-all text-[10px] font-bold flex gap-1 items-center bg-surface/50 border border-indigo-50 dark:border-indigo-500/20 shadow-sm shrink-0"
                                                                                            title="Manage Subjects"
                                                                                        >
                                                                                            <BookOpen className="w-3 h-3" /> Subjects
                                                                                        </button>
                                                                                        {isAdmin && !isSchool && (
                                                                                            <>
                                                                                                <button
                                                                                                    onClick={() => openInstructorAssignment(`${cls.name} (${offering.name})`, offering.id)}
                                                                                                    className="p-1.5 px-2 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 rounded-md transition-all text-[10px] font-bold flex gap-1 items-center bg-surface/50 border border-amber-50 dark:border-amber-500/20 shadow-sm shrink-0"
                                                                                                    title="Assign Faculty"
                                                                                                >
                                                                                                    <UserCheck className="w-3 h-3" /> Faculty
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        setSelectedClassId(cls.id);
                                                                                                        setSelectedClassName(cls.name);
                                                                                                        setSelectedProgramId(program.id);
                                                                                                        setNewSectionOfferingId(offering.id);
                                                                                                        setIsSectionModalOpen(true);
                                                                                                    }}
                                                                                                    className="p-1.5 px-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-md transition-all text-[10px] flex items-center gap-1 font-bold bg-surface/50 border border-indigo-50 dark:border-indigo-500/20 shadow-sm shrink-0"
                                                                                                    title="Add Section"
                                                                                                >
                                                                                                    <Plus className="w-3 h-3" /> Section
                                                                                                </button>
                                                                                            </>
                                                                                        )}
                                                                                        {isAdmin && isSchool && (
                                                                                            <button
                                                                                                onClick={() => openInstructorAssignment(`${cls.name} (${offering.name})`, offering.id)}
                                                                                                className="p-1.5 px-2 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 rounded-md transition-all text-[10px] font-bold flex gap-1 items-center bg-surface/50 border border-amber-50 dark:border-amber-500/20 shadow-sm shrink-0"
                                                                                                title="Assign Faculty"
                                                                                            >
                                                                                                <UserCheck className="w-3 h-3" /> Assign Faculty
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                {(groupSections.length > 0) && (
                                                                                    <div className="p-3 space-y-2">
                                                                                        {isSchool && groupSections.length === 1 ? (
                                                                                            <div className="flex items-center justify-between p-2.5 bg-surface rounded-xl border border-border/60 transition-all hover:border-indigo-200 hover:shadow-sm">
                                                                                                <div className="flex items-center gap-3">
                                                                                                    <div className="w-8 h-8 flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-sm font-bold text-indigo-700 dark:text-indigo-400">
                                                                                                        {groupSections[0].name}
                                                                                                    </div>
                                                                                                    <div>
                                                                                                        <p className="text-[10px] text-content-muted">Class Capacity: {offering.capacity || 40}</p>
                                                                                                    </div>
                                                                                                </div>
                                                                                                {isAdmin && (
                                                                                                    <div className="flex items-center gap-1">
                                                                                                        <button
                                                                                                            onClick={() => {
                                                                                                                setEditedSection({
                                                                                                                    id: groupSections[0].id,
                                                                                                                    name: groupSections[0].name,
                                                                                                                    capacity: offering.capacity || 40,
                                                                                                                    offeringId: offering.id
                                                                                                                });
                                                                                                                setSelectedClassName(cls.name);
                                                                                                            }}
                                                                                                            className="p-1 text-content-muted hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                                                                            title="Edit Capacity"
                                                                                                        >
                                                                                                            <Edit2 className="w-3.5 h-3.5" />
                                                                                                        </button>
                                                                                                        <button
                                                                                                            onClick={() => setDeleteModal({ isOpen: true, type: 'OFFERING', id: '', offeringId: offering.id })}
                                                                                                            className="p-1 text-content-muted hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                                                                            title="Delete Section"
                                                                                                        >
                                                                                                            <X className="w-3.5 h-3.5" />
                                                                                                        </button>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        ) : (
                                                                                            groupSections.map(sec => (
                                                                                                <div key={sec.id} className="flex items-center justify-between p-2.5 bg-surface rounded-xl border border-border/60 group/sec transition-all hover:border-indigo-200 hover:shadow-sm">
                                                                                                    <div className="flex items-center gap-3">
                                                                                                        <span className="w-8 h-8 flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-sm font-bold text-indigo-700 dark:text-indigo-400">
                                                                                                            {sec.name}
                                                                                                        </span>
                                                                                                        <div>
                                                                                                            <p className="text-[10px] text-content-muted">Section Cap: {offering.capacity || 40}</p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    {isAdmin && (
                                                                                                        <div className="flex items-center gap-1">
                                                                                                            <button
                                                                                                                onClick={() => {
                                                                                                                    setEditedSection({
                                                                                                                        id: sec.id,
                                                                                                                        name: sec.name,
                                                                                                                        capacity: offering.capacity || 40,
                                                                                                                        offeringId: sec.offeringId || ''
                                                                                                                    });
                                                                                                                    setSelectedClassName(cls.name);
                                                                                                                }}
                                                                                                                className="p-1 text-content-muted hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                                                                                title="Edit Section"
                                                                                                            >
                                                                                                                <Edit2 className="w-3.5 h-3.5" />
                                                                                                            </button>
                                                                                                            <button
                                                                                                                onClick={() => handleDeleteSection(sec.id)}
                                                                                                                className="p-1 text-content-muted hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                                                                                title="Delete Section"
                                                                                                            >
                                                                                                                <X className="w-3.5 h-3.5" />
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            ))
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    });
                                                                })()}
                                                            </div>
                                                            {(() => {
                                                                const groupsCount = getOfferingsForClass(cls.id).length;
                                                                if (groupsCount > 3) {
                                                                    return (
                                                                        <button 
                                                                            onClick={() => setExpandedBranches(prev => ({...prev, [cls.id]: !prev[cls.id]}))}
                                                                            className="w-full py-2 bg-surface border border-dashed border-border rounded-xl text-content-muted hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/10 transition-all text-xs font-bold uppercase tracking-widest"
                                                                        >
                                                                            {expandedBranches[cls.id] ? 'Show Less' : `View All ${groupsCount} ${getTerm(program.level, 'SEMESTER')}s`}
                                                                        </button>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
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
            <Modal
                isOpen={isAddClassOpen}
                onClose={() => setIsAddClassOpen(false)}
                title={getTerm(programs.find(p => p.id === selectedProgramId)?.level || '', 'ADD_BRANCH')}
                footer={
                    <>
                        <button onClick={() => setIsAddClassOpen(false)} className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-lg" disabled={isSubmitting}>Cancel</button>
                        <button onClick={handleAddClass} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-content-primary">
                            {getTerm(programs.find(p => p.id === selectedProgramId)?.level || '', 'BRANCH')} Name
                        </label>
                        <input
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            placeholder={`e.g. ${getTerm(programs.find(p => p.id === selectedProgramId)?.level || '', 'BRANCH')} 5`}
                            className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    {/* Semester Count field for non-school programs */}
                    {!['SCHOOL'].includes(programs.find(p => p.id === selectedProgramId)?.level || '') && (
                        <div>
                            <label className="block text-sm font-medium text-content-primary">
                                {getTerm(programs.find(p => p.id === selectedProgramId)?.level || '', 'TOTAL_BRANCHES')}
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={semesterCount}
                                onChange={(e) => setSemesterCount(Number(e.target.value))}
                                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-content-primary">Total Capacity</label>
                        <input
                            type="number"
                            value={defaultCapacity}
                            onChange={(e) => setDefaultCapacity(Number(e.target.value))}
                            className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </Modal>

            {/* Edit Class Modal */}
            <Modal
                isOpen={!!editedClass}
                onClose={() => setEditedClass(null)}
                title="Edit Class"
                footer={
                    <>
                        <button onClick={() => setEditedClass(null)} className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-lg" disabled={isSubmitting}>Cancel</button>
                        <button onClick={handleUpdateClass} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Update
                        </button>
                    </>
                }
            >
                {editedClass && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Class Name</label>
                            <input
                                value={editedClass.name}
                                onChange={(e) => setEditedClass({ ...editedClass, name: e.target.value })}
                                placeholder="e.g. Class 5"
                                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add Section Modal */}
            <Modal
                isOpen={isSectionModalOpen}
                onClose={() => setIsSectionModalOpen(false)}
                title={`Add Section to ${selectedClassName}`}
                footer={
                    <>
                        <button onClick={() => setIsSectionModalOpen(false)} className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-lg" disabled={isSubmitting}>Cancel</button>
                        <button onClick={handleAddSection} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Add
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-content-primary">Section Name</label>
                        <input
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            placeholder="e.g. A, B, Rose"
                            className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Semester selection for College/Coaching */}
                    {!['SCHOOL'].includes(programs.find(p => p.id === selectedProgramId)?.level || '') && (
                        <div>
                            <label className="block text-sm font-medium text-content-primary">
                                Select {getTerm(programs.find(p => p.id === selectedProgramId)?.level || '', 'SEMESTER')}
                            </label>
                            <select
                                value={newSectionOfferingId}
                                onChange={(e) => setNewSectionOfferingId(e.target.value)}
                                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-surface"
                            >
                                <option value="">-- Auto-Assign or Select --</option>
                                {offerings
                                    .filter(o => o.programId === selectedProgramId)
                                    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
                                    .map(offt => (
                                        <option key={offt.id} value={offt.id}>
                                            {offt.name}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    )}
                </div>
            </Modal>

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
            <Modal
                isOpen={!!editedSection}
                onClose={() => setEditedSection(null)}
                title={`Edit Section in ${selectedClassName}`}
                footer={
                    <>
                        <button onClick={() => setEditedSection(null)} className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-lg" disabled={isSubmitting}>Cancel</button>
                        <button onClick={handleUpdateSection} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Update
                        </button>
                    </>
                }
            >
                {editedSection && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Section Name</label>
                            <input
                                value={editedSection.name}
                                onChange={(e) => setEditedSection({ ...editedSection, name: e.target.value })}
                                placeholder="e.g. A, B"
                                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Capacity</label>
                            <input
                                type="number"
                                value={editedSection.capacity}
                                onChange={(e) => setEditedSection({ ...editedSection, capacity: Number(e.target.value) })}
                                className="w-full mt-1 p-2 border rounded-lg"
                            />
                        </div>
                    </div>
                )}
            </Modal>

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
