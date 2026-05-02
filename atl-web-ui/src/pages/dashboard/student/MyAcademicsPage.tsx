import React, { useEffect, useState } from 'react';
import {
    BookOpen, GraduationCap, Loader2,
    ShieldCheck, Star, Info,
    ChevronRight, Zap, Target,
    Calendar, Inbox, Map,
    BookMarked,
    Clock
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
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#0054d1] mb-4" />
                <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest">Compiling Academic Map...</p>
            </div>
        );
    }

    if (!enrollment) {
        return (
            <div className="bg-surface rounded-2xl p-16 text-center shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] mt-10">
                <GraduationCap className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h2 className="text-xl font-bold text-[#1a3d8a]">Academics Not Active</h2>
                <p className="text-sm text-content-secondary max-w-sm mx-auto mt-2 font-medium">
                    You are currently not enrolled in any active class. Please complete your admission or contact management.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700 px-4 lg:px-0">
            {/* Page Header Block */}
            <div className="bg-[#f1f3f9] rounded-2xl p-8 md:p-10 relative overflow-hidden mb-10">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <span className="text-[10px] font-semibold text-[#3c5ba9] uppercase tracking-widest mb-2 block">Academic Context</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-[#1a3d8a] tracking-tight">My Academics</h1>
                        <p className="text-sm text-[#424655] mt-1 max-w-md">Institutional Grade Subject Matrix & Enrollment Verification</p>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="px-4 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2.5 shadow-sm">
                              <ShieldCheck className="w-4 h-4 text-emerald-500" />
                              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Verified Active</span>
                         </div>
                    </div>
                </div>
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#2a6df4]/5 rounded-full blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Enrollment Detail */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Primary Enrollment Card */}
                    <div className="bg-surface rounded-2xl shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] overflow-hidden">
                        <div className="px-8 py-6 border-b border-[#f1f3f9] flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#f1f3f9] flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-[#2a6df4]" />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Academic Hub</h3>
                                <p className="text-xs text-content-muted font-medium">Standard Enrollment</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                             <div className="space-y-1">
                                 <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Offering Name</p>
                                 <h4 className="text-xl font-bold text-[#1a3d8a] tracking-tight">{enrollment.offeringName}</h4>
                             </div>

                             <div className="h-px bg-[#f1f3f9] w-full"></div>

                             <div className="grid grid-cols-1 gap-4">
                                  <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-300" />
                                            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Academic Year</span>
                                       </div>
                                       <span className="text-[10px] font-bold text-[#181c20] bg-[#f7f9ff] px-2.5 py-1 rounded-md">2024-25 CYCLE</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-300" />
                                            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Status Code</span>
                                       </div>
                                       <span className="text-[10px] font-bold text-emerald-600 uppercase">ACTIVE_REGULAR</span>
                                  </div>
                             </div>
                        </div>
                    </div>

                    {/* Stats Widget */}
                    <div className="bg-[#181c20] rounded-2xl p-8 relative overflow-hidden group">
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Target className="w-4 h-4 text-[#2a6df4]" />
                                    <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Subject Matrix</h3>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold text-white tracking-tighter">{subjects.length}</span>
                                    <span className="text-[10px] font-bold text-white/40 uppercase">Units</span>
                                </div>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-surface/5 flex items-center justify-center group-hover:bg-[#2a6df4] group-hover:rotate-6 transition-all duration-500">
                                <BookOpen className="w-8 h-8 text-[#2a6df4] group-hover:text-white" />
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 text-6xl font-black text-white/5 italic select-none pointer-events-none">MAP</div>
                    </div>
                </div>

                {/* Right Column: Knowledge Matrix */}
                <div className="lg:col-span-8 space-y-8">
                     <div className="bg-surface rounded-2xl shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] overflow-hidden">
                        <div className="px-8 py-6 border-b border-[#f1f3f9] flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#f1f3f9] flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-[#2a6df4]" />
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Intellectual Mapping</h3>
                                    <p className="text-xs text-content-muted font-medium">Authorized Subject Registry</p>
                                </div>
                            </div>
                            <span className="px-4 py-1.5 bg-[#f7f9ff] text-[#0054d1] text-[10px] font-bold rounded-lg uppercase tracking-widest border border-[#dae2ff]">
                                {subjects.length} Total Units
                            </span>
                        </div>

                        <div className="p-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {subjects.map((subject, idx) => (
                                     <div key={idx} className="p-6 rounded-2xl border border-[#f1f3f9] hover:bg-[#f7f9ff] hover:border-[#dae2ff] transition-all group flex items-center gap-5">
                                          <div className="w-12 h-12 rounded-xl bg-surface border border-[#f1f3f9] flex items-center justify-center font-bold text-[#2a6df4] shadow-sm group-hover:bg-[#0054d1] group-hover:text-white transition-all">
                                              {subject.subjectName?.[0] || 'S'}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                               <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                                        subject.isOptional ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                                    }`}>
                                                        {subject.isOptional ? 'Elective' : 'Core Unit'}
                                                    </span>
                                               </div>
                                               <h4 className="text-sm font-bold text-[#181c20] truncate group-hover:text-[#0054d1] transition-colors">
                                                   {subject.subjectName}
                                               </h4>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-slate-200 group-hover:translate-x-1 group-hover:text-[#2a6df4] transition-all" />
                                     </div>
                                 ))}

                                 {subjects.length === 0 && (
                                     <div className="col-span-full py-20 text-center">
                                          <div className="w-20 h-20 bg-[#f7f9ff] rounded-full flex items-center justify-center mx-auto mb-6">
                                               <BookMarked className="w-10 h-10 text-slate-200" />
                                          </div>
                                          <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest">Knowledge Matrix Empty</p>
                                     </div>
                                 )}
                             </div>
                        </div>
                     </div>

                     {/* Policy Info */}
                     <div className="bg-[#f0f4ff] rounded-2xl p-8 flex items-center gap-8 relative overflow-hidden group">
                         <div className="w-14 h-14 bg-surface rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center shrink-0 border border-indigo-50 relative z-10 transition-transform group-hover:rotate-6">
                             <Inbox className="w-7 h-7 text-[#0054d1]" />
                         </div>
                         <div className="relative z-10">
                             <h4 className="text-sm font-bold text-[#1a3d8a] mb-1">Infrastructure Policy Awareness</h4>
                             <p className="text-[11px] text-[#424655] font-medium leading-relaxed max-w-xl opacity-80">
                                 Academic nodes are managed by the institutional gateway. Attendance and performance metrics are strictly scoped to these registered subjects.
                             </p>
                         </div>
                         <div className="absolute -top-12 -right-12 w-32 h-32 bg-surface/40 rounded-full blur-2xl"></div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default MyAcademicsPage;
