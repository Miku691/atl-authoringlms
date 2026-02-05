import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import api from '../../../../utils/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import CustomDatePicker from '../../../../components/common/CustomDatePicker';
import CustomSelect from '../../../../components/common/CustomSelect';
import {
    GraduationCap,
    Search,
    Edit,
    Trash2,
    Loader2,
    X,
    Save,
    FileText,
    Key
} from 'lucide-react'; import StudentDocumentsModal from './StudentDocumentsModal';
import AuthenticatedAvatar from '../../../../components/common/AuthenticatedAvatar';
import { useNavigate } from 'react-router-dom';

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    admissionNo: string;
    admissionDate: string;
    status: string;
    dob: string;
    gender: string;
    bloodGroup: string;
    address: string;
    category: string;
    religion: string;
    tenantId?: string;

    profileImageUrl?: string;
    currentOfferingId?: string;
}

interface Offering {
    id: string;
    name: string;
}

interface ValidationErrors {
    [key: string]: string;
}

interface StudentFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    admissionNo: string;
    admissionDate: Date;
    gender: string;
    status: string;
    dob: Date | null;
    address: string;
    bloodGroup: string;
    category: string;
    religion: string;
    currentOfferingId: string;
}

const StudentManagementPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    // Documents Modal State
    const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
    const [studentForDocs, setStudentForDocs] = useState<{ id: string, name: string } | null>(null);

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

    const navigate = useNavigate();

    const [isDeleting, setIsDeleting] = useState(false);

    // Grant Access Modal State
    const [isGrantAccessModalOpen, setIsGrantAccessModalOpen] = useState(false);
    const [studentToGrantAccess, setStudentToGrantAccess] = useState<Student | null>(null);
    const [isGrantingAccess, setIsGrantingAccess] = useState(false);

    const [offerings, setOfferings] = useState<Offering[]>([]);

    const initialFormState = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        admissionNo: '',
        admissionDate: new Date(),
        gender: 'Male',
        status: 'Active',
        dob: null as Date | null,
        address: '',
        bloodGroup: '',
        category: 'General',

        religion: '',
        currentOfferingId: ''
    };

    const [formData, setFormData] = useState<StudentFormData>(initialFormState);

    useEffect(() => {
        if (tenantId) {
            fetchStudents();
            fetchOfferings();
        }
    }, [tenantId]);

    const fetchOfferings = async () => {
        try {
            const response = await api.get(`/ims-academic-service/offerings/tenant/${tenantId}`);
            if (response.data.status === 'SUCCESS') {
                setOfferings(response.data.apiData);
            }
        } catch (error) {
            console.error('Failed to fetch offerings', error);
        }
    };

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/ims-student-service/students/tenant/${tenantId}`);
            if (response.data.status === 'SUCCESS') {
                setStudents(response.data.apiData);
            }
        } catch (error: any) {
            toast.error('Failed to fetch students');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        // First Name Validation
        if (!formData.firstName?.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }

        // Last Name Validation
        if (!formData.lastName?.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Phone Validation (assuming 10 digits for simplicity)
        const phoneRegex = /^\d{10}$/;
        if (!formData.phone?.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        // Admission Number
        if (!formData.admissionNo?.trim()) {
            newErrors.admissionNo = 'Admission number is required';
        }

        // Admission Date
        if (!formData.admissionDate) {
            newErrors.admissionDate = 'Admission date is required';
        }

        // DOB
        if (!formData.dob) {
            newErrors.dob = 'Date of birth is required';
        } else {
            const today = new Date();
            if (formData.dob >= today) {
                newErrors.dob = 'Date of birth must be in the past';
            }
        }

        // Religion
        if (!formData.religion?.trim()) {
            newErrors.religion = 'Religion is required';
        }

        // Address
        if (!formData.address?.trim()) {
            newErrors.address = 'Address is required';
        }

        // Academic Offering Validation
        if (!formData.currentOfferingId) {
            newErrors.currentOfferingId = 'Academic Offering (Class) is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
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
                admissionDate: formData.admissionDate ? formData.admissionDate.toISOString().split('T')[0] : null,
                dob: formData.dob ? formData.dob.toISOString().split('T')[0] : null
            };

            let response;
            if (selectedStudentId) {
                response = await api.put(`/ims-student-service/students/${selectedStudentId}`, payload);
            } else {
                response = await api.post('/ims-student-service/students', payload);
            }

            if (response.data.status === 'SUCCESS') {
                toast.success(selectedStudentId ? 'Student updated successfully' : 'Student added successfully');
                setIsModalOpen(false);
                setFormData(initialFormState);
                if (selectedStudentId) {
                    setSelectedStudentId(null);
                }
                fetchStudents(); // Refresh list
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || (selectedStudentId ? 'Failed to update student' : 'Failed to add student');
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (student: Student) => {
        setSelectedStudentId(student.id);

        setFormData({
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            phone: student.phone,
            admissionNo: student.admissionNo,
            admissionDate: student.admissionDate ? new Date(student.admissionDate) : new Date(),
            status: student.status,
            dob: student.dob ? new Date(student.dob) : null,
            gender: student.gender,
            bloodGroup: student.bloodGroup,
            address: student.address,
            category: student.category,

            religion: student.religion,
            currentOfferingId: student.currentOfferingId || ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setStudentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDocsClick = (student: Student) => {
        setStudentForDocs({
            id: student.id,
            name: `${student.firstName} ${student.lastName}`
        });
        setIsDocsModalOpen(true);
    };

    const handleGrantAccessClick = (student: Student) => {
        setStudentToGrantAccess(student);
        setIsGrantAccessModalOpen(true);
    };

    const handleConfirmGrantAccess = async () => {
        if (!studentToGrantAccess) return;

        setIsGrantingAccess(true);
        try {
            const payload = {
                username: studentToGrantAccess.email,
                email: studentToGrantAccess.email,
                tenantId: tenantId
            };

            await api.post('/atl-auth-service/auth/signup', payload);
            toast.success("Access Granted! Default password: student@123");
            setIsGrantAccessModalOpen(false);
            setStudentToGrantAccess(null);
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || "Failed to grant access";
            if (msg.includes("Already Exist")) {
                toast.error("User already has access");
            } else {
                toast.error(msg);
            }
        } finally {
            setIsGrantingAccess(false);
        }
    };


    const handleConfirmDelete = async () => {
        if (!studentToDelete) return;

        setIsDeleting(true);
        try {
            const response = await api.delete(`/ims-student-service/students/${studentToDelete}`);
            if (response.data.status === 'SUCCESS') {
                toast.success('Student deleted successfully');
                setStudents(students.filter(student => student.id !== studentToDelete));
                setIsDeleteModalOpen(false);
                setStudentToDelete(null);
            }
        } catch (error: any) {
            toast.error('Failed to delete student');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-4">
            {/* Compact Header & Actions */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <GraduationCap className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Students</h1>
                        <p className="text-xs text-gray-500 hidden sm:block">Manage student records</p>
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
                            placeholder="Search by name or admission no..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* <button
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors whitespace-nowrap"
                        onClick={() => {
                            setSelectedStudentId(null);
                            setFormData(initialFormState);
                            setIsModalOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Student
                    </button> */}
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name / Admission No
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
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
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
                                        <p className="mt-2 text-sm text-gray-500">Loading students...</p>
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                                            <GraduationCap className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <p className="mt-2 text-sm font-medium text-gray-900">No students found</p>
                                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new student record.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/people/students/${student.id}`)}>
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <AuthenticatedAvatar
                                                        imageUrl={student.profileImageUrl}
                                                        fallbackInitial={student.firstName || '?'}
                                                        alt={`${student.firstName} ${student.lastName}`}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:underline">
                                                        {student.firstName} {student.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        #{student.admissionNo}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{student.email}</div>
                                            <div className="text-sm text-gray-500">{student.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'ACTIVE' || student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {student.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleGrantAccessClick(student)}
                                                    className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors"
                                                    title="Grant Login Access"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDocsClick(student)}
                                                    className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors"
                                                    title="Manage Documents"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(student)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(student.id)}
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

            {/* Add Student Modal */}
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
                                            {selectedStudentId ? 'Edit Student' : 'Add New Student'}
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
                                        <div>
                                            <CustomSelect
                                                label="Blood Group"
                                                name="bloodGroup"
                                                value={formData.bloodGroup || ''}
                                                onChange={handleInputChange}
                                                placeholder="Select..."
                                                options={[
                                                    { value: 'A+', label: 'A+' },
                                                    { value: 'A-', label: 'A-' },
                                                    { value: 'B+', label: 'B+' },
                                                    { value: 'B-', label: 'B-' },
                                                    { value: 'AB+', label: 'AB+' },
                                                    { value: 'AB-', label: 'AB-' },
                                                    { value: 'O+', label: 'O+' },
                                                    { value: 'O-', label: 'O-' }
                                                ]}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Religion <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="religion"
                                                value={formData.religion}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md p-2 ${errors.religion ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                                placeholder="e.g. Hindu, Christian, Muslim"
                                            />
                                            {errors.religion && <p className="mt-1 text-xs text-red-600">{errors.religion}</p>}
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

                                        {/* Academic Details */}
                                        <div className="col-span-full mt-4">
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Academic Details</h4>
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Academic Offering (Class) <span className="text-red-500">*</span></label>
                                            <select
                                                name="currentOfferingId"
                                                value={formData.currentOfferingId || ''}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md p-2 ${errors.currentOfferingId ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                            >
                                                <option value="">Select Offering...</option>
                                                {offerings.map((offering) => (
                                                    <option key={offering.id} value={offering.id}>
                                                        {offering.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.currentOfferingId && <p className="mt-1 text-xs text-red-600">{errors.currentOfferingId}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Admission No <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="admissionNo"
                                                value={formData.admissionNo}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md p-2 ${errors.admissionNo ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                            />
                                            {errors.admissionNo && <p className="mt-1 text-xs text-red-600">{errors.admissionNo}</p>}
                                        </div>
                                        <div>
                                            <CustomDatePicker
                                                label="Admission Date"
                                                selectedDate={formData.admissionDate || null}
                                                onChange={(date) => handleDateChange(date, 'admissionDate')}
                                                error={errors.admissionDate}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <CustomSelect
                                                label="Category"
                                                name="category"
                                                value={formData.category || 'General'}
                                                onChange={handleInputChange}
                                                options={[
                                                    { value: 'General', label: 'General' },
                                                    { value: 'OBC', label: 'OBC' },
                                                    { value: 'SC', label: 'SC' },
                                                    { value: 'ST', label: 'ST' },
                                                    { value: 'Others', label: 'Others' }
                                                ]}
                                            />
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
                                                    { value: 'Suspended', label: 'Suspended' }
                                                ]}
                                            />
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
                                                {selectedStudentId ? 'Update Student' : 'Save Student'}
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
                title="Delete Student"
                message="Are you sure you want to delete this student? This action cannot be undone."
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
                message={`Are you sure you want to provide login access to ${studentToGrantAccess?.firstName}? They will be able to login with their email and default password.`}
                confirmText="Grant Access"
                isLoading={isGrantingAccess}
                variant="success"
            />

            {/* Documents Modal */}
            <StudentDocumentsModal
                isOpen={isDocsModalOpen}
                onClose={() => setIsDocsModalOpen(false)}
                studentId={studentForDocs?.id || null}
                studentName={studentForDocs?.name || ''}
            />
        </div>
    );
};

export default StudentManagementPage;
