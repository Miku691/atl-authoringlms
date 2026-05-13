import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService, type Student } from '../../../../../api/studentService';
import { academicService } from '../../../../../api/academicService';
import AuthenticatedAvatar from '../../../../../components/common/AuthenticatedAvatar';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../../store/store';
import api from '../../../../../utils/api';
import {
    User, Book, FileText, Activity, CreditCard, ArrowLeft,
    Mail, Phone, MapPin, Calendar, Droplet, UserCheck, Users, Loader2, X, Trash2, UserPlus, Info,
    CheckCircle2, School
} from 'lucide-react';
import toast from 'react-hot-toast';
import DocumentsTab from './components/DocumentsTab';
import IDCardTab from './components/IDCardTab';
import { guardianService, type StudentGuardianMapping } from '../../../../../api/guardianService';
import GuardianSearchAndLink from '../../../../../components/dashboard/students/GuardianSearchAndLink';

// --- Sub-components ---

const PersonalInfoTab = ({ student, onUpdate }: { student: Student; onUpdate: () => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Student>>({ ...student });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await studentService.updateStudent(student.id, formData);
            if (res.status === 'SUCCESS') {
                toast.success("Profile updated successfully");
                setIsEditing(false);
                onUpdate();
            }
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="bg-surface rounded-xl shadow-sm border border-border p-8 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-content-primary flex items-center gap-3 font-outfit uppercase tracking-tight">
                        <User className="w-6 h-6 text-indigo-600" /> Modify Profile
                    </h3>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="p-2 text-content-muted hover:text-content-secondary transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Basic & Identification */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-content-muted uppercase tracking-widest mb-2 ml-1">First Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-chrome border border-border rounded-2xl text-sm font-bold text-content-primary focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                                value={formData.firstName || ''}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-content-muted uppercase tracking-widest mb-2 ml-1">Last Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-chrome border border-border rounded-2xl text-sm font-bold text-content-primary focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                                value={formData.lastName || ''}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-content-muted uppercase tracking-widest mb-2 ml-1">Gender</label>
                            <select
                                className="w-full px-4 py-3 bg-chrome border border-border rounded-2xl text-sm font-bold text-content-primary focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all cursor-pointer"
                                value={formData.gender || ''}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Parents & Demographics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Parental Info */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-500/10 dark:border-indigo-500/20 pb-2 mt-4">Parental Information</h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-content-muted uppercase tracking-widest mb-2 ml-1">Father's Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-chrome border border-border rounded-2xl text-sm font-bold text-content-primary focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                                        value={formData.fatherName || ''}
                                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-content-muted uppercase tracking-widest mb-2 ml-1">Mother's Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-chrome border border-border rounded-2xl text-sm font-bold text-content-primary focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                                        value={formData.motherName || ''}
                                        onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Demographic info */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-500/10 dark:border-indigo-500/20 pb-2">Demographics</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-content-muted uppercase tracking-widest mb-2 ml-1">Nationality</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-chrome border border-border rounded-2xl text-sm font-bold text-content-primary focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                                        value={formData.nationality || ''}
                                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-content-muted uppercase tracking-widest mb-2 ml-1">Ethnicity</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-chrome border border-border rounded-2xl text-sm font-bold text-content-primary focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                                        value={formData.ethnicity || ''}
                                        onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ID Proof Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-content-muted uppercase tracking-widest mb-2 ml-1">ID Proof Type</label>
                            <select
                                className="w-full px-4 py-3 bg-chrome border border-border rounded-2xl text-sm font-bold text-content-primary focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all cursor-pointer"
                                value={formData.idProofType || ''}
                                onChange={(e) => setFormData({ ...formData, idProofType: e.target.value })}
                            >
                                <option value="">Select ID Type</option>
                                <option value="AADHAR">Aadhar Card</option>
                                <option value="PAN">PAN Card</option>
                                <option value="VOTER_ID">Voter ID</option>
                                <option value="PASSPORT">Passport</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-content-muted uppercase tracking-widest mb-2 ml-1">ID Proof Number</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-chrome border border-border rounded-2xl text-sm font-bold text-content-primary focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                                value={formData.idProofNumber || ''}
                                onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-3 rounded-2xl text-sm font-black text-content-secondary hover:bg-chrome transition-all uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-all transform hover:scale-105 uppercase tracking-widest"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            Update Vault
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-10 animate-fade-in">
            <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 dark:shadow-none transform -rotate-3 transition-transform hover:rotate-0 cursor-default">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-content-primary font-outfit uppercase tracking-tight leading-none">
                            Identity Profile
                        </h3>
                        <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest mt-1">Authentic Personnel Records</p>
                    </div>
                </div>
                <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-surface text-indigo-600 border border-indigo-500/20 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm dark:shadow-none dark:hover:bg-indigo-500"
                >
                    Edit Records
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {/* Column 1: Core Records */}
                <div className="space-y-12">
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
                            <h4 className="text-[11px] font-black text-content-primary uppercase tracking-[0.2em]">Biological Info</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-10 ml-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-chrome flex items-center justify-center text-content-muted shrink-0"><User className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[9px] font-black text-content-muted uppercase tracking-widest mb-1.5 leading-none">Full Name</p>
                                    <p className="font-bold text-content-primary text-sm">{student.firstName} {student.lastName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-chrome flex items-center justify-center text-content-muted shrink-0"><Calendar className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[9px] font-black text-content-muted uppercase tracking-widest mb-1.5 leading-none">Date of Birth</p>
                                    <p className="font-bold text-content-primary text-sm font-mono tracking-tight">{student.dob || <span className="text-gray-300 italic font-normal text-xs">Not Captured</span>}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-chrome flex items-center justify-center text-content-muted shrink-0"><UserCheck className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[9px] font-black text-content-muted uppercase tracking-widest mb-1.5 leading-none">Gender</p>
                                    <p className="font-bold text-content-primary text-sm uppercase tracking-tighter">{student.gender || <span className="text-gray-300 italic font-normal text-xs">Not Captured</span>}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0"><Droplet className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[9px] font-black text-content-muted uppercase tracking-widest mb-1.5 leading-none">Blood Group</p>
                                    <p className="font-bold text-red-600 text-sm">{student.bloodGroup || <span className="text-gray-300 italic font-normal text-xs">Not Set</span>}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-1 h-6 bg-indigo-200 rounded-full"></span>
                            <h4 className="text-[11px] font-black text-content-secondary uppercase tracking-[0.2em]">Parental Information</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-10 ml-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/5 flex items-center justify-center text-indigo-400 shrink-0"><Users className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[9px] font-black text-content-muted uppercase tracking-widest mb-1.5 leading-none">Father's Name</p>
                                    <p className="font-bold text-content-primary text-sm">{student.fatherName || <span className="text-gray-300 italic font-normal text-xs">Not Captured</span>}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/5 flex items-center justify-center text-indigo-400 shrink-0"><Users className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[9px] font-black text-content-muted uppercase tracking-widest mb-1.5 leading-none">Mother's Name</p>
                                    <p className="font-bold text-content-primary text-sm">{student.motherName || <span className="text-gray-300 italic font-normal text-xs">Not Captured</span>}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-chrome/50 p-6 rounded-3xl border border-border">
                        <div className="flex items-center gap-3 mb-6">
                            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Identification Vault</h4>
                        </div>
                        <div className="flex items-start gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-indigo-600 shadow-sm shrink-0"><FileText className="w-6 h-6" /></div>
                            <div>
                                <p className="text-[9px] font-black text-content-muted uppercase tracking-widest mb-1 leading-none">{student.idProofType || 'Legal ID'} Verification</p>
                                <p className="font-black text-content-primary text-lg font-mono tracking-widest leading-none">{student.idProofNumber || 'XXXXXXXXXXXX'}</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Column 2: connectivity & Meta */}
                <div className="space-y-12">
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
                            <h4 className="text-[11px] font-black text-content-primary uppercase tracking-[0.2em]">Connectivity</h4>
                        </div>
                        <div className="space-y-6 ml-4">
                            <div className="flex items-center gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                                <div className="w-10 h-10 rounded-xl bg-chrome flex items-center justify-center text-content-muted group-hover:bg-indigo-500/10 group-hover:text-indigo-600 transition-colors"><Mail className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[9px] font-black text-content-muted uppercase tracking-widest mb-1 led-none">Electronic Mail</p>
                                    <p className="text-sm font-bold text-content-primary tracking-tight leading-none">{student.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                                <div className="w-10 h-10 rounded-xl bg-chrome flex items-center justify-center text-content-muted group-hover:bg-indigo-500/10 group-hover:text-indigo-600 transition-colors"><Phone className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[9px] font-black text-content-muted uppercase tracking-widest mb-1 led-none">Tele-Communication</p>
                                    <p className="text-sm font-bold text-content-primary tracking-tight leading-none">{student.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                                <div className="w-10 h-10 rounded-xl bg-chrome flex items-center justify-center text-content-muted group-hover:bg-indigo-500/10 group-hover:text-indigo-600 transition-colors mt-1"><MapPin className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[9px] font-black text-content-muted uppercase tracking-widest mb-1 led-none">Registry Address</p>
                                    <p className="text-sm font-bold text-content-primary leading-relaxed max-w-xs">{student.address || <span className="text-gray-300 italic font-normal">Location Hidden</span>}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-1 h-6 bg-chrome rounded-full"></span>
                            <h4 className="text-[11px] font-black text-content-secondary uppercase tracking-[0.2em]">Institutional Demographics</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-10 ml-4">
                            <div>
                                <p className="text-[9px] font-black text-content-muted uppercase tracking-widest mb-1.5 leading-none">Citizenship</p>
                                <p className="font-bold text-content-primary text-sm uppercase tracking-tighter">{student.nationality || '----'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-content-muted uppercase tracking-widest mb-1.5 leading-none">Ethnicity</p>
                                <p className="font-bold text-content-primary text-sm uppercase tracking-tighter">{student.ethnicity || '----'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-content-muted uppercase tracking-widest mb-1.5 leading-none">Civil Status</p>
                                <p className="font-bold text-content-primary text-sm uppercase tracking-tighter">{student.maritalStatus || '----'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-content-muted uppercase tracking-widest mb-1.5 leading-none">Languages</p>
                                <p className="font-bold text-content-primary text-sm truncate uppercase tracking-tighter">{student.languages || '----'}</p>
                            </div>
                        </div>
                    </section>

                    <div className="p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl text-white shadow-2xl shadow-indigo-900/20 flex items-center justify-between border border-white/10 group cursor-default">
                        <div>
                            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest leading-none mb-2">Enrollment Identity</p>
                            <p className="font-black text-xl font-outfit uppercase tracking-wider group-hover:scale-105 transition-transform duration-300 inline-block">{student.enrollmentType || 'REGULAR'}</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-surface/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-inner group-hover:rotate-12 transition-transform duration-300">
                            <School className="w-8 h-8 opacity-80" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AcademicTab = ({ studentId }: { studentId: string }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;
    const [tenantType, setTenantType] = useState<string>('SCHOOL');
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkType = async () => {
            if (!user) return;
            if (user.tenantType) {
                setTenantType(user.tenantType);
            } else {
                try {
                    const res = await api.get('/ims-academic-service/readiness/status');
                    if (res.data?.status === 'SUCCESS' && res.data?.apiData?.tenantType) {
                        setTenantType(res.data.apiData.tenantType);
                    }
                } catch (err) {
                    console.error("Failed to fetch tenant type", err);
                }
            }
        };
        checkType();
    }, [user]);

    useEffect(() => {
        if (!tenantId) return;

        const fetchAcademicData = async () => {
            try {
                // Fetch enrollments
                const res = await studentService.getStudentEnrollments(studentId);
                
                // Fetch dictionaries for resolving parent names
                let programs: any[] = [];
                let branches: any[] = [];
                let years: any[] = [];
                let courses: any[] = [];

                if (tenantType === 'COLLEGE') {
                    const [pRes, bRes, yRes] = await Promise.all([
                        api.get(`/ims-academic-service/programs/tenant/${tenantId}`),
                        api.get(`/ims-academic-service/branches/tenant/${tenantId}`),
                        api.get(`/ims-academic-service/years/tenant/${tenantId}`)
                    ]);
                    if (pRes.data.status === 'SUCCESS') programs = pRes.data.apiData;
                    if (bRes.data.status === 'SUCCESS') branches = bRes.data.apiData;
                    if (yRes.data.status === 'SUCCESS') years = yRes.data.apiData;
                } else if (tenantType === 'COACHING') {
                    const [cRes] = await Promise.all([
                        api.get(`/ims-academic-service/courses/tenant/${tenantId}`)
                    ]);
                    if (cRes.data.status === 'SUCCESS') courses = cRes.data.apiData;
                }

                if (res.status === 'SUCCESS') {
                    const rawEnrollments = res.apiData;
                    const enriched = await Promise.all(rawEnrollments.map(async (enr: any) => {
                        let offeringName = 'Unknown';
                        let sectionName = '';
                        let parentName = '';

                        try {
                            if (enr.offeringId) {
                                const offRes = await academicService.getOfferingById(enr.offeringId);
                                if (offRes.status === 'SUCCESS') {
                                    const offering = offRes.apiData;
                                    offeringName = offering.name;
                                    
                                    if (tenantType === 'COLLEGE') {
                                        const year = years.find((y: any) => y.id === offering.yearId);
                                        if (year) {
                                            const branch = branches.find((b: any) => b.id === year.branchId);
                                            if (branch) {
                                                const prog = programs.find((p: any) => p.id === branch.programId);
                                                parentName = `${prog ? prog.title + ' - ' : ''}${branch.name}`;
                                            }
                                        }
                                    } else if (tenantType === 'COACHING') {
                                        const course = courses.find((c: any) => c.id === offering.courseId);
                                        if (course) parentName = course.name;
                                    }
                                }
                            }
                            if (enr.sectionId) {
                                const secRes = await academicService.getSectionById(enr.sectionId);
                                if (secRes.status === 'SUCCESS') sectionName = secRes.apiData.name;
                            }
                        } catch (e) {
                            console.warn("Failed to enrichment info", e);
                        }

                        return { ...enr, offeringName, sectionName, parentName };
                    }));
                    setEnrollments(enriched);
                }
            } catch (e) {
                console.error(e);
                toast.error("Failed to load academic history");
            } finally {
                setLoading(false);
            }
        };
        fetchAcademicData();
    }, [studentId, tenantId, tenantType]);

    if (loading) return <div className="p-4 text-content-secondary">Loading academic data...</div>;

    const renderHeaders = () => {
        if (tenantType === 'COLLEGE') {
            return (
                <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Program / Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Semester</th>
                </>
            );
        } else if (tenantType === 'COACHING') {
            return (
                <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Batch</th>
                </>
            );
        } else {
            return (
                <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Section</th>
                </>
            );
        }
    };

    const renderRowCells = (enr: any) => {
        if (tenantType === 'COLLEGE') {
            return (
                <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-content-primary">{enr.academicYear}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-content-primary">{enr.parentName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary">{enr.offeringName}</td>
                </>
            );
        } else if (tenantType === 'COACHING') {
            return (
                <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-content-primary">{enr.academicYear}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-content-primary">{enr.parentName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary">{enr.offeringName}</td>
                </>
            );
        } else {
            return (
                <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-content-primary">{enr.academicYear}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-content-primary">{enr.offeringName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary">{enr.sectionName || '-'}</td>
                </>
            );
        }
    };

    return (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-bold text-content-primary mb-4 flex items-center gap-2">
                <Book className="w-5 h-5 text-indigo-500" /> Academic History
            </h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-chrome">
                        <tr>
                            {renderHeaders()}
                            <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Roll No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border">
                        {enrollments.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-content-secondary">No enrollments found.</td></tr>
                        ) : (
                            enrollments.map(enr => (
                                <tr key={enr.id}>
                                    {renderRowCells(enr)}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary">{enr.rollNo || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${enr.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600' : 'bg-chrome text-content-primary'
                                            }`}>
                                            {enr.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const GuardianTab = ({ studentId }: { studentId: string }) => {
    const [mappings, setMappings] = useState<StudentGuardianMapping[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchMappings();
    }, [studentId]);

    const fetchMappings = async () => {
        setLoading(true);
        try {
            const res = await guardianService.getStudentGuardians(studentId);
            if (res.data.status === 'SUCCESS') setMappings(res.data.apiData);
        } catch (e) {
            console.error("Failed to load guardians", e);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlink = async (mappingId: string) => {
        if (!window.confirm("Are you sure you want to unlink this guardian?")) return;
        try {
            await guardianService.unlinkStudentFromGuardian(mappingId);
            toast.success("Guardian unlinked");
            fetchMappings();
        } catch (e) {
            toast.error("Failed to unlink guardian");
        }
    };

    if (loading) return (
        <div className="p-12 text-center text-content-secondary bg-surface rounded-xl border border-border">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
            <p className="font-medium">Syncing family records...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-content-primary flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Family Contacts
                    </h3>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${showAddForm ? 'bg-chrome text-content-secondary' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 dark:shadow-none'
                            }`}
                    >
                        {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        {showAddForm ? 'Close' : 'Link Guardian'}
                    </button>
                </div>

                {showAddForm && (
                    <div className="mb-8 p-1 bg-chrome rounded-2xl">
                        <GuardianSearchAndLink
                            studentId={studentId}
                            onMappingCreated={() => {
                                setShowAddForm(false);
                                fetchMappings();
                            }}
                        />
                    </div>
                )}

                {mappings.length === 0 ? (
                    <div className="text-center py-12 bg-chrome/50 rounded-2xl border border-dashed border-border">
                        <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-content-secondary font-medium italic">No family members linked yet.</p>
                        <p className="text-xs text-content-muted mt-1">Add a guardian to enable emergency contacts and portal access.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mappings.map(m => (
                            <div key={m.id} className="group relative flex items-start gap-4 p-5 bg-surface border border-border rounded-2xl hover:border-indigo-500/30 transition-all">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${m.isPrimary ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-chrome text-content-muted'
                                    }`}>
                                    {m.guardianName?.[0]}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-content-primary">{m.guardianName}</h4>
                                        {m.isPrimary && (
                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-black uppercase tracking-tighter">Primary</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-0.5">{m.relation}</p>

                                    <div className="mt-3 space-y-1.5">
                                        <div className="flex items-center gap-2 text-sm text-content-secondary">
                                            <Phone className="w-3.5 h-3.5 text-content-muted" />
                                            {m.guardianPhone}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleUnlink(m.id!)}
                                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Unlink Guardian"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/10 flex gap-3 animate-fade-in">
                <Info className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800 leading-relaxed">
                    <strong>Sibling Linking:</strong> You can link the same guardian to multiple students by using the same phone number.
                </p>
            </div>
        </div>
    );
};

const MedicalTab = () => (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-lg font-bold text-content-primary mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> Medical History
        </h3>
        <p className="text-content-secondary italic">Medical records coming soon...</p>
    </div>
);

const StudentProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'academic' | 'guardians' | 'docs' | 'medical' | 'idcard'>('info');

    useEffect(() => {
        if (id) fetchStudent();
    }, [id]);

    const fetchStudent = async () => {
        try {
            const res = await studentService.getStudentById(id!);
            if (res.status === 'SUCCESS') {
                setStudent(res.apiData);
            }
        } catch (error) {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-content-secondary">Loading profile...</div>;
    if (!student) return <div className="p-8 text-center text-red-500">Student not found</div>;

    const tabs = [
        { id: 'info', label: 'Personal Info', icon: User },
        { id: 'academic', label: 'Academics', icon: Book },
        { id: 'guardians', label: 'Guardians', icon: Users },
        { id: 'docs', label: 'Documents', icon: FileText },
        { id: 'medical', label: 'Medical', icon: Activity },
        { id: 'idcard', label: 'ID Card', icon: CreditCard },
    ];

    return (
        <div className="space-y-6">
            {/* Header / Cover */}
            <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="px-8 pb-6">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end gap-6">
                            <div className="bg-surface p-1 rounded-full shadow-lg">
                                <AuthenticatedAvatar
                                    imageUrl={student.profileImageUrl}
                                    fallbackInitial={student.firstName[0]}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full border-4 border-surface text-4xl"
                                />
                            </div>
                            <div className="mb-2">
                                <h1 className="text-3xl font-bold text-content-primary">{student.firstName} {student.lastName}</h1>
                                <p className="text-content-secondary">#{student.admissionNo} • <span className="text-green-600 font-medium">{student.status}</span></p>
                            </div>
                        </div>
                        <div className="mb-2">
                            <button
                                onClick={() => navigate('/people/students')}
                                className="flex items-center gap-2 text-content-secondary hover:text-content-primary bg-chrome px-4 py-2 rounded-lg border hover:bg-chrome transition"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to List
                            </button>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex gap-1 border-b overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-content-secondary hover:text-content-primary hover:border-border'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in-up">
                {activeTab === 'info' && <PersonalInfoTab student={student} onUpdate={fetchStudent} />}
                {activeTab === 'academic' && <AcademicTab studentId={student.id} />}
                {activeTab === 'guardians' && <GuardianTab studentId={student.id} />}
                {activeTab === 'docs' && <DocumentsTab studentId={student.id} />}
                {activeTab === 'medical' && <MedicalTab />}
                {activeTab === 'idcard' && <IDCardTab />}
            </div>
        </div>
    );
};

export default StudentProfilePage;
