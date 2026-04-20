import React, { useEffect, useState } from 'react';
import {
    Calendar, Clock, MapPin, User,
    AlertCircle, Loader2, Download,
    LayoutDashboard, Info, GraduationCap
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { studentDashboardService } from '../../../api/studentDashboardService';
import { timetableService, type TimetableMaster, type TimetableSlot, type TimetableEntry } from '../../../api/timetableService';
import { academicService } from '../../../api/academicService';
import { instructorService } from '../../../api/instructorService';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface EnrichedEntry extends TimetableEntry {
    subjectName?: string;
    instructorName?: string;
}

interface EnrichedSlot extends TimetableSlot {
    entries: EnrichedEntry[];
}

const MyTimetablePage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [timetable, setTimetable] = useState<TimetableMaster | null>(null);
    const [subjectsMap, setSubjectsMap] = useState<Record<string, string>>({});
    const [instructorsMap, setInstructorsMap] = useState<Record<string, string>>({});
    const [activeDayIdx, setActiveDayIdx] = useState(new Date().getDay() === 0 ? 0 : new Date().getDay() - 1); // Default to current day Mon=0

    useEffect(() => {
        if (user?.email && user?.tenantId) {
            loadTimetableData();
        }
    }, [user?.email, user?.tenantId]);

    const loadTimetableData = async () => {
        setLoading(true);
        try {
            const { enrollment } = await studentDashboardService.getStudentContext(user!.email!, user!.tenantId!);
            if (!enrollment?.offeringId) {
                setLoading(false);
                return;
            }

            const offeringId = enrollment.offeringId;

            // Fetch Subjects for Mapping Names
            const subjectsRes = await academicService.getOfferingSubjects(offeringId);
            const map: Record<string, string> = {};
            if (subjectsRes.status === 'SUCCESS') {
                subjectsRes.apiData.forEach((sub: any) => {
                    map[sub.subjectId] = sub.subjectName;
                });
            }
            setSubjectsMap(map);

            // Fetch Instructors for Mapping Names
            const instructorsRes = await instructorService.getInstructorsByTenant(user!.tenantId!);
            const iMap: Record<string, string> = {};
            if (instructorsRes) {
                instructorsRes.forEach((inst: any) => {
                    iMap[inst.id] = `${inst.firstName} ${inst.lastName}`;
                });
            }
            setInstructorsMap(iMap);

            // Fetch Timetable Master
            const masters = await timetableService.getByOfferingId(offeringId);
            if (masters && masters.length > 0) {
                setTimetable(masters[0]);
            }
        } catch (error) {
            console.error("Timetable load failed", error);
            toast.error("Failed to load your schedule");
        } finally {
            setLoading(false);
        }
    };

    const getSlotsForDay = (dayIndex: number): EnrichedSlot[] => {
        if (!timetable?.slots) return [];
        const targetBackendDay = dayIndex + 1; // Backend: 1=Mon

        return timetable.slots
            .filter(slot => slot.dayOfWeek === targetBackendDay)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map(slot => ({
                ...slot,
                entries: (slot.entries || []).map(entry => ({
                    ...entry,
                    subjectName: subjectsMap[entry.subjectId] || 'Subject Managed',
                    instructorName: entry.instructorId ? (instructorsMap[entry.instructorId] || 'Primary Faculty') : 'Primary Faculty'
                }))
            }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!timetable) {
        return (
            <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-sm mt-10">
                <Calendar className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Schedule Pending</h2>
                <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">
                    Your class schedule has not been published yet. Please check back later.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in px-4 lg:px-0">
            {/* Page Header - Professional & Airy */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Pulse</span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Schedule</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px] flex items-center gap-2 opacity-70">
                        Institutional Grade Academic Timing & Resource Mapping
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => toast.success("PDF Export processing...")}
                        className="group bg-white px-8 py-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-xl hover:bg-slate-900 hover:text-white transition-all active:scale-95 duration-500"
                    >
                        <Download className="w-5 h-5 text-indigo-600 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic group-hover:tracking-[0.15em] transition-all">Export Protocol</span>
                    </button>
                </div>
            </div>

            {/* Timetable Weekly Interaction Zone */}
            <div className="space-y-12">
                {/* Day Selectors - High End Tab System */}
                <div className="flex items-center gap-5 p-5 bg-white rounded-[3.5rem] border border-slate-50 shadow-sm overflow-x-auto no-scrollbar scroll-smooth">
                    {DAYS.map((day, idx) => (
                        <button
                            key={day}
                            onClick={() => setActiveDayIdx(idx)}
                            className={`relative px-12 py-6 rounded-[2.5rem] transition-all duration-500 flex flex-col items-center gap-2 min-w-[160px] group ${activeDayIdx === idx
                                ? 'bg-slate-900 text-white shadow-2xl scale-[1.02] active-day'
                                : 'text-slate-400 font-black hover:bg-slate-50 hover:text-slate-600'
                                }`}
                        >
                            <span className={`text-[7px] uppercase tracking-[0.3em] font-black transition-opacity duration-500 ${activeDayIdx === idx ? 'opacity-40' : 'opacity-20 group-hover:opacity-40'}`}>Block {idx + 1}</span>
                            <span className="text-[11px] uppercase tracking-[0.2em] font-black italic">{day}</span>
                            {activeDayIdx === idx && (
                                <div className="absolute -bottom-1 w-1/3 h-1 bg-indigo-500 rounded-full blur-sm"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Slots Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {getSlotsForDay(activeDayIdx).map((slot, sIdx) => (
                        <div key={slot.id} className="group relative">
                            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-700 h-full flex flex-col relative overflow-hidden">
                                {/* Abstract Background ID */}
                                <div className="absolute -right-6 -top-6 text-[100px] font-black text-slate-50 opacity-0 group-hover:opacity-100 transition-all italic leading-none pointer-events-none uppercase">
                                    0{sIdx + 1}
                                </div>

                                <div className="flex items-center justify-between mb-10 relative z-10">
                                    <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100/50 flex items-center gap-4 group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all duration-500">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 group-hover:bg-white animate-pulse"></div>
                                        <span className="text-[10px] font-black text-slate-900 group-hover:text-white uppercase tracking-[0.2em] italic transition-colors">
                                            {slot.startTime.substring(0, 5)} — {slot.endTime.substring(0, 5)}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-black text-slate-300 uppercase italic tracking-[0.3em] group-hover:text-indigo-400 transition-colors">PHASE 0{sIdx + 1}</span>
                                </div>

                                <div className="space-y-10 flex-1 relative z-10">
                                    {slot.entries.map((entry, eIdx) => (
                                        <div key={eIdx} className="space-y-8">
                                            <div>
                                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-indigo-600 transition-colors uppercase italic mb-3">
                                                    {entry.subjectName}
                                                </h3>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Academic Core Component</p>
                                            </div>

                                            <div className="space-y-5">
                                                <div className="flex items-center gap-5 p-4 bg-slate-50/50 rounded-[1.5rem] border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all duration-300">
                                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                                                        <User className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 italic">Lead Faculty</p>
                                                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight italic">{entry.instructorName}</p>
                                                    </div>
                                                </div>
                                                
                                                {entry.room && (
                                                    <div className="flex items-center gap-5 p-4 bg-slate-50/50 rounded-[1.5rem] border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all duration-300">
                                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                                                            <MapPin className="w-5 h-5 text-slate-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 italic">Resource Venue</p>
                                                            <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight italic">{entry.room}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {slot.entries.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-16 opacity-30 grayscale group-hover:grayscale-0 transition-all duration-500 scale-90">
                                            <div className="p-10 bg-slate-50 rounded-[2.5rem] mb-6 border border-slate-100">
                                                <LayoutDashboard className="w-12 h-12 text-slate-200" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Operational Silence</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {getSlotsForDay(activeDayIdx).length === 0 && (
                        <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-50 shadow-sm flex flex-col items-center justify-center group hover:bg-slate-50 transition-all duration-700">
                            <div className="p-12 bg-white w-28 h-28 rounded-full border border-slate-100 shadow-xl flex items-center justify-center mb-10 group-hover:rotate-12 transition-transform duration-700">
                                <Info className="w-12 h-12 text-slate-200" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic mb-3">Academic Rest</h3>
                            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] italic opacity-60">No institutional operations detected for this temporal cycle</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Institutional Protocol Notice */}
            <div className="bg-[#0A0C10] rounded-[4rem] p-16 text-white shadow-2xl relative overflow-hidden group hover:shadow-indigo-500/10 transition-shadow duration-700">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-14">
                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center backdrop-blur-xl border border-white/10 shrink-0 group-hover:rotate-6 transition-transform duration-500">
                        <AlertCircle className="w-10 h-10 text-indigo-400" />
                    </div>
                    <div className="text-center md:text-left space-y-4">
                        <div className="flex items-center gap-4 justify-center md:justify-start">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                            <h4 className="text-2xl font-black uppercase tracking-tight italic">Institutional Logistics Protocol</h4>
                        </div>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-3xl italic opacity-70">
                            All scheduled temporal blocks represent final institutional allocation. Real-time deviations are restricted to emergency nodes and will be broadcasted via the encrypted notification gateway.
                        </p>
                    </div>
                </div>
                {/* Visual Flair */}
                <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] transition-all duration-700 group-hover:scale-150"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(79,70,229,0.05),transparent_50%)]"></div>
            </div>
        </div>
    );
};

export default MyTimetablePage;
