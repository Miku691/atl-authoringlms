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
                    subjectName: subjectsMap[entry.subjectId] || 'Subject Managed'
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
        <div className="space-y-8 pb-12">
            {/* Dynamic Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Class Timetable</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
                        <Clock className="w-3 h-3 text-indigo-500" /> Verified Academic Operations • {timetable.timezone}
                    </p>
                </div>
                <button
                    onClick={() => toast.success("PDF Export processing...")}
                    className="group bg-white pr-8 pl-6 py-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-xl hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                >
                    <Download className="w-5 h-5 text-indigo-600 group-hover:text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-widest">Download Schedule</span>
                </button>
            </div>

            {/* Timetable Weekly Interaction Zone */}
            <div className="space-y-10">
                {/* Day Selectors */}
                <div className="flex items-center gap-2 p-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-x-auto custom-scrollbar no-scrollbar">
                    {DAYS.map((day, idx) => (
                        <button
                            key={day}
                            onClick={() => setActiveDayIdx(idx)}
                            className={`px-8 py-4 rounded-2xl flex-1 min-w-[140px] transition-all flex flex-col items-center gap-1 ${activeDayIdx === idx
                                ? 'bg-slate-900 text-white shadow-2xl scale-[1.02] italic'
                                : 'text-slate-400 font-black hover:bg-slate-50 hover:text-slate-600'
                                }`}
                        >
                            <span className="text-[8px] uppercase tracking-[0.2em] font-black opacity-60">Working Day</span>
                            <span className="text-sm uppercase tracking-tight">{day}</span>
                        </button>
                    ))}
                </div>

                {/* Slots Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {getSlotsForDay(activeDayIdx).map((slot, sIdx) => (
                        <div key={slot.id} className="group relative">
                            <div className="absolute -left-3 top-8 bottom-8 w-1.5 bg-indigo-600 rounded-full scale-y-0 group-hover:scale-y-100 transition-transform origin-center z-10"></div>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all h-full flex flex-col relative overflow-hidden">

                                <div className="flex items-center justify-between mb-8">
                                    <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100/50 flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                                        <span className="text-[11px] font-black text-indigo-700 uppercase tracking-widest">
                                            {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-black text-slate-300 uppercase italic tracking-widest">Period {sIdx + 1}</span>
                                </div>

                                <div className="space-y-6 flex-1">
                                    {slot.entries.map((entry, eIdx) => (
                                        <div key={eIdx} className="space-y-4">
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors uppercase italic">
                                                {entry.subjectName}
                                            </h3>

                                            <div className="grid grid-cols-1 gap-3 pt-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                                        <User className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Primary Faculty</p>
                                                        <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Active Instructor</p>
                                                    </div>
                                                </div>
                                                {entry.room && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                                            <MapPin className="w-4 h-4 text-slate-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Physical Location</p>
                                                            <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{entry.room}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {slot.entries.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-10 opacity-30 grayscale italic scale-95 transition-transform group-hover:scale-100">
                                            <LayoutDashboard className="w-12 h-12 text-slate-200 mb-4" />
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Free Period</p>
                                        </div>
                                    )}
                                </div>

                                {/* Aesthetic corner mark */}
                                <div className="absolute top-0 right-0 p-8 transform rotate-12 translate-x-4 -translate-y-4 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10">
                                    <GraduationCap className="w-20 h-20" />
                                </div>
                            </div>
                        </div>
                    ))}
                    {getSlotsForDay(activeDayIdx).length === 0 && (
                        <div className="col-span-full py-24 text-center bg-slate-50/50 rounded-[3rem] border border-slate-100 border-dashed">
                            <div className="p-8 bg-white w-24 h-24 rounded-full mx-auto mb-8 shadow-xl flex items-center justify-center">
                                <Info className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tight italic mb-2">Academic Break</h3>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No scheduled operations for {DAYS[activeDayIdx]}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Global Notice Overlay */}
            <div className="bg-amber-50 rounded-[2.5rem] p-10 border border-amber-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="p-4 bg-white rounded-3xl shadow-xl shadow-amber-200/50 relative z-10">
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h4 className="text-lg font-black text-amber-900 uppercase tracking-tight">Institutional Disclaimer</h4>
                    <p className="text-sm text-amber-600/80 font-medium leading-relaxed mt-2">
                        Timetables are subject to change based on institutional requirements. Always verify with your department notice board for emergency adjustments or
                        holiday declarations.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MyTimetablePage;
