
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import { academicService } from '../../../../api/academicService';
import { assignmentService, type Assignment } from '../../../../api/assignmentService';
import {
    Plus,
    FileText,
    Loader2,
    Users,
    ChevronRight,
    GraduationCap,
    Clock,
    X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../../../../components/common/Modal';

const AssignmentManagementPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [offerings, setOfferings] = useState<any[]>([]);
    const [selectedOffering, setSelectedOffering] = useState<string>('');
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Assignment>>({
        title: '',
        description: '',
        dueDate: '',
        subjectId: ''
    });
    const [subjects, setSubjects] = useState<any[]>([]);

    useEffect(() => {
        fetchOfferings();
    }, [user?.tenantId]);

    useEffect(() => {
        if (selectedOffering) {
            fetchAssignments(selectedOffering);
            fetchSubjects(selectedOffering);
        }
    }, [selectedOffering]);

    const fetchOfferings = async () => {
        if (!user?.tenantId) return;
        try {
            const data = await academicService.getOfferingsByTenant(user.tenantId);
            setOfferings(data || []);
        } catch (error) {
            console.error("Failed to fetch offerings", error);
        }
    };

    const fetchSubjects = async (offeringId: string) => {
        try {
            const response = await academicService.getOfferingSubjects(offeringId);
            if (response.status === 'SUCCESS') {
                setSubjects(response.apiData || []);
            }
        } catch (error) {
            console.error("Failed to fetch subjects", error);
        }
    };

    const fetchAssignments = async (offeringId: string) => {
        setLoading(true);
        try {
            const data = await assignmentService.getAssignmentsByOffering(offeringId);
            setAssignments(data.apiData || []);
        } catch (error) {
            console.error("Failed to fetch assignments", error);
            toast.error("Failed to load assignments");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.tenantId || !selectedOffering) return;

        try {
            const payload: Assignment = {
                tenantId: user.tenantId,
                offeringId: selectedOffering,
                title: formData.title!,
                description: formData.description!,
                dueDate: formData.dueDate!,
                subjectId: formData.subjectId || undefined,
                createdBy: user.id
            };
            await assignmentService.createAssignment(payload);
            toast.success("Assignment created successfully");
            setIsModalOpen(false);
            fetchAssignments(selectedOffering);
            setFormData({ title: '', description: '', dueDate: '', subjectId: '' });
        } catch (error) {
            console.error("Failed to create assignment", error);
            toast.error("Failed to create assignment");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary">Assignment Management</h1>
                    <p className="text-content-secondary">Create and track class assignments</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!selectedOffering}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                    New Assignment
                </button>
            </div>

            {/* Selection Bar */}
            <div className="bg-surface p-4 rounded-xl shadow-sm border border-border grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-content-secondary mb-1 uppercase tracking-wider">Select Class</label>
                    <select
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-chrome"
                        value={selectedOffering}
                        onChange={(e) => setSelectedOffering(e.target.value)}
                    >
                        <option value="">-- Choose Class --</option>
                        {offerings.map(o => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Assignments List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!selectedOffering ? (
                    <div className="col-span-full py-12 text-center text-content-muted bg-surface rounded-xl border border-dashed border-border">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p>Select a class to view assignments</p>
                    </div>
                ) : loading ? (
                    <div className="col-span-full py-12 text-center text-content-secondary">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                        <p>Loading assignments...</p>
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-content-secondary bg-surface rounded-xl border border-border">
                        <p>No assignments found for this class.</p>
                    </div>
                ) : (
                    assignments.map((assignment) => (
                        <div key={assignment.id} className="bg-surface p-5 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${new Date(assignment.dueDate) < new Date() ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                    {new Date(assignment.dueDate) < new Date() ? 'Due' : 'Active'}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-content-primary mb-1">{assignment.title}</h3>
                            <p className="text-sm text-content-secondary line-clamp-2 mb-4">{assignment.description}</p>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-xs text-content-secondary px-3 py-2 bg-chrome rounded-lg">
                                    <Clock className="w-3 h-3" />
                                    <span>Due: {new Date(assignment.dueDate).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-content-secondary px-3 py-2 bg-chrome rounded-lg">
                                    <GraduationCap className="w-3 h-3" />
                                    <span>Subject: {subjects.find(s => s.id === assignment.subjectId)?.subjectName || 'General'}</span>
                                </div>
                            </div>

                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-content-primary hover:bg-chrome transition-colors">
                                <Users className="w-4 h-4" />
                                View Submissions
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="New Assignment"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-lg font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="assignment-form"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 font-semibold flex items-center justify-center"
                        >
                            Create Assignment
                        </button>
                    </>
                }
            >
                <form id="assignment-form" onSubmit={handleCreateAssignment} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-content-primary mb-1">Title</label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-2 bg-chrome border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-content-primary"
                            placeholder="e.g. Weekly Math Quiz"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-content-primary mb-1">Description</label>
                        <textarea
                            required
                            rows={4}
                            className="w-full px-4 py-2 bg-chrome border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-content-primary"
                            placeholder="Details about the assignment..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-content-primary mb-1">Subject</label>
                            <select
                                className="w-full px-4 py-2 bg-chrome border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-content-primary"
                                value={formData.subjectId}
                                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                            >
                                <option value="">General</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.subjectName || s.subject?.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-content-primary mb-1">Due Date</label>
                            <input
                                required
                                type="datetime-local"
                                className="w-full px-4 py-2 bg-chrome border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-content-primary"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AssignmentManagementPage;
