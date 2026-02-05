import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../../store/store';
import api from '../../../../../utils/api';
import toast from 'react-hot-toast';
import { User, BookOpen, Save, X, Loader2 } from 'lucide-react';
import CustomDatePicker from '../../../../../components/common/CustomDatePicker';

interface Section {
    id: string;
    name: string;
    classId: string;
}

interface ImsClass {
    id: string;
    name: string;
    offeringId: string;
}

const AddStudentPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Data
    const [classes, setClasses] = useState<ImsClass[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [availableSections, setAvailableSections] = useState<Section[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        bloodGroup: '',
        admissionNo: '',
        admissionDate: new Date().toISOString().split('T')[0],
        category: '',
        religion: '',
        address: '',

        // Academic
        selectedClassId: '',
        selectedSectionId: '',
        rollNo: '',

        // Phase 1 Additional Fields
        birthFormId: '',
        isOrphan: false,
        caste: '',
        previousSchool: '',
        admissionDiscount: ''
    });

    useEffect(() => {
        if (tenantId) {
            fetchAcademicData();
        }
    }, [tenantId]);

    useEffect(() => {
        if (formData.selectedClassId) {
            const classSections = sections.filter(s => s.classId === formData.selectedClassId);
            setAvailableSections(classSections);
            setFormData(prev => ({ ...prev, selectedSectionId: '' }));
        } else {
            setAvailableSections([]);
        }
    }, [formData.selectedClassId, sections]);


    const fetchAcademicData = async () => {
        setIsLoading(true);
        try {
            const [classRes, secRes] = await Promise.all([
                api.get(`/ims-academic-service/classes/tenant/${tenantId}`),
                api.get(`/ims-academic-service/sections/tenant/${tenantId}`)
            ]);

            if (classRes.data.status === 'SUCCESS') setClasses(classRes.data.apiData);
            if (secRes.data.status === 'SUCCESS') setSections(secRes.data.apiData);
            else setSections([]);

        } catch (error) {
            console.error(error);
            toast.error("Failed to load academic data. Please ensure academic structure is set up.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        if (type === 'checkbox') {
            setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.selectedClassId) {
            toast.error("Please select a Class");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Create Student
            const studentRes = await api.post('/ims-student-service/students', {
                tenantId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                dob: formData.dob,
                gender: formData.gender,
                bloodGroup: formData.bloodGroup,
                admissionNo: formData.admissionNo,
                admissionDate: formData.admissionDate,
                category: formData.category,
                religion: formData.religion,
                address: formData.address,
                birthFormId: formData.birthFormId,
                isOrphan: formData.isOrphan,
                caste: formData.caste,
                previousSchool: formData.previousSchool,
                admissionDiscount: formData.admissionDiscount ? parseFloat(formData.admissionDiscount) : null,
                status: 'ACTIVE'
            });

            if (studentRes.data.status === 'SUCCESS') {
                const studentId = studentRes.data.apiData.id;

                // 2. Create Enrollment
                const selectedClass = classes.find(c => c.id === formData.selectedClassId);
                if (!selectedClass) {
                    throw new Error("Invalid Class Selection");
                }

                await api.post('/ims-student-service/enrollments', {
                    studentId,
                    offeringId: selectedClass.offeringId,
                    sectionId: formData.selectedSectionId || null,
                    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
                    rollNo: formData.rollNo ? parseInt(formData.rollNo) : null,
                    status: 'ACTIVE'
                });

                toast.success("Student Admitted Successfully");
                navigate('/people/students');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to add student");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
                    <p className="text-sm text-gray-500">Enter personal and academic details.</p>
                </div>
                <button onClick={() => navigate('/people/students')} className="text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Academic Context */}
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" /> Academic Enrollment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-indigo-800">Class <span className="text-red-500">*</span></label>
                            <select
                                name="selectedClassId"
                                value={formData.selectedClassId}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 rounded border border-indigo-200 focus:ring-2 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-indigo-800">Section</label>
                            <select
                                name="selectedSectionId"
                                value={formData.selectedSectionId}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 rounded border border-indigo-200 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                disabled={availableSections.length === 0}
                            >
                                <option value="">{availableSections.length === 0 ? 'No Sections' : 'Select Section'}</option>
                                {availableSections.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-indigo-800">Roll Number</label>
                            <input
                                type="number"
                                name="rollNo"
                                value={formData.rollNo}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 rounded border border-indigo-200 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-indigo-800">Fee Discount (%)</label>
                            <input
                                type="number"
                                name="admissionDiscount"
                                value={formData.admissionDiscount}
                                onChange={handleChange}
                                placeholder="e.g. 10"
                                className="mt-1 w-full p-2 rounded border border-indigo-200 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-500" /> Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
                            <input
                                name="firstName" value={formData.firstName} onChange={handleChange}
                                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                name="lastName" value={formData.lastName} onChange={handleChange}
                                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Admission No <span className="text-red-500">*</span></label>
                            <input
                                name="admissionNo" value={formData.admissionNo} onChange={handleChange}
                                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" required
                            />
                        </div>

                        <div>
                            <CustomDatePicker
                                label="Admission Date"
                                selectedDate={formData.admissionDate ? new Date(formData.admissionDate) : null}
                                onChange={(date) => setFormData({ ...formData, admissionDate: date ? date.toISOString().split('T')[0] : '' })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 w-full p-2 border rounded">
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <CustomDatePicker
                                label="Date of Birth"
                                selectedDate={formData.dob ? new Date(formData.dob) : null}
                                onChange={(date) => setFormData({ ...formData, dob: date ? date.toISOString().split('T')[0] : '' })}
                                maxDate={new Date()}
                                showYearDropdown
                                scrollableYearDropdown
                                yearDropdownItemNumber={20}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Birth Form ID</label>
                            <input
                                name="birthFormId" value={formData.birthFormId} onChange={handleChange}
                                placeholder="B-Form or National ID"
                                className="mt-1 w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Caste / Tribe</label>
                            <input
                                name="caste" value={formData.caste} onChange={handleChange}
                                placeholder="e.g. Balochi, Punjabi"
                                className="mt-1 w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="mt-1 w-full p-2 border rounded">
                                <option value="">Select</option>
                                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <input name="category" value={formData.category} onChange={handleChange} className="mt-1 w-full p-2 border rounded" placeholder="e.g. Regular, Private" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Religion</label>
                            <input name="religion" value={formData.religion} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input
                                type="checkbox"
                                name="isOrphan"
                                checked={formData.isOrphan}
                                onChange={handleChange}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label className="text-sm font-medium text-gray-700">Is Orphan?</label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700">Previous School Information</label>
                        <input name="previousSchool" value={formData.previousSchool} onChange={handleChange} className="mt-1 w-full p-2 border rounded" placeholder="School name and last class attended" />
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700">Home Address</label>
                        <textarea
                            name="address" value={formData.address} onChange={handleChange}
                            className="mt-1 w-full p-2 border rounded h-20"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pb-12">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-md transition-all active:scale-95"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Admit Student
                    </button>
                </div>

            </form>
        </div>
    );
};

export default AddStudentPage;
