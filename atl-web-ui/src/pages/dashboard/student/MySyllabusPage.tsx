import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import {
    BookOpen, CheckCircle, Circle,
    ChevronDown, ChevronRight, GraduationCap,
    Loader2, Target, Layers, Info
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
            const subjectId = selectedOS.subject?.id;
            if (!subjectId) return;

            const chaptersData = await academicService.getChaptersByOfferingSubject(selectedOS.id);
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
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const percentage = coverageStats.total > 0
        ? Math.round((coverageStats.completed / coverageStats.total) * 100)
        : 0;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">My Syllabus</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
                        <Target className="w-3 h-3 text-indigo-500" /> Live Curriculum & Progress Tracking
                    </p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Subject Navigation */}
                <div className="lg:w-80 shrink-0">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm sticky top-24">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Academic Domains</h3>
                        <div className="space-y-2">
                            {offeringSubjects.map(os => (
                                <button
                                    key={os.id}
                                    onClick={() => setSelectedOS(os)}
                                    className={`w-full text-left px-5 py-4 rounded-2xl transition-all group flex items-center justify-between ${selectedOS?.id === os.id
                                        ? 'bg-slate-900 text-white shadow-xl italic'
                                        : 'text-slate-600 hover:bg-slate-50 font-bold'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 truncate">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${selectedOS?.id === os.id ? 'bg-indigo-600' : 'bg-indigo-50 text-indigo-600'
                                            }`}>
                                            {os.subject?.name?.[0]}
                                        </div>
                                        <span className="truncate text-sm">{os.subject?.name}</span>
                                    </div>
                                    {selectedOS?.id === os.id && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                                </button>
                            ))}
                            {offeringSubjects.length === 0 && (
                                <div className="p-10 text-center text-slate-300">
                                    <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No Subjects</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress & Content Tree */}
                <div className="flex-1 space-y-8">
                    {selectedOS ? (
                        <>
                            {/* Summary Card */}
                            <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="space-y-4 text-center md:text-left">
                                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Global Analytics: {selectedOS.subject?.name}</p>
                                        <h2 className="text-4xl font-black italic tracking-tight">{percentage}% Coverage</h2>
                                        <p className="text-indigo-100 text-sm font-medium opacity-80 max-w-sm">
                                            {coverageStats.completed} out of {coverageStats.total} total topics have been marked as completed by your instructors.
                                        </p>
                                    </div>
                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-indigo-900/30" />
                                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * percentage) / 100} className="text-white transition-all duration-1000" strokeLinecap="round" />
                                        </svg>
                                        <GraduationCap className="absolute w-10 h-10 text-white" />
                                    </div>
                                </div>
                                {/* Glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform -translate-y-1/2 translate-x-1/2"></div>
                            </div>

                            {/* Detailed Tree */}
                            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm pb-16">
                                <div className="flex items-center justify-between mb-12">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                        <BookOpen className="w-5 h-5 text-indigo-600" /> Syllabus Blueprint
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30"></div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {chapters.map((chapter) => (
                                        <div key={chapter.id} className="group/chapter">
                                            <div
                                                className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 border border-slate-50 cursor-pointer hover:bg-white hover:border-indigo-100 transition-all"
                                                onClick={() => toggleChapter(chapter.id)}
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm text-indigo-600 font-black italic">
                                                        {chapter.orderIndex}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-800 uppercase tracking-tight italic group-hover/chapter:text-indigo-600 transition-colors">
                                                            {chapter.title}
                                                        </h4>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{chapter.topics.length} Academic Topics</p>
                                                    </div>
                                                </div>
                                                {chapter.isExpanded ? <ChevronDown className="w-5 h-5 text-slate-300" /> : <ChevronRight className="w-5 h-5 text-slate-300" />}
                                            </div>

                                            {chapter.isExpanded && (
                                                <div className="mt-4 ml-6 pl-8 border-l-2 border-slate-50 space-y-4 py-2">
                                                    {chapter.topics.map((topic) => (
                                                        <div
                                                            key={topic.id}
                                                            className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${topic.status === 'COMPLETED'
                                                                ? 'bg-emerald-50/30 border-emerald-100 text-emerald-900'
                                                                : 'bg-white border-slate-100 text-slate-600 grayscale opacity-70'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                {topic.status === 'COMPLETED'
                                                                    ? <CheckCircle className="w-5 h-5 text-emerald-500 shadow-emerald-500/20" />
                                                                    : <Circle className="w-5 h-5 text-slate-200" />
                                                                }
                                                                <span className="text-sm font-black uppercase tracking-tight">{topic.title}</span>
                                                            </div>
                                                            {topic.status === 'COMPLETED' && (
                                                                <span className="text-[9px] font-black text-emerald-600 bg-white border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-widest">Verified</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {chapter.topics.length === 0 && (
                                                        <div className="py-4 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest italic flex items-center gap-2 justify-center">
                                                            <Info className="w-4 h-4" /> No mapped topics in this chapter
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {chapters.length === 0 && (
                                        <div className="py-32 text-center">
                                            <Layers className="w-16 h-16 text-slate-100 mx-auto mb-6 opacity-50" />
                                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Infrastructure Pending</p>
                                            <p className="text-slate-500 mt-2 text-sm font-medium max-w-xs mx-auto">No syllabus blueprint has been defined for this subject yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-[3rem] p-24 text-center border border-slate-100 shadow-sm opacity-50 grayscale transition-all">
                            <BookOpen className="w-20 h-20 text-slate-200 mx-auto mb-6 hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tighter italic">Selection Required</h3>
                            <p className="text-slate-400 mt-2 font-medium">Please select a subject from the academic domains to view coverage status.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MySyllabusPage;
