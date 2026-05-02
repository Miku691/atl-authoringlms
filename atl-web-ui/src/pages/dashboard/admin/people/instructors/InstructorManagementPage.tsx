import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../../store/store';
import api from '../../../../../utils/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../../../components/common/ConfirmationModal';
import PageHeader from '../../../../../components/common/PageHeader';
import {
    Search,
    Edit,
    Trash2,
    UserCheck,
    UserPlus,
    Key,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Instructor {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    employeeId: string;
    joinDate: string;
    status: string;
    dob: string;
    gender: string;
    address: string;
    qualification: string;
    specialization: string;
    monthlySalary?: number;
    experience?: string;
    tenantId?: string;
    profileImageUrl?: string;
}

const InstructorManagementPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;
    const navigate = useNavigate();

    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(10);

    // Grant Access Modal State
    const [isGrantAccessModalOpen, setIsGrantAccessModalOpen] = useState(false);
    const [instructorToGrantAccess, setInstructorToGrantAccess] = useState<Instructor | null>(null);
    const [isGrantingAccess, setIsGrantingAccess] = useState(false);

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [instructorToDelete, setInstructorToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (tenantId) {
            fetchInstructors();
        }
    }, [tenantId, currentPage]);

    const fetchInstructors = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/ims-instructor-service/instructors/tenant/${tenantId}?page=${currentPage}&size=${pageSize}`);
            if (response.data.status === 'SUCCESS') {
                const data = response.data.apiData;
                setInstructors(data.content || []);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            }
        } catch (error: any) {
            toast.error('Failed to fetch instructors');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGrantAccessClick = (instructor: Instructor) => {
        setInstructorToGrantAccess(instructor);
        setIsGrantAccessModalOpen(true);
    };

    const handleConfirmGrantAccess = async () => {
        if (!instructorToGrantAccess || !tenantId) return;

        setIsGrantingAccess(true);
        try {
            await api.post(`/ims-instructor-service/instructors/${instructorToGrantAccess.id}/grant-access`);
            toast.success("Login Access Granted!");
            setIsGrantAccessModalOpen(false);
            setInstructorToGrantAccess(null);
            fetchInstructors();
        } catch (error: any) {
            toast.error("Failed to grant access");
        } finally {
            setIsGrantingAccess(false);
        }
    };

    const handleEditClick = (_instructor: Instructor) => {
        toast.error("Edit page not implemented yet. Redirecting to All Instructors.");
    };

    const handleDeleteClick = (id: string) => {
        setInstructorToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!instructorToDelete) return;
        setIsDeleting(true);
        try {
            const response = await api.delete(`/ims-instructor-service/instructors/${instructorToDelete}`);
            if (response.data.status === 'SUCCESS') {
                toast.success('Instructor deleted successfully');
                setInstructors(instructors.filter(inst => inst.id !== instructorToDelete));
                setIsDeleteModalOpen(false);
            }
        } catch (error: any) {
            toast.error('Failed to delete instructor');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredInstructors = instructors.filter(instructor =>
        instructor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Faculty Roster"
                description="Manage academic staff members, expertise, and login access."
                icon={UserCheck}
                actions={
                    <button
                        className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm whitespace-nowrap gap-2"
                        onClick={() => navigate('/people/instructors/add')}
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Instructor
                    </button>
                }
            />

            {/* Search & Filters */}
            <div className="bg-surface p-4 rounded-xl shadow-sm border border-border">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
                    <input
                        type="text"
                        className="block w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-chrome placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all sm:text-sm"
                        placeholder="Find instructor by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-chrome">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Name / ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Expertise</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-content-secondary">Loading...</td></tr>
                            ) : filteredInstructors.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-24 text-center">No Instructors Found</td></tr>
                            ) : (
                                filteredInstructors.map((inst) => (
                                    <tr key={inst.id} className="hover:bg-chrome transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">{inst.firstName[0]}</div>
                                                <div>
                                                    <div className="text-sm font-medium text-content-primary">{inst.firstName} {inst.lastName}</div>
                                                    <div className="text-xs text-content-secondary">#{inst.employeeId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-content-primary">{inst.specialization}</div>
                                            <div className="text-xs text-content-secondary">{inst.qualification}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-content-primary">{inst.email}</div>
                                            <div className="text-xs text-content-secondary">{inst.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${inst.status?.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-chrome text-content-primary'}`}>{inst.status}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                {!inst.userId && (
                                                    <button onClick={() => handleGrantAccessClick(inst)} className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition" title="Grant Access"><Key className="w-4 h-4" /></button>
                                                )}
                                                <button onClick={() => handleEditClick(inst)} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteClick(inst.id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-chrome border-t border-border flex items-center justify-between">
                        <div className="text-sm text-content-secondary font-medium tracking-tight">
                            Showing <span className="text-indigo-600 font-black">{instructors.length}</span> of <span className="text-indigo-600 font-black">{totalElements}</span> Faculty Members
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                                className="p-2 border border-border rounded-lg text-content-secondary hover:bg-surface disabled:opacity-30 transition-all cursor-pointer shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-lg shadow-sm">
                                <span className="text-sm font-black text-indigo-600">{currentPage + 1}</span>
                                <span className="text-[10px] font-black text-gray-200 uppercase tracking-tighter">/</span>
                                <span className="text-sm font-black text-content-muted">{totalPages}</span>
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={currentPage >= totalPages - 1}
                                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-30 transition-all font-bold shadow-md shadow-indigo-100 cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal components for Add/Edit have been removed */}

            <ConfirmationModal isOpen={isGrantAccessModalOpen} onClose={() => setIsGrantAccessModalOpen(false)} onConfirm={handleConfirmGrantAccess} title="Provision Login Access" message={`Grant login access to ${instructorToGrantAccess?.firstName}?`} confirmText="Provision Access" isLoading={isGrantingAccess} variant="success" />
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Deactivate Faculty" message="Are you sure you want to remove this instructor?" confirmText="Delete Instructor" isLoading={isDeleting} variant="danger" />
        </div>
    );
};

export default InstructorManagementPage;
