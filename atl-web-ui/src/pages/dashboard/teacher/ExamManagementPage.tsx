import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { academicService, type ImsOffering, type Subject } from '../../../api/academicService';
import { examService, type ExamMaster, type ExamSchedule } from '../../../api/examService';
import { 
    Calendar, 
    Plus, 
    MoreHorizontal, 
    Loader2, 
    AlertCircle,
    Clock,
    FileText,
    Trophy
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExamManagementPage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<'exams' | 'schedule'>('exams');
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState<ExamMaster[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>('');
    
    // Schedule Tab State
    const [selectedExamId, setSelectedExamId] = useState<string>('');
    const [offerings, setOfferings] = useState<ImsOffering[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [schedules, setSchedules] = useState<ExamSchedule[]>([]);

    useEffect(() => {
        if (user?.tenantId) {
            fetchInitialData();
        }
    }, [user]);

    useEffect(() => {
        if (selectedSessionId) {
            fetchExams();
        }
    }, [selectedSessionId]);

    useEffect(() => {
        if (selectedExamId) {
            fetchSchedules();
        }
    }, [selectedExamId]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [sessionsRes, offeringsData, subjectsData] = await Promise.all([
                academicService.getSessionsByTenant(user!.tenantId!),
                academicService.getOfferingsByTenant(user!.tenantId!),
                academicService.getSubjects(user!.tenantId!)
            ]);
            setSessions(sessionsRes || []);
            setOfferings(offeringsData || []);
            setSubjects(subjectsData?.apiData || subjectsData || []);
            
            const current = sessionsRes?.find((s: any) => s.isCurrent);
            if (current) setSelectedSessionId(current.id);
        } catch (err) {
            toast.error("Failed to load global data");
        } finally {
            setLoading(false);
        }
    };

    const fetchExams = async () => {
        if (!selectedSessionId || !user?.tenantId) return;
        try {
            const data = await examService.getExamsBySession(user.tenantId, selectedSessionId);
            setExams(data || []);
            if (data?.length > 0 && !selectedExamId) {
                setSelectedExamId(data[0].id);
            }
        } catch (err) {
            toast.error("Failed to load Exams");
        }
    };

    const fetchSchedules = async () => {
        if (!selectedExamId) return;
        try {
            const data = await examService.getSchedulesByExam(selectedExamId);
            setSchedules(data || []);
        } catch (err) {
            toast.error("Failed to load schedules");
        }
    };

    const togglePublish = async (examId: string, current: boolean) => {
        try {
            await examService.publishResults(examId, !current);
            toast.success(current ? "Results retracted" : "Results published successfully!");
            fetchExams();
        } catch (err) {
            toast.error("Operation failed");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading Exam Center...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-center">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Academic Controller</p>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Exams & Results</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select 
                            value={selectedSessionId} 
                            onChange={(e) => setSelectedSessionId(e.target.value)}
                            className="bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-xs text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none flex-grow md:flex-grow-0"
                        >
                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            New Exam
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mt-8 flex gap-6 border-b border-slate-100">
                     <button 
                        onClick={() => setActiveTab('exams')}
                        className={`pb-4 px-2 font-black text-[10px] uppercase tracking-widest transition-all relative ${
                            activeTab === 'exams' ? 'text-slate-900' : 'text-slate-400 hover:text-indigo-600'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Exam List
                        </span>
                        {activeTab === 'exams' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('schedule')}
                        className={`pb-4 px-2 font-black text-[10px] uppercase tracking-widest transition-all relative ${
                            activeTab === 'schedule' ? 'text-slate-900' : 'text-slate-400 hover:text-indigo-600'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Scheduling
                        </span>
                        {activeTab === 'schedule' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />}
                    </button>
                </div>
            </div>

            {activeTab === 'exams' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                             <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No exams defined for this session.</p>
                        </div>
                    ) : exams.map(exam => (
                        <div key={exam.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                    exam.isPublished ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'
                                }`}>
                                    {exam.isPublished ? 'Published' : 'Draft'}
                                </span>
                                <button className="text-slate-400 hover:text-slate-900"><MoreHorizontal className="w-5 h-5" /></button>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1">{exam.examName}</h3>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">{exam.examType}</p>
                            
                            <div className="pt-4 border-t border-slate-50">
                                <button 
                                    onClick={() => togglePublish(exam.id, exam.isPublished)}
                                    className={`w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border-2 ${
                                        exam.isPublished 
                                        ? 'border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white' 
                                        : 'bg-slate-900 text-white border-slate-900 hover:bg-indigo-600 hover:border-indigo-600'
                                    }`}
                                >
                                    {exam.isPublished ? 'Retract Publication' : 'Publish Results'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Exam:</p>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                                {exams.map(e => (
                                    <button
                                        key={e.id}
                                        onClick={() => setSelectedExamId(e.id)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                            selectedExamId === e.id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                                        }`}
                                    >
                                        {e.examName}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button 
                            className="w-full md:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4" />
                            Add Schedule
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Class / Offering</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {schedules.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center">
                                                <AlertCircle className="w-10 h-10 text-slate-100 mx-auto mb-4" />
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No schedules found.</p>
                                            </td>
                                        </tr>
                                    ) : schedules.map(sch => (
                                        <tr key={sch.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <h4 className="font-bold text-slate-900 text-sm whitespace-nowrap">{offerings.find(o => o.id === sch.offeringId)?.name}</h4>
                                            </td>
                                            <td className="px-6 py-5 font-bold text-slate-600 text-xs">
                                                {subjects.find(s => s.id === sch.subjectId)?.title || 'Subject ID: ' + sch.subjectId}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs whitespace-nowrap">
                                                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                                    {new Date(sch.examDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-1 uppercase whitespace-nowrap">
                                                    <Clock className="w-3 h-3" />
                                                    {sch.startTime} - {sch.endTime}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase border border-emerald-100">Scheduled</span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="text-slate-300 hover:text-slate-900"><MoreHorizontal className="w-5 h-5" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
