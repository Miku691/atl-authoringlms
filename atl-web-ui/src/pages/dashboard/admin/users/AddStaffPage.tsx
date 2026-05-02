import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../../../../store/store';
import api from '../../../../utils/api';
import toast from 'react-hot-toast';
import {
    Save,
    ArrowLeft,
    User,
    Mail,
    Phone,
    Briefcase,
    GraduationCap,
    MapPin,
    Clock,
    Banknote,
    Loader2,
    Shield
} from 'lucide-react';
import PageHeader from '../../../../components/common/PageHeader';
import FloatingLabelInput from '../../../../components/common/FloatingLabelInput';
import CustomDatePicker from '../../../../components/common/CustomDatePicker';
import CustomSelect from '../../../../components/common/CustomSelect';

interface ValidationErrors {
    [key: string]: string;
}

const AddStaffPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    const initialFormState = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
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

    const [formData, setFormData] = useState(initialFormState);

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

        if (!formData.joinDate) newErrors.joinDate = 'Join date is required';
        if (!formData.dob) newErrors.dob = 'Date of birth is required';
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
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                dob: formData.dob ? formData.dob.toISOString().split('T')[0] : null,
                gender: formData.gender,
                address: formData.address,
                joinDate: formData.joinDate ? formData.joinDate.toISOString().split('T')[0] : null,
                role: formData.role,
                department: formData.department,
                status: formData.status?.toUpperCase() || 'ACTIVE',
                monthlySalary: formData.monthlySalary ? parseFloat(formData.monthlySalary.toString()) : null,
                qualification: formData.qualification,
                experience: formData.experience,
                tenantId: tenantId
            };

            const response = await api.post('/ims-staff-service/staff', payload);

            if (response.data.status === 'SUCCESS') {
                toast.success('Staff added successfully');
                navigate('/people/staff/all');
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to add staff';
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-chrome rounded-lg transition-colors text-content-secondary"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <PageHeader
                    title="Add New Staff Member"
                    description="Register a new support staff member and define their role in the institution."
                    icon={User}
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-surface p-8 rounded-3xl shadow-sm border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="col-span-full pb-2 border-b border-border">
                            <h2 className="text-lg font-bold text-content-primary flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-500" />
                                Personal Details
                            </h2>
                        </div>

                        <FloatingLabelInput
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            icon={<User className="w-5 h-5" />}
                            error={errors.firstName}
                            required
                        />

                        <FloatingLabelInput
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            icon={<User className="w-5 h-5" />}
                            error={errors.lastName}
                            required
                        />

                        <CustomDatePicker
                            label="Date of Birth"
                            selectedDate={formData.dob}
                            onChange={(date) => handleDateChange(date, 'dob')}
                            error={errors.dob}
                            required
                            maxDate={new Date()}
                        />

                        <FloatingLabelInput
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            icon={<Mail className="w-5 h-5" />}
                            error={errors.email}
                            required
                        />

                        <FloatingLabelInput
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            icon={<Phone className="w-5 h-5" />}
                            error={errors.phone}
                            required
                            maxLength={10}
                        />

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

                        <div className="col-span-full mt-4 pb-2 border-b border-border">
                            <h2 className="text-lg font-bold text-content-primary flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-emerald-500" />
                                Professional Details
                            </h2>
                        </div>


                        <CustomDatePicker
                            label="Join Date"
                            selectedDate={formData.joinDate}
                            onChange={(date) => handleDateChange(date, 'joinDate')}
                            error={errors.joinDate}
                            required
                        />

                        <FloatingLabelInput
                            label="Designation / Role"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            icon={<Shield className="w-5 h-5" />}
                            error={errors.role}
                            required
                            placeholder="e.g. Accountant, Librarian"
                        />

                        <FloatingLabelInput
                            label="Department"
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            icon={<Briefcase className="w-5 h-5" />}
                            error={errors.department}
                            required
                            placeholder="e.g. Admin, Finance"
                        />

                        <CustomSelect
                            label="Employment Status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            options={[
                                { value: 'Active', label: 'Active' },
                                { value: 'Inactive', label: 'Inactive' },
                                { value: 'On Leave', label: 'On Leave' }
                            ]}
                        />

                        <div className="col-span-full mt-4 pb-2 border-b border-border">
                            <h2 className="text-lg font-bold text-content-primary flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-amber-500" />
                                Background & Finance
                            </h2>
                        </div>

                        <FloatingLabelInput
                            label="Qualification"
                            name="qualification"
                            value={formData.qualification}
                            onChange={handleInputChange}
                            icon={<GraduationCap className="w-5 h-5" />}
                            placeholder="e.g. MBA, PhD"
                        />

                        <FloatingLabelInput
                            label="Experience"
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                            icon={<Clock className="w-5 h-5" />}
                            placeholder="e.g. 5 Years"
                        />

                        <FloatingLabelInput
                            label="Monthly Salary"
                            name="monthlySalary"
                            type="number"
                            value={formData.monthlySalary}
                            onChange={handleInputChange}
                            icon={<Banknote className="w-5 h-5" />}
                            placeholder="0.00"
                        />

                        <div className="col-span-full">
                            <label className="block text-sm font-bold text-content-primary mb-2">Residential Address <span className="text-red-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute top-3 left-4 text-content-muted group-focus-within:text-indigo-500 transition-colors">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <textarea
                                    name="address"
                                    rows={3}
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className={`w-full pl-12 pr-4 py-3 bg-chrome border rounded-2xl focus:outline-none focus:ring-2 transition-all resize-none ${errors.address ? 'border-red-300 focus:ring-red-500' : 'border-border focus:ring-indigo-500 focus:bg-surface'}`}
                                    placeholder="Enter complete residential address..."
                                />
                            </div>
                            {errors.address && <p className="mt-1 text-xs text-red-500 pl-1">{errors.address}</p>}
                        </div>
                    </div>

                    <div className="mt-10 flex justify-end gap-4 border-t border-border pt-8">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-8 py-4 bg-chrome text-content-secondary rounded-2xl font-bold hover:bg-chrome transition-all border border-border"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving Staff Profile...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Staff Profile
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddStaffPage;
