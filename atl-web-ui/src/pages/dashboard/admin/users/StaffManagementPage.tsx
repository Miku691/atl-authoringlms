import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import api from '../../../../utils/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import CustomDatePicker from '../../../../components/common/CustomDatePicker';
import CustomSelect from '../../../../components/common/CustomSelect';
import {
    Briefcase,
    Plus,
    Search,
    Edit,
    Trash2,
    Loader2,
    X,
    Save
} from 'lucide-react';

interface Staff {
    id: string;
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

interface ValidationErrors {
    [key: string]: string;
}

interface StaffFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    employeeId: string;
    joinDate: Date;
    gender: string;
    status: string;
    dob: Date | null;
    address: string;
    role: string;
    department: string;
    monthlySalary: string | number;
    qualification: string;
    experience: string;
}

const StaffManagementPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    // State for Edit
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const initialFormState = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        employeeId: '',
        joinDate: new Date(),
        gender: 'Male',
        status: 'Active',
        dob: null as Date | null,
        address: '',
        role: '',
        department: '',
        monthlySalary: '',
        qualification: '',
        experience: ''
    };

    const [formData, setFormData] = useState<StaffFormData>(initialFormState);

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
                setStaffList(response.data.apiData);
            }
        } catch (error: any) {
            toast.error('Failed to fetch staff');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        const phoneRegex = /^\d{10}$/;
        if (!formData.phone?.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        if (!formData.employeeId?.trim()) newErrors.employeeId = 'Employee ID is required';
        if (!formData.joinDate) newErrors.joinDate = 'Join date is required';

        if (!formData.dob) {
            newErrors.dob = 'Date of birth is required';
        } else {
            const dobDate = new Date(formData.dob);
            const today = new Date();
            if (dobDate >= today) {
                newErrors.dob = 'Date of birth must be in the past';
            }
        }

        if (!formData.role?.trim()) newErrors.role = 'Role is required';
        if (!formData.department?.trim()) newErrors.department = 'Department is required';
        if (!formData.address?.trim()) newErrors.address = 'Address is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDateChange = (date: Date | null, name: string) => {
        setFormData(prev => ({ ...prev, [name]: date }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        if (!tenantId) {
            toast.error("Tenant ID is missing");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                tenantId: tenantId,
                status: formData.status?.toUpperCase() || 'ACTIVE',
                joinDate: formData.joinDate ? formData.joinDate.toISOString().split('T')[0] : null,
                dob: formData.dob ? formData.dob.toISOString().split('T')[0] : null,
                monthlySalary: formData.monthlySalary ? parseFloat(formData.monthlySalary as any) : null,
                qualification: formData.qualification,
                experience: formData.experience
            };

            let response;
            if (selectedStaffId) {
                response = await api.put(`/ims-staff-service/staff/${selectedStaffId}`, payload);
            } else {
                response = await api.post('/ims-staff-service/staff', payload);
            }

            if (response.data.status === 'SUCCESS') {
                toast.success(selectedStaffId ? 'Staff updated successfully' : 'Staff added successfully');
                setIsModalOpen(false);
                setFormData(initialFormState);
                setSelectedStaffId(null);
                fetchStaff();
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || (selectedStaffId ? 'Failed to update staff' : 'Failed to add staff');
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (staff: Staff) => {
        setSelectedStaffId(staff.id);
        setFormData({
            firstName: staff.firstName,
            lastName: staff.lastName,
            email: staff.email,
            phone: staff.phone,
            employeeId: staff.employeeId,
            joinDate: staff.joinDate ? new Date(staff.joinDate) : new Date(),
            status: staff.status,
            dob: staff.dob ? new Date(staff.dob) : null,
            gender: staff.gender,
            address: staff.address,
            role: staff.role,
            department: staff.department,
            monthlySalary: staff.monthlySalary ?? '',
            qualification: staff.qualification ?? '',
            experience: staff.experience ?? ''
        });
        setIsModalOpen(true);
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
                setStaffList(staffList.filter(s => s.id !== staffToDelete));
                setIsDeleteModalOpen(false);
                setStaffToDelete(null);
            }
        } catch (error: any) {
            toast.error('Failed to delete staff');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredStaff = staffList.filter(staff =>
        staff.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-4">
            {/* Compact Header & Actions */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Briefcase className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Staff</h1>
                        <p className="text-xs text-gray-500 hidden sm:block">Manage support staff</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:min-w-[300px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                            placeholder="Search by name, ID or role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors whitespace-nowrap"
                        onClick={() => {
                            setSelectedStaffId(null);
                            setFormData(initialFormState);
                            setIsModalOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Staff
                    </button>
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
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
                                        <p className="mt-2 text-sm text-gray-500">Loading staff...</p>
                                    </td>
                                </tr>
                            ) : filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                                            <Briefcase className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <p className="mt-2 text-sm font-medium text-gray-900">No staff found</p>
                                        <p className="mt-1 text-sm text-gray-500">Get started by adding a new staff member.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredStaff.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                                                        {staff.firstName?.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {staff.firstName} {staff.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        #{staff.employeeId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{staff.email}</div>
                                            <div className="text-sm text-gray-500">{staff.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{staff.role}</div>
                                            <div className="text-sm text-gray-500">{staff.department}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${staff.status === 'ACTIVE' || staff.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {staff.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(staff)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(staff.id)}
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

            {/* Add/Edit Staff Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsModalOpen(false)}></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-5 border-b pb-3">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            {selectedStaffId ? 'Edit Staff Member' : 'Add New Staff'}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Personal Details */}
                                        <div className="col-span-full">
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Details</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md p-2 ${errors.firstName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                            />
                                            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md p-2 ${errors.lastName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                            />
                                            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
                                        </div>
                                        <div>
                                            <CustomDatePicker
                                                label="Date of Birth"
                                                selectedDate={formData.dob || null}
                                                onChange={(date) => handleDateChange(date, 'dob')}
                                                error={errors.dob}
                                                required
                                                maxDate={new Date()}
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                            />
                                        </div>

                                        <div>
                                            <CustomSelect
                                                label="Gender"
                                                name="gender"
                                                value={formData.gender || 'Male'}
                                                onChange={handleInputChange}
                                                options={[
                                                    { value: 'Male', label: 'Male' },
                                                    { value: 'Female', label: 'Female' },
                                                    { value: 'Other', label: 'Other' }
                                                ]}
                                            />
                                        </div>

                                        {/* Professional Details */}
                                        <div className="col-span-full mt-4">
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Professional Details</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Employee ID <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="employeeId"
                                                value={formData.employeeId}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md p-2 ${errors.employeeId ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                            />
                                            {errors.employeeId && <p className="mt-1 text-xs text-red-600">{errors.employeeId}</p>}
                                        </div>
                                        <div>
                                            <CustomDatePicker
                                                label="Join Date"
                                                selectedDate={formData.joinDate || null}
                                                onChange={(date) => handleDateChange(date, 'joinDate')}
                                                error={errors.joinDate}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Role <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="role"
                                                value={formData.role}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md p-2 ${errors.role ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                                placeholder="e.g. Accountant, Librarian"
                                            />
                                            {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Department <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="department"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md p-2 ${errors.department ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                                placeholder="e.g. Admin, Library"
                                            />
                                            {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department}</p>}
                                        </div>
                                        <div>
                                            <CustomSelect
                                                label="Status"
                                                name="status"
                                                value={formData.status || 'Active'}
                                                onChange={handleInputChange}
                                                options={[
                                                    { value: 'Active', label: 'Active' },
                                                    { value: 'Inactive', label: 'Inactive' },
                                                    { value: 'On Leave', label: 'On Leave' }
                                                ]}
                                            />
                                        </div>

                                        {/* Professional Background */}
                                        <div className="col-span-full mt-4">
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Professional Background</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Qualification</label>
                                            <input
                                                type="text"
                                                name="qualification"
                                                value={formData.qualification}
                                                onChange={handleInputChange}
                                                placeholder="e.g. MBA, PhD"
                                                className="mt-1 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Experience</label>
                                            <input
                                                type="text"
                                                name="experience"
                                                value={formData.experience}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 5 Years"
                                                className="mt-1 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Monthly Salary</label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    name="monthlySalary"
                                                    value={formData.monthlySalary}
                                                    onChange={handleInputChange}
                                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        {/* Contact Details */}
                                        <div className="col-span-full mt-4">
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md p-2 ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                            />
                                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md p-2 ${errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                                placeholder="10 digit number"
                                            />
                                            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                                        </div>
                                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700">Address <span className="text-red-500">*</span></label>
                                            <textarea
                                                name="address"
                                                rows={2}
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md p-2 ${errors.address ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                            />
                                            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                {selectedStaffId ? 'Update Staff' : 'Save Staff'}
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

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
        </div>
    );
};

export default StaffManagementPage;
