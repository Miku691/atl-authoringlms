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
        <div className="space-y-8 pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">My Academics</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-indigo-500" /> Enrolled Offering & Subject Matrix
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Active Enrollment</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Enrollment Summary & Quick Stats */}
                <div className="space-y-8">
                    {/* Primary Offering Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 w-fit mb-8">
                                <GraduationCap className="w-8 h-8 text-indigo-400" />
                            </div>

                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Current Class / Offering</p>
                            <h3 className="text-3xl font-black italic tracking-tight mb-8">
                                {enrollment.offeringName}
                            </h3>

                            <div className="space-y-6 pt-8 border-t border-white/5">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-slate-500 uppercase tracking-widest text-[10px]">Academic Year</span>
                                    <span className="bg-white/5 px-3 py-1 rounded-lg border border-white/10 uppercase italic">2024-25</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-slate-500 uppercase tracking-widest text-[10px]">Enrollment Unit</span>
                                    <span className="text-indigo-400">Regular</span>
                                </div>
                            </div>
                        </div>
                        {/* Decorative glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]"></div>
                    </div>

                    {/* Stats Widget */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Curriculum Density</h3>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-5xl font-black text-slate-900 italic tracking-tighter transition-transform group-hover:scale-110 origin-left">{subjects.length}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase mt-2">Mapped Subjects</p>
                            </div>
                            <div className="p-4 bg-indigo-50 rounded-[1.5rem] text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                                <BookOpen className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Subject Grid */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm h-full">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                <Star className="w-5 h-5 text-amber-500" /> Academic Matrix
                            </h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                                {subjects.length} Total
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subjects.map((subject, idx) => (
                                <div key={idx} className="p-6 rounded-[2rem] border border-slate-50 bg-slate-50/20 hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all group flex items-start gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-indigo-600 text-xl italic shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        {subject.subjectName?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${subject.isOptional ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                }`}>
                                                {subject.isOptional ? 'Optional' : 'Core'}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                        <h4 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors truncate">
                                            {subject.subjectName}
                                        </h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Domain</p>
                                    </div>
                                </div>
                            ))}
                            {subjects.length === 0 && (
                                <div className="col-span-full py-20 text-center">
                                    <Info className="w-12 h-12 text-slate-200 mx-auto mb-4 opacity-50" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No subjects mapped to this class yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Curriculum Policy Info */}
                    <div className="bg-indigo-50 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                        <div className="p-5 bg-white rounded-3xl shadow-xl shadow-indigo-200/50 relative z-10 group-hover:scale-110 transition-transform">
                            <Zap className="w-10 h-10 text-indigo-600" />
                        </div>
                        <div className="relative z-10 text-center md:text-left">
                            <h4 className="text-lg font-black text-indigo-900 uppercase tracking-tight italic">Platform Policy Awareness</h4>
                            <p className="text-sm text-indigo-600/70 font-medium leading-relaxed mt-2 max-w-xl">
                                Your academic subjects are managed by the institution. Any updates to the curriculum will be instantly reflected here.
                                Attendance and performance tracking are scoped to these registered subjects.
                            </p>
                        </div>
                        {/* Interactive background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAcademicsPage;
