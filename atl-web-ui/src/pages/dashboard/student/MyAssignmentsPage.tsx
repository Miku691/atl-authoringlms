
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { studentDashboardService } from '../../../api/studentDashboardService';
import { studentService } from '../../../api/studentService';
import { assignmentService, type Assignment } from '../../../api/assignmentService';
import {
    FileText,
    Clock,
    AlertCircle,
    Loader2,
    Calendar,
    Upload,
    ArrowRight,
    X,
    FileCheck,
    ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const MyAssignmentsPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [studentId, setStudentId] = useState<string>('');
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (user?.email && user?.tenantId) {
            loadStudentData();
        }
    }, [user?.email, user?.tenantId]);

    const loadStudentData = async () => {
        setLoading(true);
        try {
            const { student } = await studentDashboardService.getStudentContext(user!.email!, user!.tenantId!);

            if (!student) {
                setLoading(false);
                return;
            }

            const sId = student.id;
            setStudentId(sId);

            // Get enrollment to find active offering
            const enrollments = await studentService.getStudentEnrollments(sId);
            const activeOffering = enrollments.apiData.find((e: any) => e.status === 'ACTIVE');

            if (activeOffering) {
                const assignData = await assignmentService.getAssignmentsByOffering(activeOffering.offeringId);
                setAssignments(assignData.apiData || []);

                // For now, simple submissions fetch logic
                // Enhancement: backend should return submission status in assignData
            }
        } catch (error) {
            console.error("Failed to load student data", error);
            toast.error("Failed to load assignments");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !selectedAssignment || !studentId) return;

        setUploading(true);
        try {
            await assignmentService.submitAssignment(selectedAssignment.id!, studentId, file);
            toast.success("Assignment submitted successfully");
            setSelectedAssignment(null);
            setFile(null);
            loadStudentData();
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Submission failed");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
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
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Deliverables</span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Course Work</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px] flex items-center gap-2 opacity-70">
                        Institutional Grade Task Management & Submission Portal
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-8 py-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all duration-500">
                        <FileText className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Backlog</p>
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none italic">{assignments.length} Total Units</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {assignments.length === 0 ? (
                    <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm flex flex-col items-center justify-center group hover:bg-slate-50 transition-all duration-500">
                        <div className="p-10 bg-slate-50 rounded-[2.5rem] mb-8 grayscale group-hover:grayscale-0 group-hover:bg-white transition-all duration-500 border border-slate-50 group-hover:border-slate-100">
                            <FileText className="w-16 h-16 text-slate-200" />
                        </div>
                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Operational Silence</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4 max-w-xs leading-relaxed opacity-60">No academic deliverables detected in the current course cycle.</p>
                    </div>
                ) : (
                    assignments.map((assignment) => {
                        const isOverdue = new Date(assignment.dueDate) < new Date();
                        return (
                            <div key={assignment.id} className="group bg-white rounded-[3rem] shadow-sm border border-slate-50 hover:shadow-2xl transition-all duration-500 flex flex-col relative overflow-hidden">
                                <div className="p-10 flex-1 relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-sm border border-slate-100 group-hover:border-indigo-500">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        {isOverdue ? (
                                            <span className="flex items-center gap-2 text-[8px] font-black bg-rose-50 text-rose-600 px-4 py-2 rounded-full border border-rose-100 uppercase tracking-widest italic shadow-sm shadow-rose-100">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                Past Lifecycle
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2 text-[8px] font-black bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full border border-emerald-100 uppercase tracking-widest italic shadow-sm shadow-emerald-100">
                                                <Clock className="w-3.5 h-3.5" />
                                                Active State
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter italic uppercase leading-none group-hover:text-indigo-600 transition-colors">
                                        {assignment.title}
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10 line-clamp-2 leading-relaxed opacity-70 italic">
                                        {assignment.description}
                                    </p>

                                    <div className="space-y-4 pt-10 border-t border-slate-50">
                                        <div className="flex items-center gap-5 text-slate-600 bg-slate-50/50 p-5 rounded-[1.5rem] border border-slate-50 group-hover:bg-indigo-50/50 group-hover:border-indigo-50 transition-colors">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:text-indigo-600 transition-colors">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 italic">Deadline Node</p>
                                                <p className="text-[11px] font-black uppercase tracking-tight italic text-slate-800">{new Date(assignment.dueDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50/50 border-t border-slate-50 group-hover:bg-white transition-colors duration-500">
                                    <button
                                        onClick={() => setSelectedAssignment(assignment)}
                                        disabled={isOverdue}
                                        className="w-full py-5 bg-white border border-slate-100 rounded-[1.5rem] text-[10px] font-black text-slate-900 uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-500 flex items-center justify-center gap-3 shadow-sm hover:shadow-xl disabled:opacity-30 disabled:grayscale group/btn"
                                    >
                                        <Upload className="w-4 h-4 group-hover/btn:-translate-y-1 transition-transform" />
                                        Initialize Submission
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                                    </button>
                                </div>

                                {/* Abstract Background ID */}
                                <div className="absolute -right-6 -bottom-6 text-[80px] font-black text-slate-50 opacity-0 group-hover:opacity-100 transition-all italic leading-none pointer-events-none uppercase">
                                    TASK
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Premium Submission Modal */}
            {selectedAssignment && (
                <div className="fixed inset-0 bg-[#0A0C10]/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-fade-in">
                    <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-premium-slide relative">
                        <button
                            onClick={() => { setSelectedAssignment(null); setFile(null); }}
                            className="absolute right-10 top-10 p-4 hover:bg-slate-100 rounded-[1.5rem] transition-all text-slate-400 hover:text-slate-900 z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex flex-col md:flex-row h-full">
                            {/* Left Side: Context - Premium Dark */}
                            <div className="w-full md:w-2/5 bg-[#0A0C10] p-12 text-white flex flex-col justify-between relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-10 shadow-lg">
                                        <Upload className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 opacity-60">Submitting For</p>
                                    <h2 className="text-3xl font-black italic tracking-tighter leading-tight uppercase mb-6 uppercase">
                                        {selectedAssignment.title}
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed opacity-80 italic">
                                        Task ID: {selectedAssignment.id?.substring(0, 8)} Verification required upon upload.
                                    </p>
                                </div>

                                <div className="pt-10 border-t border-white/5 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest italic text-indigo-300">Encrypted Gateway Port</span>
                                    </div>
                                </div>

                                {/* Decorative Blur */}
                                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px]"></div>
                            </div>

                            {/* Right Side: Action Portal */}
                            <div className="w-full md:w-3/5 p-12 lg:p-16 flex flex-col justify-center bg-white">
                                <form onSubmit={handleFileUpload} className="space-y-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] italic">Digital Payload</h4>
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Max 10MB Density</span>
                                        </div>
                                        
                                        <div className={`relative border-2 border-dashed rounded-[2.5rem] p-14 transition-all cursor-pointer group flex flex-col items-center justify-center text-center ${file ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/30 hover:border-indigo-600 hover:bg-white'
                                            }`}>
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            />
                                            {file ? (
                                                <div className="space-y-4">
                                                    <div className="w-20 h-20 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-emerald-100 mx-auto group-hover:rotate-6 transition-transform">
                                                        <FileCheck className="w-10 h-10" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900 truncate max-w-[200px] mb-1 italic uppercase">{file.name}</p>
                                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic opacity-80">Payload Detected • Click to cycle</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-slate-200 shadow-sm border border-slate-100 group-hover:scale-110 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all duration-500">
                                                        <Upload className="w-10 h-10" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1 italic">Ingest File System</p>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-60">PDF, DOCX, ZIP Verified Infrastructure</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!file || uploading}
                                        className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-100 transition-all duration-500 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-4 transform active:scale-95 group/submit"
                                    >
                                        {uploading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <FileCheck className="w-5 h-5 group-hover/submit:scale-110 transition-transform" />
                                                <span>Execute Final Handover</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyAssignmentsPage;
