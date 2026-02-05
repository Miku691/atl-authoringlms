import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../../store/store';
import api from '../../../../../utils/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../../../components/common/ConfirmationModal';
import CustomDatePicker from '../../../../../components/common/CustomDatePicker';
import CustomSelect from '../../../../../components/common/CustomSelect';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Loader2,
    X,
    Save,
    UserCheck,
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

interface ValidationErrors {
    [key: string]: string;
}

interface InstructorFormData {
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
    qualification: string;
    specialization: string;
    monthlySalary: string | number;
    experience: string;
    userId?: string;
}

const InstructorManagementPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;
    const navigate = useNavigate();

    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isByPassOnboard, setIsByPassOnboard] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);

    // Grant Access Modal State
    const [isGrantAccessModalOpen, setIsGrantAccessModalOpen] = useState(false);
    const [instructorToGrantAccess, setInstructorToGrantAccess] = useState<Instructor | null>(null);
    const [isGrantingAccess, setIsGrantingAccess] = useState(false);

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [instructorToDelete, setInstructorToDelete] = useState<string | null>(null);
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
        qualification: '',
        specialization: '',
        monthlySalary: '',
        experience: ''
    };

    const [formData, setFormData] = useState<InstructorFormData>(initialFormState);

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
        }

        if (!formData.qualification?.trim()) newErrors.qualification = 'Qualification is required';
        if (!formData.specialization?.trim()) newErrors.specialization = 'Specialization is required';
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
            let userId = formData.userId || "";

            if (!selectedInstructorId && !isByPassOnboard) {
                const signupPayload = {
                    username: formData.email,
                    email: formData.email,
                    tenantId: tenantId,
                    roleCode: 'INSTRUCTOR'
                };

                try {
                    const authResponse = await api.post('/atl-auth-service/auth/signup', signupPayload);
                    userId = authResponse.data.apiData.id;
                } catch (authError: any) {
                    const msg = authError.response?.data?.message || "";
                    if (msg.includes("Already Exist")) {
                        toast.error("User with this email already exists in Auth system.");
                        setIsSubmitting(false);
                        return;
                    }
                    throw authError;
                }
            }

            const payload = {
                ...formData,
                userId: userId,
                tenantId: tenantId,
                status: formData.status?.toUpperCase() || 'ACTIVE',
                joinDate: formData.joinDate ? formData.joinDate.toISOString().split('T')[0] : null,
                dob: formData.dob ? formData.dob.toISOString().split('T')[0] : null,
                monthlySalary: formData.monthlySalary ? parseFloat(formData.monthlySalary.toString()) : null,
                experience: formData.experience
            };

            let response;
            if (selectedInstructorId) {
                response = await api.put(`/ims-instructor-service/instructors/${selectedInstructorId}`, payload);
            } else {
                response = await api.post('/ims-instructor-service/instructors', payload);
            }

            if (response.data.status === 'SUCCESS') {
                toast.success(selectedInstructorId ? 'Instructor updated successfully' : 'Instructor added successfully');
                if (!selectedInstructorId && !isByPassOnboard) {
                    toast.success("Login access granted. Default Password: instructor@123", { duration: 6000 });
                }
                setIsModalOpen(false);
                setFormData(initialFormState);
                setSelectedInstructorId(null);
                fetchInstructors();
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || (selectedInstructorId ? 'Failed to update' : 'Failed to add');
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
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
            const signupPayload = {
                username: instructorToGrantAccess.email,
                email: instructorToGrantAccess.email,
                tenantId: tenantId,
                roleCode: 'INSTRUCTOR'
            };

            const authRes = await api.post('/atl-auth-service/auth/signup', signupPayload);
            const userId = authRes.data.apiData.id;

            await api.put(`/ims-instructor-service/instructors/${instructorToGrantAccess.id}`, {
                ...instructorToGrantAccess,
                userId: userId
            });

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
        setSelectedInstructorId(instructor.id);
        setFormData({
            firstName: instructor.firstName,
            lastName: instructor.lastName,
            email: instructor.email,
            phone: instructor.phone,
            employeeId: instructor.employeeId,
            joinDate: instructor.joinDate ? new Date(instructor.joinDate) : new Date(),
            status: instructor.status,
            dob: instructor.dob ? new Date(instructor.dob) : null,
            gender: instructor.gender,
            address: instructor.address,
            qualification: instructor.qualification,
            specialization: instructor.specialization,
            monthlySalary: instructor.monthlySalary ?? '',
            experience: instructor.experience ?? '',
            userId: instructor.userId
        });
        setIsModalOpen(true);
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
                        onClick={() => {
                            setSelectedInstructorId(null);
                            setFormData(initialFormState);
                            setIsByPassOnboard(false);
                            setIsModalOpen(true);
                        }}
                    >
                        <Plus className="w-5 h-5 mr-2" />
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Access</th>
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
                                            {inst.userId ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Active Access</span>
                                            ) : (
                                                <button onClick={() => handleGrantAccessClick(inst)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">Provision Login</button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${inst.status?.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{inst.status}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
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

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-500/75" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-900">{selectedInstructorId ? 'Update Faculty Profile' : 'Onboard New Instructor'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><X className="h-6 w-6" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-8">
                            {!selectedInstructorId && (
                                <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={!isByPassOnboard}
                                            onChange={(e) => setIsByPassOnboard(!e.target.checked)}
                                            className="w-5 h-5 text-indigo-600 rounded-lg"
                                        />
                                        <div>
                                            <span className="text-sm font-bold text-indigo-900 block">Create login credentials automatically</span>
                                        </div>
                                    </label>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="col-span-full border-l-4 border-indigo-500 pl-4"><h4 className="text-sm font-bold text-gray-500 uppercase">Basic Information</h4></div>
                                <div><label className="block text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                                <div><CustomDatePicker label="Date of Birth" selectedDate={formData.dob || null} onChange={(date) => handleDateChange(date, 'dob')} error={errors.dob} required maxDate={new Date()} /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Phone <span className="text-red-500">*</span></label><input type="text" name="phone" value={formData.phone} onChange={handleInputChange} maxLength={10} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>

                                <div className="col-span-full border-l-4 border-emerald-500 pl-4"><h4 className="text-sm font-bold text-gray-500 uppercase">Professional Info</h4></div>
                                <div><label className="block text-sm font-medium text-gray-700">Employee ID <span className="text-red-500">*</span></label><input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                                <div><CustomDatePicker label="Join Date" selectedDate={formData.joinDate || null} onChange={(date) => handleDateChange(date, 'joinDate')} error={errors.joinDate} required /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Qualification <span className="text-red-500">*</span></label><input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} placeholder="e.g. Master in Science" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Specialization <span className="text-red-500">*</span></label><input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="e.g. Physics" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Experience</label><input type="text" name="experience" value={formData.experience} onChange={handleInputChange} placeholder="e.g. 5 Years" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Monthly Salary</label>
                                    <input type="number" name="monthlySalary" value={formData.monthlySalary} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                                <div className="col-span-full"><CustomSelect label="Status" name="status" value={formData.status || 'Active'} onChange={handleInputChange} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }, { value: 'On Leave', label: 'On Leave' }]} /></div>
                                <div className="col-span-full"><label className="block text-sm font-medium text-gray-700">Address <span className="text-red-500">*</span></label><textarea name="address" rows={2} value={formData.address} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea></div>
                            </div>
                        </form>

                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-8 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 flex items-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {selectedInstructorId ? 'Save Changes' : 'Confirm & Onboard'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal isOpen={isGrantAccessModalOpen} onClose={() => setIsGrantAccessModalOpen(false)} onConfirm={handleConfirmGrantAccess} title="Provision Login Access" message={`Grant login access to ${instructorToGrantAccess?.firstName}?`} confirmText="Provision Access" isLoading={isGrantingAccess} variant="success" />
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Deactivate Faculty" message="Are you sure you want to remove this instructor?" confirmText="Delete Instructor" isLoading={isDeleting} variant="danger" />
        </div>
    );
};

export default InstructorManagementPage;
