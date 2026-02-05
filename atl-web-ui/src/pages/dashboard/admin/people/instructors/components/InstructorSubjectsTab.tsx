import React, { useState, useEffect } from 'react';
import { academicService } from '../../../../../../api/academicService';
import { Book, GraduationCap, Clock, Loader2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    instructorId: string;
}

const InstructorSubjectsTab: React.FC<Props> = ({ instructorId }) => {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (instructorId) fetchAssignments();
    }, [instructorId]);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const res = await academicService.getInstructorAssignments(instructorId);
            if (res.status === 'SUCCESS') setAssignments(res.apiData);
        } catch (error) {
            toast.error("Failed to load subject assignments");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-100 italic text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            Analyzing assignment matrix...
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.length === 0 ? (
                    <div className="col-span-full bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center">
                        <Book className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h4 className="text-gray-900 font-bold uppercase tracking-tight">No Active Assignments</h4>
                        <p className="text-gray-400 text-sm mt-1">This instructor is currently not linked to any academic offerings.</p>
                    </div>
                ) : assignments.map((mapping, idx) => (
                    <div key={mapping.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all group relative overflow-hidden animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Book className="w-24 h-24" />
                        </div>

                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100/50">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
                                {mapping.role || 'GUEST'}
                            </span>
                        </div>

                        <div>
                            <h4 className="text-lg font-black text-gray-900 font-outfit uppercase leading-tight">{mapping.subjectName || 'All Subjects'}</h4>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1 mb-4">{mapping.offeringName}</p>
                        </div>

                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase">{mapping.startDate || 'Permanent'}</span>
                            </div>
                            <button className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gray-900 p-8 rounded-[2rem] text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-black font-outfit uppercase tracking-tight mb-2">Academic Roadmap</h3>
                        <p className="text-gray-400 text-sm max-w-xl font-medium leading-relaxed">
                            These subjects are derived from the core mapping engine. Instructors have access to all syllabus materials and student progress reports for the subjects listed above.
                        </p>
                    </div>
                    <button className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-400 hover:text-white transition-all shadow-xl active:scale-95 whitespace-nowrap">
                        Access Syllabus
                    </button>
                </div>
                <Book className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/5 rotate-12" />
            </div>
        </div>
    );
};

export default InstructorSubjectsTab;
