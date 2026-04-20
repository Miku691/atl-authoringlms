import React, { useEffect, useState } from 'react';
import {
    BookOpen, GraduationCap, Loader2,
    ShieldCheck, Star, Info,
    ChevronRight, Zap
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { studentDashboardService } from '../../../api/studentDashboardService';
import { academicService } from '../../../api/academicService';
import toast from 'react-hot-toast';

const MyAcademicsPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [subjects, setSubjects] = useState<any[]>([]);

    useEffect(() => {
        if (user?.email && user?.tenantId) {
            loadAcademicData();
        }
    }, [user?.email, user?.tenantId]);

    const loadAcademicData = async () => {
        setLoading(true);
        try {
            const { enrollment } = await studentDashboardService.getStudentContext(user!.email!, user!.tenantId!);
            setEnrollment(enrollment);

            if (enrollment?.offeringId) {
                const subjectsRes = await academicService.getOfferingSubjects(enrollment.offeringId);
                if (subjectsRes.status === 'SUCCESS') {
                    setSubjects(subjectsRes.apiData);
                }
            }
        } catch (error) {
            console.error("Error loading academics:", error);
            toast.error("Failed to load academic map");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!enrollment) {
        return (
            <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-sm mt-10">
                <GraduationCap className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Academics Not Active</h2>
                <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">
                    You are currently not enrolled in any active class. Please complete your admission or contact management.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in">
            {/* Page Header - Professional & Airy */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Infrastructure</span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">My Academics</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px] flex items-center gap-2 opacity-70">
                        Institutional Grade Subject Matrix & Enrollment Verified
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-8 py-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all duration-500">
                        <ShieldCheck className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none italic">Verified Active</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Enrollment Summary & Quick Stats */}
                <div className="space-y-10">
                    {/* Primary Offering Card - Premium Dark */}
                    <div className="bg-[#0A0C10] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-10 group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all duration-500 shadow-lg">
                                <GraduationCap className="w-8 h-8 text-indigo-400 group-hover:text-white" />
                            </div>

                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 opacity-60">Primary Academic Unit</p>
                            <h3 className="text-4xl font-black italic tracking-tighter leading-none mb-12 group-hover:text-indigo-400 transition-colors uppercase">
                                {enrollment.offeringName}
                            </h3>

                            <div className="space-y-6 pt-10 border-t border-white/5">
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-slate-500 uppercase tracking-widest text-[8px] font-black italic">Cycle Period</span>
                                    <span className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-black uppercase italic tracking-widest group-hover/item:text-indigo-400 transition-colors">2024-25 Cycle</span>
                                </div>
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-slate-500 uppercase tracking-widest text-[8px] font-black italic">Enrollment Mode</span>
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic leading-none">Operational / Regular</span>
                                </div>
                            </div>
                        </div>
                        {/* Interactive decorative glow */}
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-1000"></div>
                    </div>

                    {/* Stats Widget */}
                    <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-center gap-3 mb-10">
                            <Star className="w-4 h-4 text-amber-500" />
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Curriculum Metric</h3>
                        </div>
                        <div className="flex items-end justify-between relative z-10">
                            <div>
                                <p className="text-7xl font-black text-slate-900 italic tracking-tighter leading-none group-hover:scale-110 origin-left transition-transform duration-500">{subjects.length}</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase mt-4 tracking-widest opacity-60 italic">Course Density</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-[2rem] text-slate-200 transition-all duration-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12 shadow-sm border border-slate-100">
                                <BookOpen className="w-8 h-8" />
                            </div>
                        </div>
                        {/* Background Decoration */}
                        <div className="absolute -left-4 -bottom-4 text-[100px] font-black text-slate-50 opacity-0 group-hover:opacity-100 transition-all italic leading-none pointer-events-none uppercase">
                            CORE
                        </div>
                    </div>
                </div>

                {/* Right Column: Subject Grid */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-sm min-h-[600px] flex flex-col">
                        <div className="flex items-center justify-between mb-12">
                            <div className="space-y-1">
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <Zap className="w-4 h-4 text-indigo-600 animate-pulse" /> Intellectual Mapping
                                </h3>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-7 italic">Authorized Course Structure</p>
                            </div>
                            <span className="px-5 py-2 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase italic tracking-widest shadow-xl">
                                {subjects.length} Units
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {subjects.map((subject, idx) => (
                                <div key={idx} className="p-8 rounded-[2.5rem] border border-slate-50 bg-slate-50/20 hover:bg-white hover:border-indigo-100 hover:shadow-2xl transition-all duration-500 group flex items-center gap-6 relative overflow-hidden">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center font-black text-indigo-600 text-2xl italic shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 relative z-10">
                                        {subject.subjectName?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[8px] font-black px-3 py-1 rounded-full border uppercase tracking-widest italic ${subject.isOptional ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                }`}>
                                                {subject.isOptional ? 'Optional' : 'Core Unit'}
                                            </span>
                                        </div>
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors truncate italic uppercase">
                                            {subject.subjectName}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Syllabus Active</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-400 transition-all group-hover:translate-x-1" />
                                    
                                    {/* Subject ID ID */}
                                    <div className="absolute -right-4 -bottom-4 text-[40px] font-black text-slate-50 opacity-0 group-hover:opacity-100 transition-all italic leading-none pointer-events-none uppercase">
                                        #{idx + 1}
                                    </div>
                                </div>
                            ))}
                            {subjects.length === 0 && (
                                <div className="col-span-full py-32 text-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-dashed border-slate-200">
                                        <Info className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Matrix Empty</h4>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 opacity-60">No subjects detected in current academic unit</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Policy Awareness Card */}
                    <div className="bg-indigo-50 rounded-[3rem] p-12 flex flex-col md:flex-row items-center gap-10 lg:gap-14 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                        <div className="w-20 h-20 bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-300/50 flex items-center justify-center relative z-10 group-hover:rotate-12 transition-transform duration-500 border border-indigo-100">
                            <Info className="w-10 h-10 text-indigo-600" />
                        </div>
                        <div className="relative z-10 text-center md:text-left flex-1">
                            <h4 className="text-xl font-black text-indigo-950 uppercase tracking-tighter italic leading-none mb-4">Infrastructure Policy Awareness</h4>
                            <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest leading-relaxed opacity-70">
                                Your academic subjects are managed by the institution. Any updates to the curriculum will be instantly reflected here.
                                Attendance and performance tracking are scoped to these registered subjects.
                            </p>
                        </div>
                        {/* Interactive glow effect */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-100 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-all duration-1000 blur-3xl opacity-50"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAcademicsPage;
