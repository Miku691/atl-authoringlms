
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
    FileCheck
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
                    <p className="text-gray-500">View and submit your course work</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                        <h3 className="text-lg font-semibold text-gray-900">No Assignments Yet</h3>
                        <p className="text-gray-500">Your instructors haven't posted any assignments for your class.</p>
                    </div>
                ) : (
                    assignments.map((assignment) => {
                        const isOverdue = new Date(assignment.dueDate) < new Date();
                        return (
                            <div key={assignment.id} className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        {isOverdue ? (
                                            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold bg-red-50 text-red-600 px-2.5 py-1 rounded-full border border-red-100 italic">
                                                <AlertCircle className="w-3 h-3" />
                                                Overdue
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold bg-green-50 text-green-600 px-2.5 py-1 rounded-full border border-green-100">
                                                <Clock className="w-3 h-3" />
                                                Active
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{assignment.title}</h3>
                                    <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed">{assignment.description}</p>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                            <Calendar className="w-4 h-4 text-indigo-500" />
                                            <div>
                                                <p className="font-semibold">Due By</p>
                                                <p>{new Date(assignment.dueDate).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                                    <button
                                        onClick={() => setSelectedAssignment(assignment)}
                                        disabled={isOverdue}
                                        className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg disabled:opacity-50"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Submit Assignment
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Submission Modal */}
            {selectedAssignment && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
                        <div className="p-8 border-b border-gray-100 relative">
                            <button
                                onClick={() => { setSelectedAssignment(null); setFile(null); }}
                                className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Upload Task</h2>
                                    <p className="text-gray-500 font-medium">Submit your work for grading</p>
                                </div>
                            </div>

                            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                                <h4 className="text-sm font-bold text-indigo-900 mb-1">{selectedAssignment.title}</h4>
                                <p className="text-xs text-indigo-700 line-clamp-2">{selectedAssignment.description}</p>
                            </div>
                        </div>

                        <form onSubmit={handleFileUpload} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Attachment</label>
                                <div className={`relative border-2 border-dashed rounded-3xl p-10 transition-all cursor-pointer group ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                                    }`}>
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />
                                    <div className="text-center">
                                        {file ? (
                                            <div className="flex flex-col items-center">
                                                <FileCheck className="w-12 h-12 text-green-500 mb-2" />
                                                <p className="text-sm font-bold text-green-700 truncate max-w-full px-4">{file.name}</p>
                                                <p className="text-xs text-green-600">Click to change file</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <Upload className="w-12 h-12 text-gray-400 group-hover:text-indigo-500 mb-2 transition-colors" />
                                                <p className="text-sm font-bold text-gray-900">Click or drag file here</p>
                                                <p className="text-xs text-gray-500">PDF, DOCX, ZIP allowed (Max 10MB)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!file || uploading}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2 transform active:scale-95"
                            >
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileCheck className="w-5 h-5" />}
                                Final Submission
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyAssignmentsPage;
