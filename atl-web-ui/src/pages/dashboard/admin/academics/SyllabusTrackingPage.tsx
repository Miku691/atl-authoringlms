
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import { CheckCircle, Circle, Plus, Trash2, ChevronDown, ChevronRight, X, Loader2, Edit2 } from 'lucide-react';
import { academicService } from '../../../../api/academicService';
import { instructorService } from '../../../../api/instructorService';
import toast from 'react-hot-toast';

interface Chapter {
    id: string;
    title: string;
    orderIndex: number;
    topics: Topic[];
    isExpanded?: boolean;
}

interface Topic {
    id: string;
    title: string;
    orderIndex: number;
    status: 'PENDING' | 'COMPLETED';
    coverageId?: string; // To update existing coverage
}

const SyllabusTrackingPage: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [offerings, setOfferings] = useState<any[]>([]);
    const [selectedOfferingId, setSelectedOfferingId] = useState<string>('');

    const [offeringSubjects, setOfferingSubjects] = useState<any[]>([]);
    const [selectedOfferingSubjectId, setSelectedOfferingSubjectId] = useState<string>('');

    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAdmin = user?.roles?.some(r => ['TENANT_ADMIN', 'ADMIN'].includes(r));
    const [instructorId, setInstructorId] = useState<string | null>(null);

    useEffect(() => {
        if (user?.tenantId) {
            fetchOfferings();
        }
    }, [user?.tenantId]);

    useEffect(() => {
        if (selectedOfferingId) {
            fetchSubjects();
            setChapters([]);
            setSelectedOfferingSubjectId('');
        }
    }, [selectedOfferingId]);

    useEffect(() => {
        if (selectedOfferingSubjectId) {
            fetchSyllabusAndCoverage();
        }
    }, [selectedOfferingSubjectId]);

    const fetchOfferings = async () => {
        try {
            if (!user?.tenantId) return;

            let instId = instructorId;
            if (!isAdmin && !instId && user?.email && user?.tenantId) {
                const res = await instructorService.resolveProfile(user.email, user.tenantId);
                if (res.status === 'SUCCESS' && res.apiData) {
                    instId = res.apiData.id;
                    setInstructorId(instId);
                }
            }

            const data = isAdmin
                ? await academicService.getOfferingsByTenant(user.tenantId)
                : (instId ? await academicService.getOfferingsByInstructor(instId) : []);

            setOfferings(data);
        } catch (error) {
            console.error('Failed to fetch offerings', error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await academicService.getOfferingSubjects(selectedOfferingId);
            if (response.apiData) {
                setOfferingSubjects(response.apiData);
            }
        } catch (error) {
            console.error('Failed to fetch subjects', error);
        }
    };

    const fetchSyllabusAndCoverage = async () => {
        setLoading(true);
        try {
            // 2. Fetch Chapters (Scoped to OfferingSubject)
            const chaptersData = await academicService.getChaptersByOfferingSubject(selectedOfferingSubjectId);

            // 3. Fetch Topics for each Chapter & Coverage
            const coverageResponse = await academicService.getSyllabusCoverage(selectedOfferingSubjectId);
            const coverageList = coverageResponse.apiData || [];

            const chaptersWithTopics = await Promise.all(chaptersData.map(async (chapter: any) => {
                const topicsData = await academicService.getTopicsByChapter(chapter.id);
                const topics = topicsData.map((topic: any) => {
                    const coverage = coverageList.find((c: any) => c.topicId === topic.id);
                    return {
                        id: topic.id,
                        title: topic.title,
                        orderIndex: topic.orderIndex,
                        status: coverage ? coverage.status : 'PENDING',
                        coverageId: coverage ? coverage.id : undefined
                    };
                });
                return {
                    id: chapter.id,
                    title: chapter.title,
                    orderIndex: chapter.orderIndex,
                    topics: topics.sort((a: any, b: any) => a.orderIndex - b.orderIndex),
                    isExpanded: true
                };
            }));

            setChapters(chaptersWithTopics.sort((a: any, b: any) => a.orderIndex - b.orderIndex));

        } catch (error) {
            console.error('Failed to load syllabus', error);
            toast.error('Failed to load syllabus data');
        } finally {
            setLoading(false);
        }
    };

    const toggleTopicStatus = async (chapterId: string, topic: Topic) => {
        try {
            const newStatus = topic.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

            await academicService.updateCoverage({
                offeringSubjectId: selectedOfferingSubjectId,
                topicId: topic.id,
                status: newStatus,
                completedBy: user?.id
            });

            // Optimistic Update
            setChapters(prev => prev.map(c => {
                if (c.id !== chapterId) return c;
                return {
                    ...c,
                    topics: c.topics.map(t => {
                        if (t.id !== topic.id) return t;
                        return { ...t, status: newStatus };
                    })
                };
            }));
            toast.success(`Marked as ${newStatus}`);

        } catch (error) {
            console.error('Failed to update status', error);
            toast.error('Failed to update status');
        }
    };

    const toggleChapter = (chapterId: string) => {
        setChapters(prev => prev.map(c =>
            c.id === chapterId ? { ...c, isExpanded: !c.isExpanded } : c
        ));
    };

    // --- Create Logic ---
    const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);
    const [newChapterTitle, setNewChapterTitle] = useState('');

    const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
    const [selectedChapterId, setSelectedChapterId] = useState('');
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [newTopicSummary, setNewTopicSummary] = useState('');

    // --- Edit/Delete Logic ---
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
    const [editingTopic, setEditingTopic] = useState<{ chapterId: string, topic: Topic } | null>(null);
    const [isEditChapterModalOpen, setIsEditChapterModalOpen] = useState(false);
    const [isEditTopicModalOpen, setIsEditTopicModalOpen] = useState(false);

    const handleAddChapter = async () => {
        if (!newChapterTitle.trim()) return;
        setIsSubmitting(true);
        try {
            const selectedOS = offeringSubjects.find(os => os.id === selectedOfferingSubjectId);
            if (!selectedOS) {
                setIsSubmitting(false);
                return;
            }

            await academicService.createChapter({
                offeringSubjectId: selectedOfferingSubjectId,
                title: newChapterTitle,
                orderIndex: chapters.length + 1
            });

            toast.success('Chapter created');
            setNewChapterTitle('');
            setIsAddChapterModalOpen(false);
            fetchSyllabusAndCoverage();
        } catch (error) {
            console.error('Failed to create chapter', error);
            toast.error('Failed to create chapter');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddTopic = async () => {
        if (!newTopicTitle.trim() || !selectedChapterId) return;
        setIsSubmitting(true);
        try {
            await academicService.createTopic({
                chapterId: selectedChapterId,
                title: newTopicTitle,
                summary: newTopicSummary,
                orderIndex: chapters.length + 1 // Simple append
            });

            toast.success('Topic added');
            setNewTopicTitle('');
            setNewTopicSummary('');
            setIsAddTopicModalOpen(false);
            fetchSyllabusAndCoverage();
        } catch (error) {
            console.error('Failed to create topic', error);
            toast.error('Failed to create topic');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateChapter = async () => {
        if (!editingChapter || !newChapterTitle.trim()) return;
        setIsSubmitting(true);
        try {
            await academicService.updateChapter(editingChapter.id, {
                offeringSubjectId: selectedOfferingSubjectId,
                title: newChapterTitle,
                orderIndex: editingChapter.orderIndex
            });
            toast.success('Chapter updated');
            setIsEditChapterModalOpen(false);
            setEditingChapter(null);
            setNewChapterTitle('');
            fetchSyllabusAndCoverage();
        } catch (error) {
            console.error('Failed to update chapter', error);
            toast.error('Failed to update chapter');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteChapter = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this chapter and all its topics?')) return;
        try {
            await academicService.deleteChapter(id);
            toast.success('Chapter deleted');
            fetchSyllabusAndCoverage();
        } catch (error) {
            console.error('Failed to delete chapter', error);
            toast.error('Failed to delete chapter');
        }
    };

    const handleUpdateTopic = async () => {
        if (!editingTopic || !newTopicTitle.trim()) return;
        setIsSubmitting(true);
        try {
            await academicService.updateTopic(editingTopic.topic.id, {
                chapterId: editingTopic.chapterId,
                title: newTopicTitle,
                summary: newTopicSummary,
                orderIndex: editingTopic.topic.orderIndex
            });
            toast.success('Topic updated');
            setIsEditTopicModalOpen(false);
            setEditingTopic(null);
            setNewTopicTitle('');
            setNewTopicSummary('');
            fetchSyllabusAndCoverage();
        } catch (error) {
            console.error('Failed to update topic', error);
            toast.error('Failed to update topic');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTopic = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this topic?')) return;
        try {
            await academicService.deleteTopic(id);
            toast.success('Topic deleted');
            fetchSyllabusAndCoverage();
        } catch (error) {
            console.error('Failed to delete topic', error);
            toast.error('Failed to delete topic');
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Syllabus Tracking</h1>
                <p className="text-gray-500">Monitor academic progress and topic coverage</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="mb-6 grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Class (Offering)</label>
                        <select
                            className="w-full border rounded-lg p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={selectedOfferingId}
                            onChange={(e) => setSelectedOfferingId(e.target.value)}
                        >
                            <option value="">Select Class</option>
                            {offerings.map(off => (
                                <option key={off.id} value={off.id}>{off.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <select
                            className="w-full border rounded-lg p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={selectedOfferingSubjectId}
                            onChange={(e) => setSelectedOfferingSubjectId(e.target.value)}
                            disabled={!selectedOfferingId}
                        >
                            <option value="">Select Subject</option>
                            {offeringSubjects.map(os => (
                                <option key={os.id} value={os.id}>{os.subjectName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {!selectedOfferingSubjectId && (
                    <div className="text-center py-12 text-gray-400 border border-dashed rounded-xl">
                        Select a class and subject to view syllabus
                    </div>
                )}

                {loading && <div className="text-center py-12">Loading Syllabus...</div>}

                {selectedOfferingSubjectId && !loading && chapters.length === 0 && (
                    <div className="text-center py-12 text-gray-400 border border-dashed rounded-xl flex flex-col items-center">
                        <p className="mb-4">No syllabus defined for this subject.</p>
                        {isAdmin && (
                            <button
                                onClick={() => setIsAddChapterModalOpen(true)}
                                className="text-sm flex items-center gap-1 text-white bg-indigo-600 px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700"
                            >
                                <Plus className="w-4 h-4" /> Start by Adding a Chapter
                            </button>
                        )}
                    </div>
                )}

                {selectedOfferingSubjectId &&
                    !loading &&
                    chapters.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-700">Course Content</h3>
                                {isAdmin && (
                                    <button
                                        onClick={() => setIsAddChapterModalOpen(true)}
                                        className="text-sm flex items-center gap-1 text-indigo-600 hover:text-indigo-700 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg shadow-sm"
                                    >
                                        <Plus className="w-4 h-4" /> Add Chapter
                                    </button>
                                )}
                            </div>

                            {chapters.map((chapter) => (
                                <div key={chapter.id} className="relative pl-8 border-l-2 border-indigo-100">
                                    <div
                                        className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm cursor-pointer z-10"
                                        onClick={() => toggleChapter(chapter.id)}
                                    />

                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleChapter(chapter.id)}>
                                            {chapter.isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition">{chapter.title}</h3>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{chapter.topics.length} topics</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isAdmin && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedChapterId(chapter.id);
                                                            setIsAddTopicModalOpen(true);
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                                        title="Add Topic"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingChapter(chapter);
                                                            setNewChapterTitle(chapter.title);
                                                            setIsEditChapterModalOpen(true);
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                        title="Edit Chapter"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteChapter(chapter.id)}
                                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete Chapter"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {chapter.isExpanded && (
                                        <div className="grid gap-3 transition-all">
                                            {chapter.topics?.map((topic) => (
                                                <div
                                                    key={topic.id}
                                                    onClick={() => toggleTopicStatus(chapter.id, topic)}
                                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${topic.status === 'COMPLETED'
                                                        ? 'bg-green-50 border-green-100'
                                                        : 'bg-white border-gray-100 hover:border-indigo-100 hover:shadow-sm'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {topic.status === 'COMPLETED'
                                                            ? <CheckCircle className="w-5 h-5 text-green-600" />
                                                            : <Circle className="w-5 h-5 text-gray-300" />
                                                        }
                                                        <span className={`${topic.status === 'COMPLETED' ? 'text-gray-600 line-through' : 'text-gray-700'}`}>
                                                            {topic.title}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {isAdmin && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingTopic({ chapterId: chapter.id, topic });
                                                                        setNewTopicTitle(topic.title);
                                                                        setIsEditTopicModalOpen(true);
                                                                    }}
                                                                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                                >
                                                                    <Edit2 className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteTopic(topic.id);
                                                                    }}
                                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {topic.status === 'COMPLETED' && (
                                                            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                                                                Completed
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {chapter.topics.length === 0 && (
                                                <div className="text-sm text-gray-400 italic pl-2">No topics in this chapter</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
            </div>

            {/* Create Chapter Modal */}
            {isAddChapterModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Add Chapter</h3>
                            <button onClick={() => setIsAddChapterModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg"
                                    value={newChapterTitle}
                                    onChange={e => setNewChapterTitle(e.target.value)}
                                    placeholder="e.g. Introduction to Algebra"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsAddChapterModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleAddChapter} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Topic Modal */}
            {isAddTopicModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Add Topic</h3>
                            <button onClick={() => setIsAddTopicModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg"
                                    value={newTopicTitle}
                                    onChange={e => setNewTopicTitle(e.target.value)}
                                    placeholder="e.g. Linear Equations"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Summary (Optional)</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg"
                                    value={newTopicSummary}
                                    onChange={e => setNewTopicSummary(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsAddTopicModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleAddTopic} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Add Topic
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Chapter Modal */}
            {isEditChapterModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Edit Chapter</h3>
                            <button onClick={() => { setIsEditChapterModalOpen(false); setEditingChapter(null); }} className="text-gray-400 hover:text-gray-600"><X /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg"
                                    value={newChapterTitle}
                                    onChange={e => setNewChapterTitle(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => { setIsEditChapterModalOpen(false); setEditingChapter(null); }} disabled={isSubmitting} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleUpdateChapter} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Topic Modal */}
            {isEditTopicModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Edit Topic</h3>
                            <button onClick={() => { setIsEditTopicModalOpen(false); setEditingTopic(null); }} className="text-gray-400 hover:text-gray-600"><X /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg"
                                    value={newTopicTitle}
                                    onChange={e => setNewTopicTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg"
                                    value={newTopicSummary}
                                    onChange={e => setNewTopicSummary(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => { setIsEditTopicModalOpen(false); setEditingTopic(null); }} disabled={isSubmitting} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleUpdateTopic} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SyllabusTrackingPage;
