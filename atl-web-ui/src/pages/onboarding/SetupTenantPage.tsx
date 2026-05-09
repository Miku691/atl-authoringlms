import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { updateSetupStatus } from '../../store/authSlice';
import api from '../../utils/api';
import { School, GraduationCap, Users, CheckCircle, Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import FloatingLabelInput from '../../components/common/FloatingLabelInput';

// --- Types ---

type InstitutionType = 'SCHOOL' | 'COLLEGE' | 'COACHING';

interface ProgramReq {
    name: string;
    code: string;
    numberOfTerms: number;
    termLabel: string;
}

interface BootstrapPayload {
    tenantId: string;
    institutionType: InstitutionType;
    academicYear: string;

    schoolConfig?: {
        board: string;
        startClass: number;
        endClass: number;
        sectionsPerClass: number;
    };

    collegeConfig?: {
        collegeCategory: string;
        affiliation: string;
        programs: ProgramReq[];
    };

    coachingConfig?: {
        affiliation: string;
        programs: ProgramReq[];
    };
}

// --- Components ---

const InitialSetupPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // State
    const [type, setType] = useState<InstitutionType | null>(null);
    const [academicYear, setAcademicYear] = useState<string>(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);

    // School State - Defaults 1-2, Section A (1)
    const [schoolDetails, setSchoolDetails] = useState({
        board: 'CBSE',
        startClass: 1,
        endClass: 2,
        sectionsPerClass: 1
    });

    // College Specific State
    const [collegeDetails, setCollegeDetails] = useState({
        collegeCategory: 'Engineering',
        affiliation: ''
    });

    // Coaching Specific State
    const [coachingDetails, setCoachingDetails] = useState({
        affiliation: ''
    });

    // College/Coaching State
    const [programs, setPrograms] = useState<ProgramReq[]>([
        { name: '', code: '', numberOfTerms: 8, termLabel: 'Semester' }
    ]);

    const addProgram = () => {
        setPrograms([...programs, { name: '', code: '', numberOfTerms: type === 'COLLEGE' ? 8 : 2, termLabel: type === 'COLLEGE' ? 'Semester' : 'Batch' }]);
    };

    const removeProgram = (index: number) => {
        setPrograms(programs.filter((_, i) => i !== index));
    };

    const updateProgram = (index: number, field: keyof ProgramReq, value: any) => {
        const newProgs = [...programs];
        newProgs[index] = { ...newProgs[index], [field]: value };
        setPrograms(newProgs);
    };

    const handleSubmit = async () => {
        if (!user?.tenantId || !type) return;
        setLoading(true);

        try {
            const payload: BootstrapPayload = {
                tenantId: user.tenantId,
                institutionType: type,
                academicYear,
            };

            if (type === 'SCHOOL') {
                payload.schoolConfig = schoolDetails;
            } else if (type === 'COLLEGE') {
                payload.collegeConfig = { 
                    ...collegeDetails,
                    programs: programs.filter(p => p.name.trim() !== '') 
                };
            } else if (type === 'COACHING') {
                payload.coachingConfig = { 
                    ...coachingDetails,
                    programs: programs.filter(p => p.name.trim() !== '') 
                };
            }

            const response = await api.post('/ims-academic-service/bootstrap', payload);

            if (response.data === true) {
                // Update currency first
                await api.put(`/atl-auth-service/tenants/${user.tenantId}`, {
                    ...user, // This is not ideal, but ImsTenantsDto requires common fields. 
                    // Better to just fetch existing or send only what's needed if API allows.
                    // Let's assume the API requires a full DTO or at least the fields we want to change.
                    tenantName: user.tenantName,
                    currency: user.currency || 'INR'
                });

                // Verify setup in Auth Service
                await api.put(`/atl-auth-service/tenants/${user.tenantId}/verify-setup`, null, {
                    params: { type }
                });

                dispatch(updateSetupStatus(true));
                toast.success('Setup completed successfully!');
                navigate('/dashboard');
            } else {
                toast.error('Setup failed. Please try again.');
            }
        } catch (error: any) {
            console.error('Setup error:', error);
            toast.error(error.response?.data?.message || 'An error occurred during setup.');
        } finally {
            setLoading(false);
        }
    };

    // --- Render Steps ---

    const renderTypeSelection = () => (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-center text-content-primary">What type of institution is this?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { id: 'SCHOOL', icon: School, label: 'School', desc: 'K-12, Classes, Sections', color: 'blue' },
                    { id: 'COLLEGE', icon: GraduationCap, label: 'College', desc: 'University, Degrees, Semesters', color: 'purple' },
                    { id: 'COACHING', icon: Users, label: 'Coaching', desc: 'Training Center, Batches', color: 'orange' }
                ].map((item) => (
                    <div
                        key={item.id}
                        onClick={() => {
                            setType(item.id as InstitutionType);
                            // Set defaults for programs based on type
                            if (item.id === 'COLLEGE') {
                                setPrograms([{ name: 'B.Tech Computer Science', code: 'CSE', numberOfTerms: 8, termLabel: 'Semester' }]);
                            } else if (item.id === 'COACHING') {
                                setPrograms([{ name: 'JEE Mains 2026', code: 'JEE-26', numberOfTerms: 2, termLabel: 'Batch' }]);
                            }
                            setStep(2);
                        }}
                        className={`group cursor-pointer p-8 border-2 rounded-2xl transition-all duration-300 flex flex-col items-center relative overflow-hidden
                            ${type === item.id 
                                ? 'border-indigo-500 bg-indigo-500/5 shadow-indigo-500/10 shadow-lg' 
                                : 'border-border hover:border-indigo-500/30 hover:bg-chrome hover:shadow-md'}
                        `}
                    >
                        {type === item.id && (
                            <div className="absolute top-3 right-3">
                                <CheckCircle className="w-5 h-5 text-indigo-500" />
                            </div>
                        )}
                        <div className={`p-5 rounded-2xl mb-5 transition-transform duration-300 group-hover:scale-110 ${type === item.id ? 'bg-indigo-500/20 text-indigo-500' : 'bg-chrome text-content-muted group-hover:text-indigo-500'}`}>
                            <item.icon className="w-10 h-10" />
                        </div>
                        <h3 className={`font-black text-xl mb-2 ${type === item.id ? 'text-indigo-500' : 'text-content-primary'}`}>{item.label}</h3>
                        <p className="text-sm text-content-secondary text-center font-medium opacity-80">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderConfig = () => (
        <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-content-primary">Configure {type}</h2>

            {/* Global Settings */}
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                <FloatingLabelInput
                    label="Academic Year Label"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g. 2024-2025"
                />
            </div>


            {/* School Specific */}
            {type === 'SCHOOL' && (
                <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-6">
                    <h3 className="font-semibold text-content-primary flex items-center gap-2">
                        <School className="w-5 h-5 text-indigo-600" /> School Structure
                    </h3>

                    <div>
                        <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2 px-1">
                            Education Board
                        </label>
                        <select
                            value={schoolDetails.board}
                            onChange={(e) => setSchoolDetails({ ...schoolDetails, board: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 sm:text-sm font-bold transition-all bg-chrome h-[54px]"
                        >
                            <option value="CBSE">CBSE</option>
                            <option value="ICSE">ICSE</option>
                            <option value="STATE">State Board</option>
                            <option value="IGCSE">IGCSE/IB</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FloatingLabelInput
                            label="Start Class"
                            type="number"
                            min="1"
                            max="12"
                            disabled
                            value={schoolDetails.startClass}
                            onChange={() => { }}
                        />
                        <FloatingLabelInput
                            label="End Class"
                            type="number"
                            min="1"
                            max="12"
                            disabled
                            value={schoolDetails.endClass}
                            onChange={() => { }}
                        />
                    </div>

                    <div className="pt-2 border-t border-border">
                        <FloatingLabelInput
                            label="Default Sections per Class"
                            type="number"
                            min="1"
                            max="10"
                            disabled
                            value={schoolDetails.sectionsPerClass}
                            onChange={() => { }}
                            className="mb-0"
                        />
                        <p className="text-[10px] text-content-muted mt-1 px-1 italic">
                            * We will create sections A, B, C... automatically. Default configuration is non-editable during initial setup.
                        </p>
                    </div>
                </div>
            )}

            {/* College/Coaching Specific */}
            {(type === 'COLLEGE' || type === 'COACHING') && (
                <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-4">
                    <h3 className="font-semibold text-content-primary flex items-center gap-2">
                        {type === 'COLLEGE' ? <GraduationCap className="w-5 h-5 text-purple-600" /> : <Users className="w-5 h-5 text-orange-600" />}
                        Institutional Details
                    </h3>

                    {type === 'COLLEGE' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            <div className="relative h-[58px]">
                                <label className="absolute -top-2 left-3 bg-surface px-1 text-[10px] font-bold text-indigo-600 uppercase tracking-widest z-10">
                                    College Category
                                </label>
                                <select
                                    value={collegeDetails.collegeCategory}
                                    onChange={(e) => setCollegeDetails({ ...collegeDetails, collegeCategory: e.target.value })}
                                    className="w-full h-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-bold transition-all bg-chrome appearance-none cursor-pointer"
                                >
                                    <option value="Engineering">Engineering</option>
                                    <option value="Medical">Medical</option>
                                    <option value="Management">Management</option>
                                    <option value="Diploma / Polytechnic">Diploma / Polytechnic</option>
                                    <option value="General Degree (Arts/Science/Commerce)">General Degree (Arts/Science/Commerce)</option>
                                    <option value="Law">Law</option>
                                    <option value="Nursing">Nursing</option>
                                    <option value="Vocational">Vocational</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="h-4 w-4 text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <FloatingLabelInput
                                label="Affiliating University"
                                value={collegeDetails.affiliation}
                                onChange={(e) => setCollegeDetails({ ...collegeDetails, affiliation: e.target.value })}
                                placeholder="e.g. University of Mumbai"
                                className="mb-0 h-[58px]"
                            />
                        </div>
                    )}

                    {type === 'COACHING' && (
                        <div>
                            <FloatingLabelInput
                                label="Board / Regulatory Affiliation"
                                value={coachingDetails.affiliation}
                                onChange={(e) => setCoachingDetails({ ...coachingDetails, affiliation: e.target.value })}
                                placeholder="e.g. State Board, NEP Guidelines"
                            />
                        </div>
                    )}

                    <div className="pt-4 border-t border-border mt-4">
                        <h4 className="text-sm font-semibold text-content-primary mb-4">
                            {type === 'COLLEGE' ? 'Degree Programs' : 'Courses & Batches'}
                        </h4>
                        <div className="space-y-3">
                        {programs.map((prog, idx) => (
                            <div key={idx} className="p-4 bg-chrome rounded-lg border border-border relative group">
                                <button
                                    onClick={() => removeProgram(idx)}
                                    className="absolute top-2 right-2 text-content-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-content-secondary uppercase">
                                            {type === 'COLLEGE' ? 'Branch Name' : 'Course Name'}
                                        </label>
                                        <input
                                            value={prog.name}
                                            onChange={(e) => updateProgram(idx, 'name', e.target.value)}
                                            placeholder={type === 'COLLEGE' ? "e.g. Computer Science" : "e.g. JEE Mains 2025"}
                                            className="w-full p-2 bg-surface border rounded text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-content-secondary uppercase">Code</label>
                                        <input
                                            value={prog.code}
                                            onChange={(e) => updateProgram(idx, 'code', e.target.value)}
                                            placeholder={type === 'COLLEGE' ? "e.g. CSE" : "e.g. JEE"}
                                            className="w-full p-2 bg-surface border rounded text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-content-secondary uppercase">
                                            {type === 'COLLEGE' ? 'No. of Semesters' : 'No. of Batches'}
                                        </label>
                                        <input
                                            type="number"
                                            value={prog.numberOfTerms}
                                            onChange={(e) => updateProgram(idx, 'numberOfTerms', parseInt(e.target.value))}
                                            className="w-full p-2 bg-surface border rounded text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-content-secondary uppercase">Unit Label</label>
                                        <input
                                            value={prog.termLabel}
                                            onChange={(e) => updateProgram(idx, 'termLabel', e.target.value)}
                                            className="w-full p-2 bg-surface border rounded text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addProgram}
                            className="w-full py-3 border-2 border-dashed border-indigo-500/30 text-indigo-500 rounded-xl hover:bg-indigo-500/5 hover:border-indigo-500 flex items-center justify-center gap-2 font-black transition-all text-xs uppercase tracking-widest"
                        >
                            <Plus className="w-4 h-4" /> Add {type === 'COLLEGE' ? 'Program' : 'Course'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-between pt-6">
                <button
                    onClick={() => setStep(1)}
                    className="px-6 py-2 text-content-secondary hover:text-content-primary flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-10 py-3 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-indigo-500/20 font-black text-sm transition-all transform active:scale-95"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    Complete Setup
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-chrome flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-surface rounded-2xl shadow-xl overflow-hidden p-8 animate-slideUp">
                {/* Progress */}
                <div className="mb-12 flex justify-center items-center gap-3">
                    <div className={`h-2 rounded-full transition-all duration-500 ${step === 1 ? 'w-12 bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'w-4 bg-indigo-600/20'}`} />
                    <div className={`h-2 rounded-full transition-all duration-500 ${step === 2 ? 'w-12 bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'w-4 bg-indigo-600/20'}`} />
                </div>

                {step === 1 ? renderTypeSelection() : renderConfig()}
            </div>
        </div>
    );
};

export default InitialSetupPage;
