import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../../store/store';
import api from '../../../../../utils/api';
import toast from 'react-hot-toast';
import PageHeader from '../../../../../components/common/PageHeader';
import { BookOpen, Layers, GraduationCap, Loader2, Plus, Trash2, Edit2, X, UserCheck, Calendar } from 'lucide-react';
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
    yearId?: string;
    name: string;
    type: string;
    capacity: number;
}

interface ImsBranch {
    id: string;
    tenantId: string;
    name: string;
    code: string;
    programId?: string;
}

interface ImsYear {
    id: string;
    tenantId: string;
    branchId: string;
    name: string;
    yearNumber: number;
}

// --- Component ---

const CollegeStructureView: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;

    // Data State
    const [programs, setPrograms] = useState<Program[]>([]);
    const [branches, setBranches] = useState<ImsBranch[]>([]);
    const [years, setYears] = useState<ImsYear[]>([]);
    const [offerings, setOfferings] = useState<Offering[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const isAdmin = user?.roles?.some(r => ['TENANT_ADMIN', 'ADMIN'].includes(r));
    const [instructorId, setInstructorId] = useState<string | null>(null);

    // Modals
    const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
    const [isAddYearOpen, setIsAddYearOpen] = useState(false);
    const [isAddSemesterOpen, setIsAddSemesterOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedProgramId, setSelectedProgramId] = useState<string>('');
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [selectedYearId, setSelectedYearId] = useState<string>('');
    const [selectedEntityName, setSelectedEntityName] = useState<string>('');

    // Form states
    const [newBranchName, setNewBranchName] = useState('');
    const [newYearNumber, setNewYearNumber] = useState(1);
    const [newSemesterName, setNewSemesterName] = useState('');
    const [defaultCapacity, setDefaultCapacity] = useState(60);

    const [editedBranch, setEditedBranch] = useState<{ id: string; name: string } | null>(null);
    const [editedYear, setEditedYear] = useState<{ id: string; name: string } | null>(null);
    const [editedSemester, setEditedSemester] = useState<{ id: string; name: string; capacity: number } | null>(null);

    // Mappings
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [selectedOfferingIdForMapping, setSelectedOfferingIdForMapping] = useState('');
    const [selectedCourseNameForMapping, setSelectedCourseNameForMapping] = useState('');

    const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
    const [selectedOfferingIdForInstructor, setSelectedOfferingIdForInstructor] = useState('');
    const [selectedCourseNameForInstructor, setSelectedCourseNameForInstructor] = useState('');

    // UI Expansion State
    const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});
    const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});

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

            const [progRes, offRes, branchRes, yearRes] = await Promise.all([
                api.get(`/ims-academic-service/programs/tenant/${tenantId}`),
                isAdmin
                    ? api.get(`/ims-academic-service/offerings/tenant/${tenantId}`)
                    : (instId ? api.get(`/ims-academic-service/offerings/instructor/${instId}`) : Promise.resolve({ data: { apiData: [] } })),
                api.get(`/ims-academic-service/branches/tenant/${tenantId}`),
                api.get(`/ims-academic-service/years/tenant/${tenantId}`)
            ]);

            if (progRes.data.status === 'SUCCESS') setPrograms(progRes.data.apiData);
            if (offRes.data.status === 'SUCCESS') setOfferings(offRes.data.apiData);
            if (branchRes.data.status === 'SUCCESS') setBranches(branchRes.data.apiData);
            if (yearRes.data.status === 'SUCCESS') setYears(yearRes.data.apiData);

        } catch (error) {
            console.error('Error fetching academic data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Handlers ---

    const handleAddBranch = async () => {
        if (!newBranchName || !selectedProgramId) return;
        setIsSubmitting(true);
        try {
            await api.post('/ims-academic-service/branches', {
                tenantId,
                name: newBranchName,
                code: newBranchName.toUpperCase().replace(/\s+/g, '-'),
                programId: selectedProgramId
            });

            toast.success("Branch added successfully");
            setIsAddBranchOpen(false);
            setNewBranchName('');
            fetchData();
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to add branch");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddYear = async () => {
        if (!newYearNumber || !selectedBranchId) return;
        setIsSubmitting(true);
        try {
            const suffix = (newYearNumber === 1) ? "st" : (newYearNumber === 2) ? "nd" : (newYearNumber === 3) ? "rd" : "th";
            await api.post('/ims-academic-service/years', {
                tenantId,
                branchId: selectedBranchId,
                name: `${newYearNumber}${suffix} Year`,
                yearNumber: newYearNumber
            });

            toast.success("Year added successfully");
            setIsAddYearOpen(false);
            setNewYearNumber(1);
            fetchData();
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to add year");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddSemester = async () => {
        if (!newSemesterName || !selectedYearId || !selectedProgramId) return;
        setIsSubmitting(true);
        try {
            await api.post('/ims-academic-service/offerings', {
                tenantId,
                programId: selectedProgramId,
                yearId: selectedYearId,
                name: newSemesterName,
                type: 'COLLEGE_PROGRAM',
                capacity: defaultCapacity
            });

            toast.success("Semester added successfully");
            setIsAddSemesterOpen(false);
            setNewSemesterName('');
            fetchData();
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to add semester");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Delete Modal State ---
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        type: 'BRANCH' as 'BRANCH' | 'YEAR' | 'SEMESTER',
        id: ''
    });

    const confirmDelete = async () => {
        setIsSubmitting(true);
        try {
            if (deleteModal.type === 'BRANCH') {
                // Delete API calls are not implemented in these simplified controllers, assuming you'll add them or they exist.
                // If they don't, this will just gracefully fail until you build them out.
                await api.delete(`/ims-academic-service/branches/${deleteModal.id}`);
                toast.success("Branch deleted");
            } else if (deleteModal.type === 'YEAR') {
                await api.delete(`/ims-academic-service/years/${deleteModal.id}`);
                toast.success("Year deleted");
            } else {
                await api.delete(`/ims-academic-service/offerings/${deleteModal.id}`);
                toast.success("Semester deleted");
            }
            fetchData();
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Feature not yet implemented for this entity type");
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

    // --- Helpers ---
    const getBranchesForProgram = (progId: string) => branches.filter(b => b.programId === progId);
    const getYearsForBranch = (branchId: string) => years.filter(y => y.branchId === branchId).sort((a, b) => a.yearNumber - b.yearNumber);
    const getSemestersForYear = (yearId: string) => offerings.filter(o => o.yearId === yearId);

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
                description={`Manage your college branches, years, and semesters.`}
                actions={isAdmin && programs.length > 0 && (
                    <button
                        onClick={() => { 
                            setSelectedProgramId(programs[0].id); 
                            setIsAddBranchOpen(true); 
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Branch
                    </button>
                )}
            />

            <div className="space-y-8">
                {programs.filter(p => isAdmin || getBranchesForProgram(p.id).length > 0).map((program) => {
                    const programBranches = getBranchesForProgram(program.id);

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
                                            setIsAddBranchOpen(true);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" /> Add Branch
                                    </button>
                                )}
                            </div>

                            <div className="p-6 space-y-8">
                                {programBranches.length === 0 ? (
                                    <div className="text-center py-8 text-content-secondary">
                                        <Layers className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p>No branches found. Add one to get started.</p>
                                    </div>
                                ) : (
                                    programBranches.map(branch => {
                                        const branchYears = getYearsForBranch(branch.id);
                                        
                                        return (
                                            <div key={branch.id} className="border-l-4 border-indigo-500 pl-4 py-2 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold text-content-primary text-xl flex items-center gap-2">
                                                            {branch.name}
                                                        </h4>
                                                        <p className="text-xs text-content-secondary uppercase tracking-widest mt-1">Branch</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {isAdmin && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedBranchId(branch.id);
                                                                        setSelectedEntityName(branch.name);
                                                                        setNewYearNumber(branchYears.length + 1);
                                                                        setIsAddYearOpen(true);
                                                                    }}
                                                                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all border border-indigo-100"
                                                                >
                                                                    <Plus className="w-3.5 h-3.5" /> Year
                                                                </button>
                                                                {/* Edit/Delete Branch hidden for brevity but can be added similarly */}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                                    {branchYears.map(year => {
                                                        const yearSemesters = getSemestersForYear(year.id);
                                                        
                                                        return (
                                                            <div key={year.id} className="border border-border rounded-xl p-4 bg-surface hover:shadow-md transition-all group">
                                                                <div className="flex justify-between items-center mb-4 border-b border-border/50 pb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="w-4 h-4 text-content-secondary" />
                                                                        <h5 className="font-semibold text-content-primary">{year.name}</h5>
                                                                    </div>
                                                                    {isAdmin && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedProgramId(program.id);
                                                                                setSelectedYearId(year.id);
                                                                                setSelectedEntityName(`${branch.name} - ${year.name}`);
                                                                                setNewSemesterName(`Semester ${yearSemesters.length + 1}`);
                                                                                setIsAddSemesterOpen(true);
                                                                            }}
                                                                            className="p-1 px-2 text-[10px] flex items-center gap-1 font-bold bg-indigo-50 text-indigo-600 rounded"
                                                                        >
                                                                            <Plus className="w-3 h-3" /> Semester
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-3">
                                                                    {yearSemesters.length === 0 ? (
                                                                        <p className="text-xs text-content-secondary italic">No semesters added.</p>
                                                                    ) : (
                                                                        yearSemesters.map(semester => (
                                                                            <div key={semester.id} className="flex flex-col bg-chrome/50 rounded-lg border border-border p-3 transition-colors hover:border-indigo-200">
                                                                                <div className="flex justify-between items-center mb-2">
                                                                                    <span className="text-sm font-bold text-content-primary">{semester.name}</span>
                                                                                    {isAdmin && (
                                                                                        <button
                                                                                            onClick={() => setDeleteModal({ isOpen: true, type: 'SEMESTER', id: semester.id })}
                                                                                            className="p-1 text-content-muted hover:text-red-500 rounded"
                                                                                        >
                                                                                            <X className="w-3.5 h-3.5" />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                                <p className="text-[10px] text-content-muted mb-3">Capacity: {semester.capacity || 60}</p>
                                                                                <div className="flex gap-1.5 flex-wrap mt-auto">
                                                                                    <button
                                                                                        onClick={() => openSubjectMapping(`${branch.name} - ${semester.name}`, semester.id)}
                                                                                        className="flex-1 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded text-[10px] font-bold flex items-center justify-center gap-1"
                                                                                    >
                                                                                        <BookOpen className="w-3 h-3" /> Subjects
                                                                                    </button>
                                                                                    {isAdmin && (
                                                                                        <button
                                                                                            onClick={() => openInstructorAssignment(`${branch.name} - ${semester.name}`, semester.id)}
                                                                                            className="flex-1 py-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded text-[10px] font-bold flex items-center justify-center gap-1"
                                                                                        >
                                                                                            <UserCheck className="w-3 h-3" /> Faculty
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            <Modal isOpen={isAddBranchOpen} onClose={() => setIsAddBranchOpen(false)} title="Add Branch" footer={
                <>
                    <button onClick={() => setIsAddBranchOpen(false)} className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-lg">Cancel</button>
                    <button onClick={handleAddBranch} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Create
                    </button>
                </>
            }>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-content-primary">Branch Name</label>
                        <input value={newBranchName} onChange={(e) => setNewBranchName(e.target.value)} placeholder="e.g. Computer Science" className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isAddYearOpen} onClose={() => setIsAddYearOpen(false)} title={`Add Year to ${selectedEntityName}`} footer={
                <>
                    <button onClick={() => setIsAddYearOpen(false)} className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-lg">Cancel</button>
                    <button onClick={handleAddYear} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Add
                    </button>
                </>
            }>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-content-primary">Year Number</label>
                        <input type="number" min="1" max="10" value={newYearNumber} onChange={(e) => setNewYearNumber(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isAddSemesterOpen} onClose={() => setIsAddSemesterOpen(false)} title={`Add Semester to ${selectedEntityName}`} footer={
                <>
                    <button onClick={() => setIsAddSemesterOpen(false)} className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-lg">Cancel</button>
                    <button onClick={handleAddSemester} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Add
                    </button>
                </>
            }>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-content-primary">Semester Name</label>
                        <input value={newSemesterName} onChange={(e) => setNewSemesterName(e.target.value)} placeholder="e.g. Semester 1" className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-content-primary">Capacity</label>
                        <input type="number" value={defaultCapacity} onChange={(e) => setDefaultCapacity(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
            </Modal>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
                title={`Delete ${deleteModal.type}`}
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

export default CollegeStructureView;
