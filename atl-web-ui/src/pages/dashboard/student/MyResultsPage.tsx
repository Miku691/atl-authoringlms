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
        <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in px-4 lg:px-0">
            {/* Page Header - Professional & Airy */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Competency Matrix</span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Performance</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px] flex items-center gap-2 opacity-70">
                        Formal Assessment Registry & Outcome Analytics
                    </p>
                </div>
                <button
                    onClick={() => toast.success("Transcript processing...")}
                    className="flex bg-white px-8 py-5 rounded-[2.5rem] border border-slate-50 shadow-sm items-center gap-5 group hover:bg-slate-900 hover:text-white transition-all duration-500 hover:shadow-2xl active:scale-95"
                >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:rotate-12 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        <Download className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                    </div>
                    <div className="text-left">
                         <p className="text-[8px] font-black group-hover:text-slate-400 text-slate-400 uppercase tracking-widest leading-none mb-1 transition-colors">Manifest Export</p>
                         <p className="text-xs font-black group-hover:text-white text-slate-900 mt-1 uppercase italic tracking-tight transition-colors">Global Transcript</p>
                    </div>
                </button>
            </div>

            {/* Metrics Grid - Sophisticated KPI architecture */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-4 lg:px-0">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none italic">Lifecycle Load</h3>
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                             <BookOpen className="w-5 h-5 text-slate-300" />
                        </div>
                    </div>
                    <div className="space-y-3 relative z-10 transition-transform group-hover:translate-x-2 duration-700">
                        <p className="text-5xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">{results.length}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none opacity-60 italic">Assessments Indexed</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-slate-500/5 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-700"></div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-700 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none italic">Compliance Index</h3>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100/50 group-hover:scale-110 transition-transform">
                             <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                    <div className="space-y-3 relative z-10 transition-transform group-hover:translate-x-2 duration-700">
                        <p className="text-5xl font-black text-emerald-600 italic tracking-tighter uppercase leading-none">
                            {Math.round((results.filter(r => !r.isAbsent).length / (results.length || 1)) * 100)}%
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none opacity-60 italic">Participation Baseline</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-emerald-500/5 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-700"></div>
                </div>

                <div className="bg-[#0A0C10] p-10 rounded-[3rem] border border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-700">
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none italic font-bold">Node Status</h3>
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                             <Trophy className="w-5 h-5 text-amber-500" />
                        </div>
                    </div>
                    <div className="space-y-3 relative z-10 transition-transform group-hover:translate-x-2 duration-700">
                        <p className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Active</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none opacity-60 font-bold italic">Identity Synchronized</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-amber-500/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-700"></div>
                </div>
            </div>

            {/* Assessment Records - Premium Registry architecture */}
            <div className="space-y-8 max-w-5xl mx-auto md:mx-0 px-4 lg:px-0">
                 <div className="flex items-center justify-between px-6 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none">Transcript Inventory</h3>
                    </div>
                </div>

                {results.length === 0 ? (
                    <div className="py-40 text-center bg-white rounded-[4rem] border border-slate-50 shadow-sm relative overflow-hidden group/empty">
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="p-12 bg-slate-50 rounded-[3rem] mb-10 border border-slate-100 group-hover/empty:scale-110 group-hover/empty:rotate-12 transition-all duration-700 grayscale opacity-30">
                                <BookOpen className="w-16 h-16 text-slate-400" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic mb-4">Inventory Null</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic opacity-60">Academic assessments haven't been indexed for current cycle</p>
                        </div>
                        {/* Background Decoration */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[240px] font-black text-slate-50 italic select-none pointer-events-none uppercase opacity-50">NULL</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {results.map((res) => (
                            <div 
                                key={res.id}
                                className="bg-white p-10 lg:p-12 rounded-[4rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-700 group/item relative overflow-hidden"
                            >
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 relative z-10">
                                    <div className="flex items-center gap-10">
                                        <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-xl transition-all duration-500 group-hover/item:rotate-6 ${
                                            res.isAbsent ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-white text-slate-400 border border-slate-50 group-hover/item:bg-slate-900 group-hover/item:text-white group-hover/item:border-slate-900'
                                        }`}>
                                            {res.isAbsent ? <AlertCircle className="w-10 h-10" /> : <Trophy className="w-10 h-10" />}
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-5">
                                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] italic group-hover/item:text-indigo-400 transition-colors">Digital Assessment</span>
                                                <div className="w-1.5 h-1.5 bg-slate-100 rounded-full" />
                                                <span className="text-slate-300 font-black text-[10px] uppercase tracking-[0.3em] font-mono leading-none group-hover/item:text-slate-400 transition-colors">IDX: {res.examScheduleId?.substring(0,8)}</span>
                                            </div>
                                            <h3 className="text-3xl lg:text-4xl font-black text-slate-900 group-hover/item:text-indigo-600 transition-colors uppercase tracking-tighter italic leading-none">
                                                Assessment Block
                                            </h3>
                                            {res.remarks && (
                                                <div className="flex items-start gap-4 px-4 bg-slate-50/50 py-3 rounded-[1.5rem] mt-4 border border-slate-100 group-hover/item:bg-white transition-colors duration-500">
                                                    <div className="w-1 h-5 bg-indigo-500/20 rounded-full mt-0.5"></div>
                                                    <p className="text-slate-500 text-[11px] font-black italic tracking-tight opacity-70 uppercase leading-none mt-1">"{res.remarks}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 bg-slate-50/50 px-10 py-8 rounded-[3rem] border border-slate-100 group-hover/item:bg-white group-hover/item:shadow-2xl transition-all duration-700 w-full lg:w-auto relative overflow-hidden group/metrics">
                                        <div className="text-center min-w-[100px] relative z-20">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 italic">Raw Metric</p>
                                            <p className={`text-4xl font-black tracking-tighter italic leading-none uppercase ${res.isAbsent ? 'text-rose-500 font-black' : 'text-slate-900 translate-y-1'}`}>
                                                {res.isAbsent ? 'ABS' : res.marksObtained}
                                            </p>
                                        </div>
                                        <div className="h-16 w-px bg-slate-200 opacity-50 group-hover/item:bg-indigo-100 transition-colors" />
                                        <div className="text-center min-w-[100px] relative z-20">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 italic">Output</p>
                                            <div className="flex flex-col items-center gap-1">
                                                <p className={`text-[10px] font-black uppercase tracking-[0.3em] italic leading-none ${res.isAbsent ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    {res.isAbsent ? 'DEFICIT' : 'CLEARED'}
                                                </p>
                                                {!res.isAbsent && <div className="w-8 h-1 bg-emerald-500/20 rounded-full mt-2"></div>}
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center group-hover/item:bg-slate-900 group-hover/item:text-white transition-all duration-500 group-hover/metrics:translate-x-2">
                                            <ArrowRight className="w-6 h-6 text-slate-200 group-hover/item:text-white" />
                                        </div>
                                        
                                        {/* Abstract background highlight for metrics */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/30 opacity-0 group-hover/item:opacity-10 transition-opacity pointer-events-none"></div>
                                    </div>
                                </div>

                                {/* Row Background Decoration */}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[180px] font-black text-slate-50 italic opacity-0 group-hover/item:opacity-100 transition-all duration-700 pointer-events-none group-hover/item:-translate-x-12 select-none uppercase">
                                    0{results.indexOf(res) + 1}
                                </div>
                                <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-[60px] opacity-0 group-hover/item:opacity-100 transition-opacity duration-700"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
