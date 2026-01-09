import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../../store/store';
import api from '../../../../../utils/api';
import toast from 'react-hot-toast';
import CustomDatePicker from '../../../../../components/common/CustomDatePicker';
import CustomSelect from '../../../../../components/common/CustomSelect';
import {
    UserCircle,
    Save,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Offering {
    id: string;
    name: string;
}

interface ValidationErrors {
    [key: string]: string;
}

const AddStudentPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [offerings, setOfferings] = useState<Offering[]>([]);
    const [isLoadingOfferings, setIsLoadingOfferings] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    const initialFormState = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        admissionNo: '',
        admissionDate: new Date(),
        gender: 'Male',
        dob: null as Date | null,
        address: '',
        bloodGroup: '',
        category: 'General',
        religion: '',
        currentOfferingId: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (tenantId) {
            fetchOfferings();
        }
    }, [tenantId]);

    const fetchOfferings = async () => {
        setIsLoadingOfferings(true);
        try {
            const response = await api.get(`/ims-academic/offerings/tenant/${tenantId}`);
            if (response.data.status === 'SUCCESS') {
                setOfferings(response.data.apiData);
            }
        } catch (error) {
            console.error('Failed to fetch offerings', error);
            toast.error('Failed to load academic offerings');
        } finally {
            setIsLoadingOfferings(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        const phoneRegex = /^\d{10}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        if (!formData.admissionNo.trim()) newErrors.admissionNo = 'Admission number is required';

        if (!formData.admissionDate) newErrors.admissionDate = 'Admission date is required';

        if (!formData.dob) {
            newErrors.dob = 'Date of birth is required';
        } else if (formData.dob >= new Date()) {
            newErrors.dob = 'Date of birth must be in the past';
        }

        if (!formData.religion.trim()) newErrors.religion = 'Religion is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';

        if (!formData.currentOfferingId) {
            newErrors.currentOfferingId = 'Academic Offering is mandatory';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleDateChange = (date: Date | null, name: string) => {
        setFormData(prev => ({ ...prev, [name]: date }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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
            // Step 1: Create Student Identity
            const studentPayload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                admissionNo: formData.admissionNo,
                admissionDate: formData.admissionDate.toISOString().split('T')[0],
                dob: formData.dob ? formData.dob.toISOString().split('T')[0] : null,
                gender: formData.gender,
                bloodGroup: formData.bloodGroup,
                category: formData.category,
                religion: formData.religion,
                address: formData.address,
                tenantId: tenantId,
                status: 'ACTIVE'
            };

            const studentResponse = await api.post('/ims-student/students', studentPayload);

            if (studentResponse.data.status === 'SUCCESS') {
                const newStudentId = studentResponse.data.apiData.id;

                // Step 2: Create Enrollment
                const enrollmentPayload = {
                    studentId: newStudentId,
                    offeringId: formData.currentOfferingId,
                    academicYear: '2025-2026', // TODO: Make dynamic from System Config
                    status: 'ACTIVE'
                };

                try {
                    const enrollmentResponse = await api.post('/ims-student/student-enrollments', enrollmentPayload);
                    if (enrollmentResponse.data.status === 'SUCCESS') {
                        toast.success('Student and enrollment created successfully!');
                        navigate('/people/students');
                    }
                } catch (enrollmentError: any) {
                    console.error('Enrollment Failed', enrollmentError);
                    toast.error('Student created, BUT enrollment failed! Please enroll manually.');
                    // Redirect to enrollments or student detail page to fix it
                    navigate('/people/students');
                }
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to create student';
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/people/students')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
                        <p className="text-sm text-gray-500">Create a student record and enroll them in a class.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* Personal Details */}
                            <div className="col-span-full border-b pb-2 mb-2">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <UserCircle className="w-4 h-4" /> Personal Details
                                </h4>
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
                                    selectedDate={formData.dob}
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
                                    value={formData.gender}
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
                                    value={formData.bloodGroup}
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
                                    placeholder="e.g. Hindu, Christian"
                                />
                                {errors.religion && <p className="mt-1 text-xs text-red-600">{errors.religion}</p>}
                            </div>

                            {/* Contact Details */}
                            <div className="col-span-full border-b pb-2 mb-2 mt-4">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                    Contact Information
                                </h4>
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
                            <div className="col-span-full border-b pb-2 mb-2 mt-4">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                    Academic Details
                                </h4>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Academic Offering (Class) <span className="text-red-500">*</span></label>
                                <select
                                    name="currentOfferingId"
                                    value={formData.currentOfferingId}
                                    onChange={handleInputChange}
                                    disabled={isLoadingOfferings}
                                    className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md p-2 ${errors.currentOfferingId ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                >
                                    <option value="">{isLoadingOfferings ? 'Loading Offerings...' : 'Select Offering...'}</option>
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
                                    selectedDate={formData.admissionDate}
                                    onChange={(date) => handleDateChange(date, 'admissionDate')}
                                    error={errors.admissionDate}
                                    required
                                />
                            </div>
                            <div>
                                <CustomSelect
                                    label="Category"
                                    name="category"
                                    value={formData.category}
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

                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse border-t">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ml-3"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Student
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/people/students')}
                            className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-6 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStudentPage;
