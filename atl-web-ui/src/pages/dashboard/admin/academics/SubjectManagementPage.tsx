import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/store';
import { academicService, type Subject } from '../../../../api/academicService';
import { Plus, Trash2, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

const SubjectManagementPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSubject, setNewSubject] = useState({
        code: '',
        title: '',
        subjectType: 'THEORY',
        programId: '',
        totalExamMarks: 100
    });
    const [isCreating, setIsCreating] = useState(false);
    const [programs, setPrograms] = useState<any[]>([]);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchSubjects();
        fetchPrograms();
    }, [user?.tenantId]);

    const fetchPrograms = async () => {
        if (!user?.tenantId) return;
        try {
            const data = await academicService.getPrograms(user.tenantId);
            setPrograms(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSubjects = async () => {
        if (!user?.tenantId) return;
        setLoading(true);
        try {
            const data = await academicService.getSubjects(user.tenantId);
            setSubjects(data);
        } catch (error) {
            console.error("Failed to fetch subjects", error);
            toast.error("Failed to load subjects");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.tenantId) return;

        setIsCreating(true);
        try {
            await academicService.createSubject({ ...newSubject, tenantId: user.tenantId });
            toast.success("Subject created successfully");
            setIsCreateModalOpen(false);
            setNewSubject({
                code: '',
                title: '',
                subjectType: 'THEORY',
                programId: '',
                totalExamMarks: 100
            });
            fetchSubjects();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to create subject");
        } finally {
            setIsCreating(false);
        }
    };

    const confirmDelete = (subject: Subject) => {
        setSubjectToDelete(subject);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteSubject = async () => {
        if (!user?.tenantId || !subjectToDelete) return;

        setIsDeleting(true);
        try {
            await academicService.deleteSubject(subjectToDelete.id, user.tenantId);
            toast.success("Subject deleted successfully");
            setIsDeleteModalOpen(false);
            setSubjectToDelete(null);
            fetchSubjects();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to delete subject");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredSubjects = subjects.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Subject Master</h1>
                    <p className="text-sm text-gray-500">Manage the master list of subjects for your institute.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Subject
                </button>
            </div>

            {/* Search and List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search subjects by code or title..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3 font-medium">Code</th>
                                <th className="px-6 py-3 font-medium">Title</th>
                                <th className="px-6 py-3 font-medium">Type</th>
                                <th className="px-6 py-3 font-medium">Marks</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading subjects...</td>
                                </tr>
                            ) : filteredSubjects.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No subjects found. Add new subjects to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredSubjects.map((subject) => (
                                    <tr key={subject.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{subject.code}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{subject.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${subject.subjectType === 'THEORY' ? 'bg-blue-100 text-blue-800' :
                                                subject.subjectType === 'PRACTICAL' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {subject.subjectType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {subject.totalExamMarks || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => confirmDelete(subject)}
                                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                                title="Delete Subject"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Add New Subject</h2>
                        <form onSubmit={handleCreateSubject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. MATH101"
                                    value={newSubject.code}
                                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. Mathematics"
                                    value={newSubject.title}
                                    onChange={(e) => setNewSubject({ ...newSubject, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newSubject.programId}
                                    onChange={(e) => setNewSubject({ ...newSubject, programId: e.target.value })}
                                >
                                    <option value="">-- Select Program --</option>
                                    {programs.map(prog => (
                                        <option key={prog.id} value={prog.id}>{prog.title}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Associating with a program is optional but recommended.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Type</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newSubject.subjectType}
                                    onChange={(e) => setNewSubject({ ...newSubject, subjectType: e.target.value })}
                                >
                                    <option value="THEORY">Theory</option>
                                    <option value="PRACTICAL">Practical</option>
                                    <option value="LAB">Lab</option>
                                    <option value="ELECTIVE">Elective</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Exam Marks</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. 100"
                                    value={newSubject.totalExamMarks}
                                    onChange={(e) => setNewSubject({ ...newSubject, totalExamMarks: parseInt(e.target.value) || 0 })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Maximum marks allowed for this subject's exams.</p>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {isCreating ? 'Creating...' : 'Create Subject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteSubject}
                title="Delete Subject"
                message={`Are you sure you want to delete "${subjectToDelete?.title}"?`}
                confirmText="Delete"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default SubjectManagementPage;
