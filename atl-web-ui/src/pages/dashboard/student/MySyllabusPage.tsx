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
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const percentage = coverageStats.total > 0
        ? Math.round((coverageStats.completed / coverageStats.total) * 100)
        : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in px-4 lg:px-0">
            {/* Page Header - Professional & Airy */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Curriculum Index</span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">The Syllabus</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px] flex items-center gap-2 opacity-70">
                        Live Academic Blueprint & Progression Matrix
                    </p>
                </div>
                {selectedOS && (
                    <div className="flex bg-white px-8 py-5 rounded-[2.5rem] border border-slate-100 shadow-sm items-center gap-5 group hover:shadow-xl transition-all duration-500">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-50" />
                                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={126} strokeDashoffset={126 - (126 * percentage) / 100} className="text-indigo-600 transition-all duration-1000" strokeLinecap="round" />
                            </svg>
                            <span className="absolute text-[10px] font-black text-indigo-600 italic tracking-tighter">{percentage}%</span>
                        </div>
                        <div>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Domain Saturation</p>
                             <p className="text-xs font-black text-slate-900 uppercase italic tracking-tight">{selectedOS.subjectName}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Subject Navigation - Premium Sidebar */}
                <div className="lg:w-96 shrink-0">
                    <div className="bg-white rounded-[3.5rem] p-10 border border-slate-50 shadow-sm sticky top-32 group/nav hover:shadow-2xl transition-all duration-700">
                        <div className="flex items-center justify-between mb-10 px-2">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none">Knowledge Domains</h3>
                            <Layers className="w-4 h-4 text-slate-200" />
                        </div>
                        <div className="space-y-4">
                            {offeringSubjects.map(os => (
                                <button
                                    key={os.id}
                                    onClick={() => setSelectedOS(os)}
                                    className={`w-full text-left p-6 rounded-[2rem] transition-all duration-500 group flex items-center justify-between relative overflow-hidden ${selectedOS?.id === os.id
                                        ? 'bg-slate-900 text-white shadow-2xl scale-[1.02] italic'
                                        : 'text-slate-600 hover:bg-slate-50 font-black'
                                        }`}
                                >
                                    <div className="flex items-center gap-5 truncate relative z-10">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 shadow-sm border ${selectedOS?.id === os.id ? 'bg-indigo-600 text-white border-indigo-500 rotate-6' : 'bg-white text-indigo-600 border-slate-100'
                                            }`}>
                                            {os.subjectName?.[0] || 'S'}
                                        </div>
                                        <div>
                                            <p className={`text-[8px] font-black uppercase tracking-widest leading-none mb-1.5 transition-opacity ${selectedOS?.id === os.id ? 'text-indigo-300 opacity-60' : 'text-slate-400 opacity-40'}`}>Faculty Block</p>
                                            <span className="truncate text-sm font-black uppercase tracking-tight italic leading-none">{os.subjectName}</span>
                                        </div>
                                    </div>
                                    {selectedOS?.id === os.id && (
                                        <div className="relative z-10">
                                            <ChevronRight className="w-5 h-5 text-indigo-400 animate-pulse" />
                                        </div>
                                    )}
                                    {/* Abstract background highlight */}
                                    {selectedOS?.id === os.id && (
                                        <div className="absolute top-0 right-0 w-32 h-full bg-indigo-500/5 rotate-12 blur-2xl"></div>
                                    )}
                                </button>
                            ))}
                            {offeringSubjects.length === 0 && (
                                <div className="p-16 text-center opacity-30 grayscale rounded-[2.5rem] bg-slate-50/50 border border-dashed border-slate-100">
                                    <Layers className="w-14 h-14 mx-auto mb-6 text-slate-200" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400">No Domains Detected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Area - Premium Curriculum Feed */}
                <div className="flex-1 space-y-12">
                    {selectedOS ? (
                        <>
                            {/* Detailed Tree */}
                            <div className="bg-white rounded-[4rem] p-12 lg:p-16 border border-slate-50 shadow-sm relative overflow-hidden group/content hover:shadow-2xl transition-all duration-700">
                                <div className="flex items-center justify-between mb-16 relative z-10">
                                    <div className="space-y-2">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4 italic">
                                            <BookOpen className="w-5 h-5 text-indigo-600" /> Subject Infrastructure
                                        </h3>
                                        <p className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{selectedOS.subjectName}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                         <div className="px-6 py-2.5 bg-emerald-50 rounded-full border border-emerald-100 flex items-center gap-3 shadow-sm shadow-emerald-50">
                                              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_emerald-500] animate-pulse"></div>
                                              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest italic">Encrypted Sync</span>
                                         </div>
                                    </div>
                                </div>

                                <div className="space-y-8 relative z-10">
                                    {chapters.map((chapter) => (
                                        <div key={chapter.id} className="group/chapter">
                                            <div
                                                className={`flex items-center justify-between p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer shadow-sm ${
                                                    chapter.isExpanded ? 'bg-slate-900 text-white shadow-2xl scale-[1.01] border-slate-800' : 'bg-slate-50/30 border-slate-50 hover:bg-white hover:border-slate-100 hover:shadow-xl'
                                                }`}
                                                onClick={() => toggleChapter(chapter.id)}
                                            >
                                                <div className="flex items-center gap-8">
                                                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl font-black italic shadow-lg transition-all duration-500 transform ${
                                                        chapter.isExpanded ? 'bg-indigo-600 text-white rotate-6' : 'bg-white text-indigo-600 border border-slate-50'
                                                    }`}>
                                                        {chapter.orderIndex < 10 ? `0${chapter.orderIndex}` : chapter.orderIndex}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black uppercase tracking-tight italic leading-none mb-2">
                                                            {chapter.title}
                                                        </h4>
                                                        <div className="flex items-center gap-3">
                                                            <p className={`text-[10px] font-black uppercase tracking-widest ${chapter.isExpanded ? 'text-indigo-400 opacity-80' : 'text-slate-400 opacity-60'}`}>
                                                                {chapter.topics.length} Operational Nodes
                                                            </p>
                                                            <div className={`w-1 h-1 rounded-full ${chapter.isExpanded ? 'bg-indigo-400 opacity-40' : 'bg-slate-200'}`}></div>
                                                            <p className={`text-[9px] font-black uppercase tracking-widest ${chapter.isExpanded ? 'text-indigo-400 opacity-80' : 'text-slate-400 opacity-60 italic'}`}>
                                                                Block 0{chapter.orderIndex}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {chapter.isExpanded ? <ChevronDown className="w-6 h-6 text-indigo-400" /> : <ChevronRight className="w-6 h-6 text-slate-300 group-hover/chapter:text-indigo-400 transition-colors" />}
                                            </div>

                                            {chapter.isExpanded && (
                                                <div className="mt-6 ml-10 pl-14 border-l-2 border-slate-100/50 space-y-4 py-4 animate-premium-slide">
                                                    {chapter.topics.map((topic) => (
                                                        <div
                                                            key={topic.id}
                                                            className={`flex items-center justify-between p-6 lg:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden group/topic cursor-default ${topic.status === 'COMPLETED'
                                                                ? 'bg-emerald-50/50 border-emerald-100 shadow-sm shadow-emerald-50'
                                                                : 'bg-white border-slate-100 hover:shadow-xl hover:border-slate-200'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-6 relative z-10">
                                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm border ${
                                                                    topic.status === 'COMPLETED' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-50 text-slate-200 border-slate-100 group-hover/topic:text-indigo-400'
                                                                }`}>
                                                                    {topic.status === 'COMPLETED' ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                                                </div>
                                                                <div>
                                                                    <p className={`text-base font-black uppercase tracking-tight italic transition-all duration-500 ${topic.status === 'COMPLETED' ? 'text-slate-900 translate-x-1' : 'text-slate-400 group-hover/topic:text-slate-600'}`}>
                                                                        {topic.title}
                                                                    </p>
                                                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic opacity-60">System Topic Marker: TP-0{topic.orderIndex}</p>
                                                                </div>
                                                            </div>
                                                            {topic.status === 'COMPLETED' && (
                                                                <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-emerald-100 shadow-sm shadow-emerald-50 relative z-10 group-hover:scale-105 transition-transform">
                                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Faculty Verified</span>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Topic background visual flair */}
                                                            {topic.status === 'COMPLETED' && (
                                                                <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none opacity-50"></div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {chapter.topics.length === 0 && (
                                                        <div className="py-12 bg-slate-50/30 rounded-[2.5rem] border border-dashed border-slate-100 flex flex-col items-center justify-center grayscale opacity-40 group hover:opacity-60 transition-all">
                                                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                                                <Info className="w-6 h-6 text-slate-300 group-hover:rotate-12 transition-transform" />
                                                            </div>
                                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] italic text-slate-400">Structural Node Empty • No Topics Mapped</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {chapters.length === 0 && (
                                        <div className="py-32 text-center grayscale opacity-30 group hover:opacity-50 transition-all duration-700">
                                            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 border border-slate-100 shadow-inner group-hover:rotate-12 transition-transform duration-700">
                                                <Layers className="w-16 h-16 text-slate-200" />
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Structural Pending</h3>
                                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">No Curriculum blueprint detected for this domain</p>
                                        </div>
                                    )}
                                </div>

                                {/* Background decoration */}
                                <div className="absolute -right-20 -bottom-20 text-[200px] font-black text-slate-50 italic leading-none pointer-events-none uppercase transition-transform group-hover/content:scale-110 duration-700 opacity-40">
                                    CORE
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-[4rem] p-40 text-center border-2 border-dashed border-slate-50 shadow-sm grayscale opacity-30 hover:opacity-50 hover:bg-slate-50 transition-all duration-700 cursor-default group">
                            <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-2xl border border-slate-50 group-hover:rotate-12 transition-transform duration-700">
                                <BookOpen className="w-16 h-16 text-slate-200" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-300 uppercase tracking-tighter italic">Operational Silence</h3>
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 mt-6 italic">Initialize a Knowledge Domain to reveal curriculum nodes</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MySyllabusPage;
