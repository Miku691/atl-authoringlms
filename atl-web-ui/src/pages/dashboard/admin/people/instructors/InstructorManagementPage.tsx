import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../../store/store';
import api from '../../../../../utils/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../../../components/common/ConfirmationModal';
import {
    Search,
    Edit,
    Trash2,
    UserCheck,
    UserPlus,
    Key
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
    }, [tenantId]);

    const fetchInstructors = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/ims-instructor-service/instructors/tenant/${tenantId}`);
            if (response.data.status === 'SUCCESS') {
                setInstructors(response.data.apiData);
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

    const handleEditClick = (instructor: Instructor) => {
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
        <div className="flex flex-col gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Faculty Roster</h1>
                        <p className="text-sm text-gray-500">Manage {instructors.length} academic staff members</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1 sm:min-w-[320px] group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                            placeholder="Find instructor by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 whitespace-nowrap"
                        onClick={() => navigate('/people/instructors/add')}
                    >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Add Instructor
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expertise</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
                            ) : filteredInstructors.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-24 text-center">No Instructors Found</td></tr>
                            ) : (
                                filteredInstructors.map((inst) => (
                                    <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">{inst.firstName[0]}</div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{inst.firstName} {inst.lastName}</div>
                                                    <div className="text-xs text-gray-500">#{inst.employeeId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{inst.specialization}</div>
                                            <div className="text-xs text-gray-500">{inst.qualification}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{inst.email}</div>
                                            <div className="text-xs text-gray-500">{inst.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${inst.status?.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{inst.status}</span>
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
            </div>

            {/* Modal components for Add/Edit have been removed */}

            <ConfirmationModal isOpen={isGrantAccessModalOpen} onClose={() => setIsGrantAccessModalOpen(false)} onConfirm={handleConfirmGrantAccess} title="Provision Login Access" message={`Grant login access to ${instructorToGrantAccess?.firstName}?`} confirmText="Provision Access" isLoading={isGrantingAccess} variant="success" />
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Deactivate Faculty" message="Are you sure you want to remove this instructor?" confirmText="Delete Instructor" isLoading={isDeleting} variant="danger" />
        </div>
    );
};

export default InstructorManagementPage;
