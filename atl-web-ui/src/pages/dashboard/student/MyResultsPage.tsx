import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { examService, type MarksRecord } from '../../../api/examService';
import { 
    Trophy, 
    ArrowRight, 
    Loader2, 
    CheckCircle2, 
    Download,
    BookOpen,
    TrendingUp,
    Star,
    Award,
    Calendar
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell
} from 'recharts';
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
                <Loader2 className="w-8 h-8 animate-spin text-[#0054d1] mb-4" />
                <p className="text-content-muted font-bold uppercase tracking-widest text-[10px]">Generating Result Sheet...</p>
            </div>
        );
    }

    // Mock data for the chart since real semester-wise data might need a separate API
    const trendData = [
        { semester: 'Sem 1', gpa: 8.2 },
        { semester: 'Sem 2', gpa: 7.9 },
        { semester: 'Sem 3', gpa: 8.5 },
        { semester: 'Sem 4', gpa: 9.1 },
    ];

    const stats = [
        { label: 'Cumulative GPA', value: '8.42', icon: Trophy, color: 'text-amber-500' },
        { label: 'This Semester', value: '9.10', icon: TrendingUp, color: 'text-[#0054d1]' },
        { label: 'Total Credits', value: '112', icon: Star, color: 'text-emerald-600' }
    ];

    const getGradeInfo = (record: MarksRecord) => {
        if (record.isAbsent) return { label: 'F', color: 'bg-[#ffdad6] text-[#ba1a1a]' };
        
        const label = record.gradeLabel || 'N/A';
        
        if (label === 'O') return { label, color: 'bg-[#dae2ff] text-[#0054d1]' };
        if (label === 'A+') return { label, color: 'bg-[#eef2ff] text-[#2a6df4]' };
        if (label === 'A') return { label, color: 'bg-[#f0f4ff] text-[#3c5ba9]' };
        if (label === 'B+') return { label, color: 'bg-[#fff3ec] text-[#9e3f00]' };
        if (label === 'B') return { label, color: 'bg-amber-50 text-amber-700' };
        if (label === 'F' || label === 'Fail') return { label, color: 'bg-[#ffdad6] text-[#ba1a1a]' };
        
        return { label, color: 'bg-chrome text-content-secondary' };
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700 px-4 lg:px-0">
            {/* Page Header Block */}
            <div className="bg-[#f1f3f9] rounded-2xl p-8 md:p-10 relative overflow-hidden mb-10">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <span className="text-[10px] font-semibold text-[#3c5ba9] uppercase tracking-widest mb-2 block">Academic Performance</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-[#1a3d8a] tracking-tight">My Results</h1>
                        <p className="text-sm text-[#424655] mt-1 max-w-md">B.Tech Computer Science — Semester 4 Outcome</p>
                    </div>
                    <button
                        onClick={() => toast.success("Transcript processing...")}
                        className="flex bg-surface px-6 py-4 rounded-xl border border-border shadow-sm items-center gap-4 group hover:shadow-md transition-all active:scale-95"
                    >
                        <div className="w-10 h-10 rounded-lg bg-[#f1f3f9] flex items-center justify-center text-[#2a6df4] group-hover:bg-[#0054d1] group-hover:text-white transition-all">
                            <Download className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider leading-none">Export Transcripts</p>
                            <p className="text-xs font-bold text-[#181c20] mt-1">Digital Manifest</p>
                        </div>
                    </button>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#2a6df4]/5 rounded-full blur-3xl"></div>
            </div>

            {/* GPA Stats Block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-surface p-8 rounded-2xl shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] flex items-center justify-between group hover:shadow-xl transition-all">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">{stat.label}</p>
                            <p className="text-4xl font-bold text-[#1a3d8a] tracking-tight">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-[#f7f9ff] flex items-center justify-center ${stat.color} group-hover:scale-110 transition-all`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Subject Results Table */}
                <div className="lg:col-span-8">
                    <div className="bg-surface rounded-2xl shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] overflow-hidden">
                        <div className="px-8 py-6 border-b border-[#f1f3f9] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#f1f3f9] flex items-center justify-center">
                                    <Award className="w-5 h-5 text-[#2a6df4]" />
                                </div>
                                <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Subject Results</h3>
                            </div>
                        </div>

                        {results.length === 0 ? (
                            <div className="p-20 text-center">
                                <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-sm font-medium text-content-muted uppercase tracking-widest">No results indexed for this cycle</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-[#f7f9ff] text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
                                            <th className="px-8 py-5">Subject</th>
                                            <th className="px-6 py-5 text-center">Marks</th>
                                            <th className="px-6 py-5 text-center">Grade</th>
                                            <th className="px-8 py-5 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f1f3f9]">
                                        {results.map((res) => {
                                            const grade = getGradeInfo(res);
                                            return (
                                                <tr key={res.id} className="hover:bg-[#f7f9ff] transition-all group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 rounded-lg bg-[#f1f3f9] flex items-center justify-center group-hover:bg-[#0054d1] group-hover:text-white transition-all text-xs font-bold text-[#3c5ba9]">
                                                                {results.indexOf(res) + 1}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-[#181c20]">Assessment Block</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                     <Calendar className="w-3 h-3 text-[#2a6df4]" />
                                                                     <span className="text-[10px] font-medium text-[#64748b]">IDX: {res.examScheduleId?.substring(0,8)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 text-center">
                                                        <span className="text-base font-bold text-[#1a3d8a]">
                                                            {res.isAbsent ? 'ABS' : res.marksObtained}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-6 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className={`inline-flex min-w-[32px] justify-center px-2 py-1 rounded-md text-xs font-bold ${grade.color}`}>
                                                                {grade.label}
                                                            </span>
                                                            {res.gradePoint != null && (
                                                                <span className="text-[9px] font-bold text-[#64748b]">GP: {res.gradePoint}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                                            res.isAbsent ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-emerald-50 text-emerald-700'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${res.isAbsent ? 'bg-[#ba1a1a]' : 'bg-emerald-500'}`} />
                                                            {res.isAbsent ? 'DEFICIT' : 'CLEARED'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {/* Grade Legend */}
                        <div className="px-8 py-6 bg-[#f7f9ff] border-t border-[#f1f3f9] flex flex-wrap gap-4">
                            <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-widest mr-2">Grade Scale</span>
                            {[
                                { l: 'O', val: '10', c: 'bg-[#dae2ff] text-[#0054d1]' },
                                { l: 'A+', val: '9-9.9', c: 'bg-[#eef2ff] text-[#2a6df4]' },
                                { l: 'A', val: '8-8.9', c: 'bg-[#f0f4ff] text-[#3c5ba9]' },
                                { l: 'B+', val: '7-7.9', c: 'bg-[#fff3ec] text-[#9e3f00]' },
                                { l: 'B', val: '6-6.9', c: 'bg-amber-50 text-amber-700' },
                                { l: 'F', val: 'Fail', c: 'bg-[#ffdad6] text-[#ba1a1a]' }
                            ].map(grade => (
                                <div key={grade.l} className="flex items-center gap-1.5">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold ${grade.c}`}>{grade.l}</span>
                                    <span className="text-[10px] font-medium text-[#64748b]">{grade.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Performance Chart Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface rounded-2xl p-8 shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] h-full">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-1.5 h-6 bg-[#0054d1] rounded-full"></div>
                            <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">GPA Progression</h3>
                        </div>
                        
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f9" />
                                    <XAxis 
                                        dataKey="semester" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        hide 
                                        domain={[0, 10]} 
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#f7f9ff', radius: 12 }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px -4px rgba(26,61,138,0.1)' }}
                                        labelStyle={{ fontWeight: 800, color: '#1a3d8a', marginBottom: '4px' }}
                                    />
                                    <Bar dataKey="gpa" radius={[12, 12, 12, 12]} barSize={40}>
                                        {trendData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={index === trendData.length - 1 ? '#0054d1' : '#dae2ff'} 
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-[#f1f3f9] text-center">
                            <p className="text-[10px] text-content-muted font-medium mb-1 uppercase tracking-wide">Next Target</p>
                            <p className="text-sm font-bold text-[#181c20]">Aim for 9.50 GPA to maintain Dean's List</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
