import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { examService, type ExamSchedule } from '../../../api/examService';
import { academicService } from '../../../api/academicService';
import { studentDashboardService } from '../../../api/studentDashboardService';
import { Calendar, Clock, MapPin, Loader2, BookOpen, AlertCircle, CalendarRange } from 'lucide-react';
import toast from 'react-hot-toast';

interface EnrichedSchedule extends ExamSchedule {
    subjectName?: string;
}

export default function MyExamsPage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState<EnrichedSchedule[]>([]);

    useEffect(() => {
        if (user?.email && user?.tenantId) {
            fetchExams();
        }
    }, [user]);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const { enrollment } = await studentDashboardService.getStudentContext(user!.email!, user!.tenantId!);
            if (!enrollment?.offeringId) {
                setLoading(false);
                return;
            }

            // Fetch subjects map
            const subjectsRes = await academicService.getOfferingSubjects(enrollment.offeringId);
            const subjectsMap: Record<string, string> = {};
            if (subjectsRes.status === 'SUCCESS') {
                subjectsRes.apiData.forEach((sub: any) => {
                    subjectsMap[sub.subjectId] = sub.subjectName;
                });
            }

            // Fetch exam schedules
            const schedulesData = await examService.getSchedulesByOffering(enrollment.offeringId, user!.tenantId!);
            
            // Enrich with subject names and sort by date
            const enriched: EnrichedSchedule[] = (schedulesData || [])
                .map((sch: ExamSchedule) => ({
                    ...sch,
                    subjectName: subjectsMap[sch.subjectId] || 'Unknown Subject'
                }))
                .sort((a: EnrichedSchedule, b: EnrichedSchedule) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

            setSchedules(enriched);
        } catch (err) {
            toast.error("Failed to load exam schedules");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
                <p className="text-content-muted font-bold uppercase tracking-widest text-[10px]">Loading Exam Timetable...</p>
            </div>
        );
    }

    // Group exams by upcoming vs past
    const today = new Date().toISOString().split('T')[0];
    const upcoming = schedules.filter(s => s.examDate >= today);
    const past = schedules.filter(s => s.examDate < today);

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700 px-4 lg:px-0">
            {/* Page Header Block */}
            <div className="bg-[#f1f3f9] rounded-2xl p-8 md:p-10 relative overflow-hidden mb-10">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <span className="text-[10px] font-semibold text-[#3c5ba9] uppercase tracking-widest mb-2 block">Academic Assessment</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-[#1a3d8a] tracking-tight">My Exams</h1>
                        <p className="text-sm text-[#424655] mt-1 max-w-md">View your examination timetable and schedule</p>
                    </div>
                    <div className="flex bg-surface px-6 py-4 rounded-xl border border-border shadow-sm items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#dae2ff] flex items-center justify-center text-[#0054d1]">
                            <CalendarRange className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider leading-none">Total Exams</p>
                            <p className="text-xl font-black text-[#181c20] mt-1">{schedules.length}</p>
                        </div>
                    </div>
                </div>
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#2a6df4]/5 rounded-full blur-3xl"></div>
            </div>

            {schedules.length === 0 ? (
                <div className="bg-surface rounded-2xl p-20 text-center shadow-sm">
                    <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-content-primary">No Exams Scheduled</h3>
                    <p className="text-sm text-content-muted mt-2">There are currently no exams scheduled for your class.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {upcoming.length > 0 && (
                        <div>
                            <h2 className="text-sm font-black text-content-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                Upcoming Exams
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcoming.map((schedule) => (
                                    <div key={schedule.id} className="bg-surface rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                                <Calendar className="w-6 h-6" />
                                            </div>
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                                {new Date(schedule.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-content-primary mb-1 line-clamp-1" title={schedule.subjectName}>
                                            {schedule.subjectName}
                                        </h3>
                                        
                                        <div className="space-y-2 mt-6">
                                            <div className="flex items-center text-sm text-content-secondary gap-3">
                                                <Clock className="w-4 h-4 text-content-muted" />
                                                <span className="font-medium">{schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-content-secondary gap-3">
                                                <MapPin className="w-4 h-4 text-content-muted" />
                                                <span className="font-medium">{schedule.roomNumber || 'TBA'}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-content-secondary gap-3">
                                                <BookOpen className="w-4 h-4 text-content-muted" />
                                                <span className="font-medium">Max Marks: {schedule.maxMarks}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {past.length > 0 && (
                        <div className="pt-8 border-t border-border">
                            <h2 className="text-sm font-black text-content-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                                Past Exams
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75 hover:opacity-100 transition-opacity">
                                {past.map((schedule) => (
                                    <div key={schedule.id} className="bg-chrome rounded-2xl p-6 border border-border shadow-sm">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <span className="px-3 py-1 bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                                {new Date(schedule.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-content-secondary mb-1 line-clamp-1" title={schedule.subjectName}>
                                            {schedule.subjectName}
                                        </h3>
                                        <p className="text-xs font-semibold text-content-muted mt-2">
                                            {schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
