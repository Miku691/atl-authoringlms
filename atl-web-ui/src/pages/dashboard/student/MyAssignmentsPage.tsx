
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
    FileCheck,
    ShieldCheck,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../../../components/common/Modal';

type TabType = 'PENDING' | 'SUBMITTED' | 'OVERDUE';

const MyAssignmentsPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [studentId, setStudentId] = useState<string>('');
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('PENDING');

    useEffect(() => {
        if (user?.email && user?.tenantId) {
            loadStudentData();
        }
    }, [user?.email, user?.tenantId]);

    const loadStudentData = async () => {
        setLoading(true);
        try {
            const { student } = await studentDashboardService.getStudentContext(user!.email!, user!.tenantId!);
            if (!student) { setLoading(false); return; }

            const sId = student.id;
            setStudentId(sId);

            const enrollments = await studentService.getStudentEnrollments(sId);
            const activeOffering = enrollments.apiData.find((e: any) => e.status === 'ACTIVE');

            if (activeOffering) {
                const assignData = await assignmentService.getAssignmentsByOffering(activeOffering.offeringId);
                setAssignments(assignData.apiData || []);
            }
        } catch (error) {
            console.error('Failed to load student data', error);
            toast.error('Failed to load assignments');
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
            toast.success('Assignment submitted successfully');
            setSelectedAssignment(null);
            setFile(null);
            loadStudentData();
        } catch (error) {
            console.error('Upload failed', error);
            toast.error('Submission failed');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#2a6df4]" />
            </div>
        );
    }

    const now = new Date();
    const overdueAssignments = assignments.filter(a => new Date(a.dueDate) < now);
    const pendingAssignments = assignments.filter(a => new Date(a.dueDate) >= now);
    // Backend doesn't currently differentiate submitted — show all active as pending
    const submittedAssignments: Assignment[] = [];

    const tabs: { id: TabType; label: string; count: number; color: string; activeBg: string; activeText: string }[] = [
        { id: 'PENDING',   label: 'Pending',   count: pendingAssignments.length,   color: 'text-[#9e3f00]', activeBg: 'bg-[#9e3f00]', activeText: 'text-white' },
        { id: 'SUBMITTED', label: 'Submitted', count: submittedAssignments.length, color: 'text-[#0054d1]',  activeBg: 'bg-[#0054d1]',  activeText: 'text-white' },
        { id: 'OVERDUE',   label: 'Overdue',   count: overdueAssignments.length,   color: 'text-[#ba1a1a]', activeBg: 'bg-[#ba1a1a]', activeText: 'text-white' },
    ];

    const getVisibleAssignments = () => {
        switch (activeTab) {
            case 'PENDING':   return pendingAssignments;
            case 'SUBMITTED': return submittedAssignments;
            case 'OVERDUE':   return overdueAssignments;
        }
    };

    const visibleAssignments = getVisibleAssignments();

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">

            {/* ── Page Header ── */}
            <div className="rounded-2xl bg-[#f1f3f9] p-8 md:p-10 relative overflow-hidden">
                <div className="relative z-10">
                    <span className="text-[10px] font-semibold text-[#3c5ba9] uppercase tracking-widest">Academic Deliverables</span>
                    <h1 className="mt-2 text-3xl font-bold text-[#1a3d8a]">Assignments</h1>
                    <p className="text-sm text-[#424655] mt-1">Track and submit your academic tasks</p>
                </div>
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#2a6df4]/8 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* ── Status Tabs ── */}
            <div className="flex items-center gap-2 bg-surface rounded-2xl p-2 shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)]">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            activeTab === tab.id
                                ? `${tab.activeBg} ${tab.activeText} shadow-sm`
                                : `${tab.color} hover:bg-[#f7f9ff]`
                        }`}
                    >
                        {tab.label}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            activeTab === tab.id ? 'bg-surface/20 text-white' : 'bg-[#f1f3f9] text-[#64748b]'
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Assignments Grid ── */}
            {visibleAssignments.length === 0 ? (
                <div className="bg-surface rounded-2xl py-20 text-center shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] flex flex-col items-center">
                    <div className="w-14 h-14 bg-[#f1f3f9] rounded-2xl flex items-center justify-center mb-4">
                        <FileText className="w-7 h-7 text-[#c2c6d7]" />
                    </div>
                    <p className="text-base font-bold text-[#181c20]">
                        {activeTab === 'SUBMITTED' ? 'No submissions yet' : activeTab === 'OVERDUE' ? 'No overdue assignments' : 'All assignments completed!'}
                    </p>
                    <p className="text-sm text-[#64748b] mt-1">
                        {activeTab === 'PENDING' ? 'Great job keeping up with your coursework.' : 'Nothing here right now.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleAssignments.map((assignment) => {
                        const isOverdue = new Date(assignment.dueDate) < now;
                        return (
                            <div
                                key={assignment.id}
                                className="group bg-surface rounded-2xl shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(26,61,138,0.1)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden"
                            >
                                <div className="p-5 flex-1">
                                    {/* Status Badge + Icon */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                            isOverdue ? 'bg-[#ffdad6]' : 'bg-[#dae2ff]'
                                        }`}>
                                            <FileText className={`w-5 h-5 ${isOverdue ? 'text-[#ba1a1a]' : 'text-[#0054d1]'}`} />
                                        </div>
                                        <span className={`flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full ${
                                            isOverdue
                                                ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                                : 'bg-[#fff3ec] text-[#9e3f00]'
                                        }`}>
                                            {isOverdue ? (
                                                <><AlertCircle className="w-3 h-3" /> Overdue</>
                                            ) : (
                                                <><Clock className="w-3 h-3" /> Pending</>
                                            )}
                                        </span>
                                    </div>

                                    {/* Title & Description */}
                                    <h3 className="text-base font-bold text-[#181c20] leading-snug group-hover:text-[#0054d1] transition-colors line-clamp-2">
                                        {assignment.title}
                                    </h3>
                                    <p className="text-xs text-[#424655] mt-2 line-clamp-2 leading-relaxed">
                                        {assignment.description}
                                    </p>

                                    {/* Due Date */}
                                    <div className="mt-4 flex items-center gap-2 p-3 bg-[#f7f9ff] rounded-xl">
                                        <Calendar className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                                        <div>
                                            <p className="text-[9px] text-[#64748b] uppercase tracking-widest font-semibold">Due Date</p>
                                            <p className="text-xs font-semibold text-[#181c20]">
                                                {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="px-5 pb-5">
                                    <button
                                        onClick={() => setSelectedAssignment(assignment)}
                                        disabled={isOverdue}
                                        className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                                            isOverdue
                                                ? 'bg-[#f1f3f9] text-[#64748b] cursor-not-allowed opacity-60'
                                                : 'bg-gradient-to-br from-[#0054d1] to-[#2a6df4] text-white hover:opacity-90 shadow-md hover:shadow-lg'
                                        }`}
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        {isOverdue ? 'Submission Closed' : 'Submit Assignment'}
                                        {!isOverdue && <ArrowRight className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Submission Modal ── */}
            <Modal
                isOpen={!!selectedAssignment}
                onClose={() => { setSelectedAssignment(null); setFile(null); }}
                title={selectedAssignment?.title ?? ''}
                subtitle={selectedAssignment ? `ID: ${selectedAssignment.id?.substring(0, 8)}` : undefined}
                icon={<Upload size={18} />}
                iconVariant="info"
                size="lg"
            >
                <form onSubmit={handleFileUpload} className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-widest">Upload File</p>
                        <div className={`relative border-2 border-dashed rounded-xl p-10 transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                            file ? 'border-[#2a6df4] bg-[#f0f4ff]' : 'border-[#e0e2e8] bg-[#f7f9ff] hover:border-[#2a6df4] hover:bg-surface'
                        }`}>
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            {file ? (
                                <div className="space-y-3">
                                    <div className="w-12 h-12 bg-[#2a6df4] rounded-xl flex items-center justify-center text-white mx-auto">
                                        <FileCheck className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-semibold text-[#181c20] truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-[#0054d1]">File selected — click to change</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="w-12 h-12 bg-[#f1f3f9] rounded-xl flex items-center justify-center text-[#c2c6d7] mx-auto">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-semibold text-[#181c20]">Click or drop file here</p>
                                    <p className="text-xs text-[#64748b]">PDF, DOCX, ZIP — Max 10MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!file || uploading}
                        className="w-full py-3 bg-gradient-to-br from-[#0054d1] to-[#2a6df4] text-white rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
                    >
                        {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <FileCheck className="w-4 h-4" />
                                Submit Assignment
                            </>
                        )}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default MyAssignmentsPage;
