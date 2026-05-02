import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import {
    BookOpen, 
    CheckCircle, 
    Circle,
    ChevronDown, 
    ChevronRight, 
    Loader2, 
    Layers, 
    Info,
    GraduationCap,
    BookMarked,
    Target
} from 'lucide-react';
import { academicService } from '../../../api/academicService';
import { studentDashboardService } from '../../../api/studentDashboardService';
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
}

const MySyllabusPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [offeringSubjects, setOfferingSubjects] = useState<any[]>([]);
    const [selectedOS, setSelectedOS] = useState<any>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [coverageStats, setCoverageStats] = useState({ total: 0, completed: 0 });

    useEffect(() => {
        if (user?.email && user?.tenantId) {
            loadInitialData();
        }
    }, [user?.email, user?.tenantId]);

    useEffect(() => {
        if (selectedOS) {
            fetchSyllabusDetails();
        }
    }, [selectedOS]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const { enrollment } = await studentDashboardService.getStudentContext(user!.email!, user!.tenantId!);
            if (enrollment?.offeringId) {
                const response = await academicService.getOfferingSubjects(enrollment.offeringId);
                if (response.apiData) {
                    setOfferingSubjects(response.apiData);
                    if (response.apiData.length > 0) {
                        setSelectedOS(response.apiData[0]);
                    }
                }
            }
        } catch (error) {
            console.error("Error loading syllabus base data", error);
            toast.error("Failed to load subject list");
        } finally {
            setLoading(false);
        }
    };

    const fetchSyllabusDetails = async () => {
        try {
            const subjectId = selectedOS.subjectId;
            if (!subjectId) return;

            const chaptersDataRaw = await academicService.getChaptersByOfferingSubject(selectedOS.id);
            const chaptersData = Array.isArray(chaptersDataRaw) ? chaptersDataRaw : [];

            const coverageResponse = await academicService.getSyllabusCoverage(selectedOS.id);
            const coverageList = coverageResponse.apiData || [];

            let totalTopics = 0;
            let completedTopics = 0;

            const chaptersWithTopics = await Promise.all(chaptersData.map(async (chapter: any) => {
                const topicsData = await academicService.getTopicsByChapter(chapter.id);
                const topics = topicsData.map((topic: any) => {
                    const coverage = coverageList.find((c: any) => c.topicId === topic.id);
                    totalTopics++;
                    if (coverage?.status === 'COMPLETED') completedTopics++;

                    return {
                        id: topic.id,
                        title: topic.title,
                        orderIndex: topic.orderIndex,
                        status: coverage ? coverage.status : 'PENDING',
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
            setCoverageStats({ total: totalTopics, completed: completedTopics });

        } catch (error) {
            console.error("Error loading syllabus details", error);
        }
    };

    const toggleChapter = (chapterId: string) => {
        setChapters(prev => prev.map(c =>
            c.id === chapterId ? { ...c, isExpanded: !c.isExpanded } : c
        ));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-[#0054d1]" />
            </div>
        );
    }

    const percentage = coverageStats.total > 0
        ? Math.round((coverageStats.completed / coverageStats.total) * 100)
        : 0;

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700 px-4 lg:px-0">
             {/* Page Header Block - Academic Curator Pattern */}
             <div className="bg-[#f1f3f9] rounded-2xl p-8 md:p-10 relative overflow-hidden mb-10">
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <span className="text-[10px] font-semibold text-[#3c5ba9] uppercase tracking-widest mb-2 block">Curriculum & Syllabus Index</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-[#1a3d8a] tracking-tight">The Syllabus</h1>
                        <p className="text-sm text-[#424655] mt-1 max-w-md">Live Academic Blueprint & Progression Matrix</p>
                    </div>
                    {selectedOS && (
                        <div className="flex bg-surface px-6 py-4 rounded-xl shadow-sm border border-border items-center gap-4">
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-50" />
                                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={126} strokeDashoffset={126 - (126 * percentage) / 100} className="text-[#0054d1] transition-all duration-1000" strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-[10px] font-bold text-[#0054d1]">{percentage}%</span>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider mb-0.5">Syllabus Coverage</p>
                                <p className="text-xs font-bold text-[#181c20] truncate max-w-[120px]">{selectedOS.subjectName}</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#2a6df4]/5 rounded-full blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Subject Selection Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface rounded-2xl p-8 shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] sticky top-32">
                        <div className="flex items-center gap-3 mb-8 px-2">
                            <Layers className="w-4 h-4 text-[#2a6df4]" />
                            <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Knowledge Domains</h3>
                        </div>
                        
                        <div className="space-y-3">
                            {offeringSubjects.map(os => (
                                <button
                                    key={os.id}
                                    onClick={() => setSelectedOS(os)}
                                    className={`w-full text-left p-4 rounded-xl transition-all flex items-center justify-between group ${
                                        selectedOS?.id === os.id
                                        ? 'bg-[#f1f3f9] border border-[#dae2ff] shadow-sm'
                                        : 'hover:bg-[#f7f9ff] text-[#424655]'
                                    }`}
                                >
                                    <div className="flex items-center gap-4 truncate">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                                            selectedOS?.id === os.id 
                                            ? 'bg-gradient-to-br from-[#0054d1] to-[#2a6df4] text-white shadow-md' 
                                            : 'bg-[#f7f9ff] text-[#3c5ba9]'
                                        }`}>
                                            {os.subjectName?.[0] || 'S'}
                                        </div>
                                        <div className="truncate">
                                            <p className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${selectedOS?.id === os.id ? 'text-[#3c5ba9]' : 'text-content-muted'}`}>Subject</p>
                                            <span className={`text-sm font-bold truncate block ${selectedOS?.id === os.id ? 'text-[#1a3d8a]' : 'text-[#64748b]'}`}>{os.subjectName}</span>
                                        </div>
                                    </div>
                                    {selectedOS?.id === os.id && (
                                        <ChevronRight className="w-4 h-4 text-[#2a6df4]" />
                                    )}
                                </button>
                            ))}
                            {offeringSubjects.length === 0 && (
                                <div className="p-10 text-center bg-[#f7f9ff] rounded-xl border border-dashed border-[#dae2ff]">
                                    <BookMarked className="w-10 h-10 mx-auto mb-4 text-slate-200" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">No Domains Detected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Syllabus Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {selectedOS ? (
                        <div className="bg-surface rounded-2xl shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] overflow-hidden">
                            <div className="px-8 py-6 border-b border-[#f1f3f9] flex items-center justify-between">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#f1f3f9] flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-[#2a6df4]" />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Syllabus Breakdown</h3>
                                        <p className="text-xs text-content-muted font-medium">{selectedOS.subjectName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                     <div className="px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Live Progress</span>
                                     </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-10">
                                {chapters.map((chapter) => (
                                    <div key={chapter.id} className="space-y-4">
                                        {/* Chapter Header */}
                                        <button 
                                            onClick={() => toggleChapter(chapter.id)}
                                            className={`w-full flex items-center justify-between p-6 rounded-2xl border transition-all ${
                                                chapter.isExpanded 
                                                ? 'bg-[#f7f9ff] border-[#dae2ff] shadow-sm' 
                                                : 'bg-surface border-[#f1f3f9] hover:border-[#dae2ff] hover:bg-[#f7f9ff]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                                                    chapter.isExpanded ? 'bg-gradient-to-br from-[#0054d1] to-[#2a6df4] text-white' : 'bg-surface text-[#0054d1] border border-[#dae2ff]'
                                                }`}>
                                                    {chapter.orderIndex < 10 ? `0${chapter.orderIndex}` : chapter.orderIndex}
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="text-base font-bold text-[#181c20] tracking-tight">{chapter.title}</h4>
                                                    <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest mt-1">
                                                        {chapter.topics.length} Structural Nodes
                                                    </p>
                                                </div>
                                            </div>
                                            {chapter.isExpanded ? <ChevronDown className="w-5 h-5 text-[#2a6df4]" /> : <ChevronRight className="w-5 h-5 text-slate-300" />}
                                        </button>

                                        {/* Topics List */}
                                        {chapter.isExpanded && (
                                            <div className="ml-10 pl-10 border-l border-[#f1f3f9] space-y-3 animate-in slide-in-from-left-4 duration-500">
                                                {chapter.topics.map((topic) => (
                                                    <div
                                                        key={topic.id}
                                                        className={`flex items-center justify-between p-5 rounded-xl border transition-all ${
                                                            topic.status === 'COMPLETED'
                                                            ? 'bg-emerald-50/30 border-emerald-100/50'
                                                            : 'bg-surface border-[#f1f3f9] hover:shadow-md'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                                                topic.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-[#f7f9ff] text-slate-200'
                                                            }`}>
                                                                {topic.status === 'COMPLETED' ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-bold tracking-tight ${topic.status === 'COMPLETED' ? 'text-[#1a3d8a]' : 'text-[#64748b]'}`}>
                                                                    {topic.title}
                                                                </p>
                                                                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Topic TP-0{topic.orderIndex}</p>
                                                            </div>
                                                        </div>
                                                        {topic.status === 'COMPLETED' && (
                                                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold text-emerald-600 bg-surface border border-emerald-100 shadow-sm">
                                                                <Target className="w-3 h-3" />
                                                                Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                                {chapter.topics.length === 0 && (
                                                    <div className="p-8 text-center bg-[#f7f9ff] rounded-xl border border-dashed border-[#dae2ff]">
                                                        <Info className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                                                        <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest">No Topics Indexed</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {chapters.length === 0 && (
                                    <div className="py-20 text-center">
                                        <BookMarked className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                                        <h3 className="text-xl font-bold text-[#1a3d8a]">Structural Pending</h3>
                                        <p className="text-xs font-medium text-content-muted mt-2 uppercase tracking-widest">No curriculum nodes detected for this domain</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-surface rounded-2xl p-40 text-center border-2 border-dashed border-[#f1f3f9] flex flex-col items-center">
                            <BookOpen className="w-20 h-20 text-slate-100 mb-8" />
                            <h3 className="text-xl font-bold text-slate-300 uppercase tracking-tight">Select a Domain</h3>
                            <p className="text-xs font-medium text-slate-300 mt-4 uppercase tracking-widest">Select a Knowledge block from the sidebar to reveal nodes</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MySyllabusPage;
