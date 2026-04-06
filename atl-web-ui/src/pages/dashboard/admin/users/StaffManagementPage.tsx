import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../../../../store/store';
import api from '../../../../utils/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import PageHeader from '../../../../components/common/PageHeader';
import {
    Briefcase,
    Search,
    Edit,
    Trash2,
    UserPlus,
    Loader2
} from 'lucide-react';

interface StaffMember {
    id: string;
    userId?: string;
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
    role: string;
    department: string;
    tenantId?: string;
    profileImageUrl?: string;
    monthlySalary?: number;
    qualification?: string;
    experience?: string;
}

const StaffManagementPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;
    const navigate = useNavigate();

    // List State
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Grant Access Modal State
    const [isGrantAccessModalOpen, setIsGrantAccessModalOpen] = useState(false);
    const [staffToGrantAccess, setStaffToGrantAccess] = useState<StaffMember | null>(null);
    const [isGrantingAccess, setIsGrantingAccess] = useState(false);

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (tenantId) {
            fetchStaff();
        }
    }, [tenantId]);

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/ims-staff-service/staff/tenant/${tenantId}`);
            if (response.data.status === 'SUCCESS') {
                setStaff(response.data.apiData);
            }
        } catch (error: any) {
            toast.error('Failed to fetch staff members');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGrantAccessClick = (staffMember: StaffMember) => {
        setStaffToGrantAccess(staffMember);
        setIsGrantAccessModalOpen(true);
    };

    const handleConfirmGrantAccess = async () => {
        if (!staffToGrantAccess) return;

        setIsGrantingAccess(true);
        try {
            await api.post(`/ims-staff-service/staffs/${staffToGrantAccess.id}/grant-access`);
            toast.success("Access Granted! User can now login with their email.");
            setIsGrantAccessModalOpen(false);
            setStaffToGrantAccess(null);
            fetchStaff();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to grant access");
        } finally {
            setIsGrantingAccess(false);
        }
    };

    const handleEditClick = (_staffMember: StaffMember) => {
        toast.error("Edit page not implemented yet. Redirecting to All Staff.");
    };

    const handleDeleteClick = (id: string) => {
        setStaffToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!staffToDelete) return;

        setIsDeleting(true);
        try {
            const response = await api.delete(`/ims-staff-service/staff/${staffToDelete}`);
            if (response.data.status === 'SUCCESS') {
                toast.success('Staff deleted successfully');
                setStaff(staff.filter(s => s.id !== staffToDelete));
                setIsDeleteModalOpen(false);
                setStaffToDelete(null);
            }
        } catch (error: any) {
            toast.error('Failed to delete staff');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredStaff = staff.filter(staffMember =>
        staffMember.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Staff Management"
                description="Manage support staff, roles, and administrative access."
                icon={Briefcase}
                actions={
                    <button
                        className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm whitespace-nowrap gap-2"
                        onClick={() => navigate('/people/staff/add')}
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Staff Member
                    </button>
                }
            />

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all sm:text-sm"
                        placeholder="Search by name, employee ID or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name / Employee ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role / Department
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Login Access
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
                                        <p className="mt-2 text-sm text-gray-500">Loading staff...</p>
                                    </td>
                                </tr>
                            ) : filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                                            <Briefcase className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <p className="mt-2 text-sm font-medium text-gray-900">No staff found</p>
                                        <p className="mt-1 text-sm text-gray-500">Get started by adding a new staff member.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredStaff.map((staffMember) => (
                                    <tr key={staffMember.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                                                        {staffMember.firstName?.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {staffMember.firstName} {staffMember.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        #{staffMember.employeeId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{staffMember.email}</div>
                                            <div className="text-sm text-gray-500">{staffMember.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{staffMember.role}</div>
                                            <div className="text-sm text-gray-500">{staffMember.department}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {staffMember.userId ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleGrantAccessClick(staffMember)}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                                                >
                                                    Grant Access
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${staffMember.status === 'ACTIVE' || staffMember.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {staffMember.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(staffMember)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(staffMember.id)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Staff"
                message="Are you sure you want to delete this staff member? This action cannot be undone."
                confirmText="Delete"
                isLoading={isDeleting}
                variant="danger"
            />

            {/* Grant Access Modal */}
            <ConfirmationModal
                isOpen={isGrantAccessModalOpen}
                onClose={() => setIsGrantAccessModalOpen(false)}
                onConfirm={handleConfirmGrantAccess}
                title="Grant Login Access"
                message={`Are you sure you want to grant login access to ${staffToGrantAccess?.firstName} ${staffToGrantAccess?.lastName}? They will be able to login using their email.`}
                confirmText="Grant Access"
                isLoading={isGrantingAccess}
                variant="success"
            />
        </div>
    );
};

export default StaffManagementPage;
