import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { examService, type MarksRecord } from '../../../api/examService';
import { 
    Trophy, 
    ArrowRight, 
    Loader2, 
    CheckCircle2, 
    AlertCircle,
    Download,
    BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyResultsPage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<MarksRecord[]>([]);

    useEffect(() => {
        if (user?.tenantId && user?.studentId) {
            fetchResults();
        }
    }, [user]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const marksData = await examService.getResultsByStudent(user!.studentId!, user!.tenantId!);
            setResults(marksData || []);
        } catch (err) {
            toast.error("Failed to load academic records");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Generating Result Sheet...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-center">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Student Portal</p>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Academic Results</h1>
                        </div>
                    </div>

                    <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-indigo-600 transition-all">
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exams Attempted</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{results.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Presence</p>
                    <h3 className="text-3xl font-black text-emerald-600 mt-1">
                        {Math.round((results.filter(r => !r.isAbsent).length / (results.length || 1)) * 100)}%
                    </h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                    <h3 className="text-3xl font-black text-indigo-600 mt-1">Active</h3>
                </div>
            </div>

            {/* Individual Results */}
            <div className="space-y-4 max-w-4xl">
                 <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Paper Records</h3>
                </div>

                {results.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-slate-900 font-bold uppercase tracking-widest text-sm">No Results Yet</h3>
                        <p className="text-slate-400 text-[10px] mt-1 uppercase font-bold tracking-tight">Your marks will appear here once published</p>
                    </div>
                ) : (
                    results.map((res) => (
                        <div 
                            key={res.id}
                            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm ${
                                        res.isAbsent ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'
                                    }`}>
                                        {res.isAbsent ? <AlertCircle className="w-7 h-7" /> : <CheckCircle2 className="w-7 h-7" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Mark-Sheet Entry</span>
                                            <div className="h-1 w-1 bg-slate-200 rounded-full" />
                                            <span className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">ID: {res.examScheduleId?.substring(0,8)}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                            Academic Assessment
                                        </h3>
                                        {res.remarks && (
                                            <p className="text-slate-500 text-[11px] mt-1 font-medium">{res.remarks}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 bg-slate-50 px-6 py-4 rounded-xl border border-slate-100 w-full md:w-auto">
                                    <div className="text-center min-w-[60px]">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Marks</p>
                                        <p className={`text-xl font-black tracking-tighter ${res.isAbsent ? 'text-rose-500' : 'text-slate-900'}`}>
                                            {res.isAbsent ? 'ABS' : res.marksObtained}
                                        </p>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200" />
                                    <div className="text-center min-w-[60px]">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Outcome</p>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${res.isAbsent ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {res.isAbsent ? 'FAIL' : 'PASS'}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all ml-2" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
