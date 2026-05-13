import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../../store/store';
import api from '../../../../../utils/api';
import toast from 'react-hot-toast';
import { User, BookOpen, Save, Loader2 } from 'lucide-react';
import CustomDatePicker from '../../../../../components/common/CustomDatePicker';

interface Section {
    id: string;
    name: string;
    classId: string;
    offeringId: string;
}

interface ImsClass {
    id: string;
    name: string;
}

interface Program {
    id: string;
    title: string;
}

interface ImsBranch {
    id: string;
    name: string;
    programId?: string;
}

interface ImsYear {
    id: string;
    name: string;
    branchId: string;
    yearNumber: number;
}

interface ImsCourse {
    id: string;
    name: string;
}

interface Offering {
    id: string;
    name: string;
    yearId?: string;
    courseId?: string;
}

const AddStudentPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actualTenantType, setActualTenantType] = useState<string | null>(null);

    // Initial Data
    const [classes, setClasses] = useState<ImsClass[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [availableSections, setAvailableSections] = useState<Section[]>([]);
    
    // College & Coaching Data
    const [programs, setPrograms] = useState<Program[]>([]);
    const [branches, setBranches] = useState<ImsBranch[]>([]);
    const [years, setYears] = useState<ImsYear[]>([]);
    const [courses, setCourses] = useState<ImsCourse[]>([]);
    const [offerings, setOfferings] = useState<Offering[]>([]);

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

        // Academic (School)
        selectedClassId: '',
        selectedSectionId: '',
        
        // Academic (College)
        selectedProgramId: '',
        selectedBranchId: '',
        selectedYearId: '',
        
        // Academic (Coaching)
        selectedCourseId: '',
        
        // Shared Offering
        selectedOfferingId: '',
        rollNo: '',

        // Phase 1 Additional Fields
        fatherName: '',
        motherName: '',
        idProofType: '',
        idProofNumber: '',
        ethnicity: '',
        languages: '',
        nationality: '',
        maritalStatus: '',
        enrollmentType: 'FULL_TIME',
        previousSchool: '',
        admissionDiscount: ''
    });

    useEffect(() => {
        const checkType = async () => {
            if (!user) return;
            if (user.tenantType) {
                setActualTenantType(user.tenantType);
                return;
            }
            try {
                const res = await api.get('/ims-academic-service/readiness/status');
                if (res.data?.status === 'SUCCESS' && res.data?.apiData?.tenantType) {
                    setActualTenantType(res.data.apiData.tenantType);
                } else {
                    setActualTenantType('SCHOOL');
                }
            } catch (err) {
                console.error("Failed to fetch readiness type", err);
                setActualTenantType('SCHOOL');
            }
        };
        checkType();
    }, [user]);

    useEffect(() => {
        if (tenantId && actualTenantType) {
            fetchAcademicData();
        }
    }, [tenantId, actualTenantType]);

    useEffect(() => {
        if (formData.selectedClassId && actualTenantType === 'SCHOOL') {
            const classSections = sections.filter(s => s.classId === formData.selectedClassId);
            setAvailableSections(classSections);
        } else {
            setAvailableSections([]);
        }
    }, [formData.selectedClassId, sections, actualTenantType]);


    const fetchAcademicData = async () => {
        setIsLoading(true);
        try {
            if (actualTenantType === 'COLLEGE') {
                const [progRes, branchRes, yearRes, offRes] = await Promise.all([
                    api.get(`/ims-academic-service/programs/tenant/${tenantId}`),
                    api.get(`/ims-academic-service/branches/tenant/${tenantId}`),
                    api.get(`/ims-academic-service/years/tenant/${tenantId}`),
                    api.get(`/ims-academic-service/offerings/tenant/${tenantId}`)
                ]);
                if (progRes.data.status === 'SUCCESS') setPrograms(progRes.data.apiData);
                if (branchRes.data.status === 'SUCCESS') setBranches(branchRes.data.apiData);
                if (yearRes.data.status === 'SUCCESS') setYears(yearRes.data.apiData);
                if (offRes.data.status === 'SUCCESS') setOfferings(offRes.data.apiData);
            } else if (actualTenantType === 'COACHING') {
                const [courseRes, offRes] = await Promise.all([
                    api.get(`/ims-academic-service/courses/tenant/${tenantId}`),
                    api.get(`/ims-academic-service/offerings/tenant/${tenantId}`)
                ]);
                if (courseRes.data.status === 'SUCCESS') setCourses(courseRes.data.apiData);
                if (offRes.data.status === 'SUCCESS') setOfferings(offRes.data.apiData);
            } else {
                const [classRes, secRes] = await Promise.all([
                    api.get(`/ims-academic-service/classes/tenant/${tenantId}`),
                    api.get(`/ims-academic-service/sections/tenant/${tenantId}`)
                ]);
                if (classRes.data.status === 'SUCCESS') setClasses(classRes.data.apiData);
                if (secRes.data.status === 'SUCCESS') setSections(secRes.data.apiData);
                else setSections([]);
            }
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

    const handleAcademicSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'selectedProgramId') {
                newData.selectedBranchId = '';
                newData.selectedYearId = '';
                newData.selectedOfferingId = '';
            } else if (name === 'selectedBranchId') {
                newData.selectedYearId = '';
                newData.selectedOfferingId = '';
            } else if (name === 'selectedYearId') {
                newData.selectedOfferingId = '';
            } else if (name === 'selectedCourseId') {
                newData.selectedOfferingId = '';
            } else if (name === 'selectedClassId') {
                newData.selectedSectionId = '';
            }
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (actualTenantType === 'SCHOOL' && !formData.selectedClassId) {
            toast.error("Please select a Class");
            return;
        }
        if (actualTenantType === 'COLLEGE' && !formData.selectedOfferingId) {
            toast.error("Please select a Semester");
            return;
        }
        if (actualTenantType === 'COACHING' && !formData.selectedOfferingId) {
            toast.error("Please select a Batch");
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
                fatherName: formData.fatherName,
                motherName: formData.motherName,
                idProofType: formData.idProofType,
                idProofNumber: formData.idProofNumber,
                ethnicity: formData.ethnicity,
                languages: formData.languages,
                nationality: formData.nationality,
                maritalStatus: formData.maritalStatus,
                enrollmentType: formData.enrollmentType,
                previousSchool: formData.previousSchool,
                admissionDiscount: formData.admissionDiscount ? parseFloat(formData.admissionDiscount) : null,
                status: 'ACTIVE'
            });

            if (studentRes.data.status === 'SUCCESS') {
                const studentId = studentRes.data.apiData.id;

                // 2. Create Enrollment
                let targetOfferingId = '';
                
                if (actualTenantType === 'SCHOOL') {
                    const selectedClass = classes.find(c => c.id === formData.selectedClassId);
                    if (!selectedClass) {
                        throw new Error("Invalid Class Selection");
                    }

                    if (formData.selectedSectionId) {
                        const sec = sections.find(s => s.id === formData.selectedSectionId);
                        if (sec) targetOfferingId = sec.offeringId;
                    } else {
                        const defaultSec = sections.find(s => s.classId === formData.selectedClassId && s.name === 'A');
                        if (defaultSec) targetOfferingId = defaultSec.offeringId;
                    }
                } else {
                    targetOfferingId = formData.selectedOfferingId;
                }

                if (!targetOfferingId) {
                    toast.error("Could not determine Offering. Please check academic setup.");
                    setIsSubmitting(false);
                    return;
                }

                await api.post('/ims-student-service/enrollments', {
                    studentId,
                    offeringId: targetOfferingId,
                    sectionId: actualTenantType === 'SCHOOL' ? (formData.selectedSectionId || null) : null,
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
                    <h1 className="text-2xl font-bold text-content-primary">Add New Student</h1>
                    <p className="text-sm text-content-secondary">Enter personal and academic details.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Academic Context */}
                <div className="bg-indigo-500/5 p-6 rounded-xl border border-indigo-500/10">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" /> Academic Enrollment
                    </h3>
                    <div className={`grid grid-cols-1 md:grid-cols-2 ${actualTenantType === 'COLLEGE' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
                        {actualTenantType === 'COLLEGE' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-content-primary">Program <span className="text-red-500">*</span></label>
                                    <select
                                        name="selectedProgramId"
                                        value={formData.selectedProgramId}
                                        onChange={handleAcademicSelectChange}
                                        className="mt-1 w-full p-2 rounded border border-indigo-500/20 bg-surface focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Select Program</option>
                                        {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-content-primary">Branch <span className="text-red-500">*</span></label>
                                    <select
                                        name="selectedBranchId"
                                        value={formData.selectedBranchId}
                                        onChange={handleAcademicSelectChange}
                                        className="mt-1 w-full p-2 rounded border border-indigo-500/20 bg-surface focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                        required
                                        disabled={!formData.selectedProgramId}
                                    >
                                        <option value="">Select Branch</option>
                                        {branches.filter(b => b.programId === formData.selectedProgramId).map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-content-primary">Year <span className="text-red-500">*</span></label>
                                    <select
                                        name="selectedYearId"
                                        value={formData.selectedYearId}
                                        onChange={handleAcademicSelectChange}
                                        className="mt-1 w-full p-2 rounded border border-indigo-500/20 bg-surface focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                        required
                                        disabled={!formData.selectedBranchId}
                                    >
                                        <option value="">Select Year</option>
                                        {years.filter(y => y.branchId === formData.selectedBranchId).sort((a,b)=>a.yearNumber - b.yearNumber).map(y => (
                                            <option key={y.id} value={y.id}>{y.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-content-primary">Semester <span className="text-red-500">*</span></label>
                                    <select
                                        name="selectedOfferingId"
                                        value={formData.selectedOfferingId}
                                        onChange={handleAcademicSelectChange}
                                        className="mt-1 w-full p-2 rounded border border-indigo-500/20 bg-surface focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                        required
                                        disabled={!formData.selectedYearId}
                                    >
                                        <option value="">Select Semester</option>
                                        {offerings.filter(o => o.yearId === formData.selectedYearId).map(o => (
                                            <option key={o.id} value={o.id}>{o.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {actualTenantType === 'COACHING' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-content-primary">Course <span className="text-red-500">*</span></label>
                                    <select
                                        name="selectedCourseId"
                                        value={formData.selectedCourseId}
                                        onChange={handleAcademicSelectChange}
                                        className="mt-1 w-full p-2 rounded border border-indigo-500/20 bg-surface focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-content-primary">Batch <span className="text-red-500">*</span></label>
                                    <select
                                        name="selectedOfferingId"
                                        value={formData.selectedOfferingId}
                                        onChange={handleAcademicSelectChange}
                                        className="mt-1 w-full p-2 rounded border border-indigo-500/20 bg-surface focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                        required
                                        disabled={!formData.selectedCourseId}
                                    >
                                        <option value="">Select Batch</option>
                                        {offerings.filter(o => o.courseId === formData.selectedCourseId).map(o => (
                                            <option key={o.id} value={o.id}>{o.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {actualTenantType === 'SCHOOL' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-content-primary">Class <span className="text-red-500">*</span></label>
                                    <select
                                        name="selectedClassId"
                                        value={formData.selectedClassId}
                                        onChange={handleAcademicSelectChange}
                                        className="mt-1 w-full p-2 rounded border border-indigo-500/20 bg-surface focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-content-primary">Section</label>
                                    <select
                                        name="selectedSectionId"
                                        value={formData.selectedSectionId}
                                        onChange={handleAcademicSelectChange}
                                        className="mt-1 w-full p-2 rounded border border-indigo-500/20 bg-surface focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                        disabled={availableSections.length === 0}
                                    >
                                        <option value="">{availableSections.length === 0 && formData.selectedClassId ? 'No Sections' : 'Select Section'}</option>
                                        {availableSections.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Roll Number</label>
                            <input
                                type="number"
                                name="rollNo"
                                value={formData.rollNo}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 rounded border border-indigo-500/20 bg-surface focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Fee Discount (%)</label>
                            <input
                                type="number"
                                name="admissionDiscount"
                                value={formData.admissionDiscount}
                                onChange={handleChange}
                                placeholder="e.g. 10"
                                className="mt-1 w-full p-2 rounded border border-indigo-500/20 bg-surface focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="bg-surface p-6 rounded-xl shadow-sm border border-border">
                    <h3 className="text-lg font-semibold text-content-primary mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-content-secondary" /> Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-content-primary">First Name <span className="text-red-500">*</span></label>
                            <input
                                name="firstName" value={formData.firstName} onChange={handleChange}
                                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Last Name</label>
                            <input
                                name="lastName" value={formData.lastName} onChange={handleChange}
                                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Admission No <span className="text-red-500">*</span></label>
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
                            <label className="block text-sm font-medium text-content-primary">Gender</label>
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
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-content-primary">Category</label>
                            <input name="category" value={formData.category} onChange={handleChange} className="mt-1 w-full p-2 border rounded" placeholder="e.g. Regular, Private" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Enrollment Type</label>
                            <select name="enrollmentType" value={formData.enrollmentType} onChange={handleChange} className="mt-1 w-full p-2 border rounded">
                                <option value="FULL_TIME">Full Time</option>
                                <option value="DISTANCE">Distance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Blood Group</label>
                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="mt-1 w-full p-2 border rounded">
                                <option value="">Select</option>
                                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Father's Name</label>
                            <input name="fatherName" value={formData.fatherName} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Mother's Name</label>
                            <input name="motherName" value={formData.motherName} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-content-primary">ID Proof Type</label>
                            <select name="idProofType" value={formData.idProofType} onChange={handleChange} className="mt-1 w-full p-2 border rounded">
                                <option value="">Select Type</option>
                                <option value="AADHAR">Aadhar Card</option>
                                <option value="PAN">PAN Card</option>
                                <option value="NATIONAL_ID">National ID / CNIC</option>
                                <option value="PASSPORT">Passport</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-content-primary">ID Proof Number</label>
                            <input name="idProofNumber" value={formData.idProofNumber} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Ethnicity</label>
                            <input name="ethnicity" value={formData.ethnicity} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Nationality</label>
                            <input name="nationality" value={formData.nationality} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Marital Status</label>
                            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="mt-1 w-full p-2 border rounded">
                                <option value="">Select Status</option>
                                <option value="SINGLE">Single</option>
                                <option value="MARRIED">Married</option>
                                <option value="DIVORCED">Divorced</option>
                                <option value="WIDOWED">Widowed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Languages Known</label>
                            <input name="languages" value={formData.languages} onChange={handleChange} className="mt-1 w-full p-2 border rounded" placeholder="e.g. English, Spanish" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Phone Number</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-content-primary">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-content-primary">Previous School Information</label>
                        <input name="previousSchool" value={formData.previousSchool} onChange={handleChange} className="mt-1 w-full p-2 border rounded" placeholder="School name and last class attended" />
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-content-primary">Home Address</label>
                        <textarea
                            name="address" value={formData.address} onChange={handleChange}
                            className="mt-1 w-full p-2 border rounded h-20"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pb-12">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 text-content-secondary hover:bg-chrome rounded-lg transition-colors">Cancel</button>
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
