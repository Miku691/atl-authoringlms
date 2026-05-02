import React, { useEffect, useState } from 'react';
import {
    Calendar, MapPin, User,
    AlertCircle, Loader2, Download, ChevronRight
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { studentDashboardService } from '../../../api/studentDashboardService';
import { timetableService, type TimetableMaster, type TimetableSlot, type TimetableEntry } from '../../../api/timetableService';
import { academicService } from '../../../api/academicService';
import { instructorService } from '../../../api/instructorService';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Unique accent colors per subject slot (cycles)
const SLOT_ACCENTS = [
    { bar: '#2a6df4', bg: '#eef2ff', text: '#0054d1' },
    { bar: '#9e3f00', bg: '#fff3ec', text: '#9e3f00' },
    { bar: '#3c5ba9', bg: '#e8edff', text: '#3c5ba9' },
    { bar: '#0054d1', bg: '#dae2ff', text: '#0054d1' },
    { bar: '#c65100', bg: '#fff0e6', text: '#c65100' },
    { bar: '#1a3d8a', bg: '#e6ecff', text: '#1a3d8a' },
];

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
    const [activeDayIdx, setActiveDayIdx] = useState(new Date().getDay() === 0 ? 0 : new Date().getDay() - 1);

    useEffect(() => {
        if (user?.email && user?.tenantId) {
            loadTimetableData();
        }
    }, [user?.email, user?.tenantId]);

    const loadTimetableData = async () => {
        setLoading(true);
        try {
            const { enrollment } = await studentDashboardService.getStudentContext(user!.email!, user!.tenantId!);
            if (!enrollment?.offeringId) { setLoading(false); return; }

            const offeringId = enrollment.offeringId;

            const subjectsRes = await academicService.getOfferingSubjects(offeringId);
            const map: Record<string, string> = {};
            if (subjectsRes.status === 'SUCCESS') {
                subjectsRes.apiData.forEach((sub: any) => { map[sub.subjectId] = sub.subjectName; });
            }
            setSubjectsMap(map);

            const instructorsRes = await instructorService.getInstructorsByTenant(user!.tenantId!);
            const iMap: Record<string, string> = {};
            if (instructorsRes.status === 'SUCCESS' && instructorsRes.apiData) {
                const instList = Array.isArray(instructorsRes.apiData) ? instructorsRes.apiData : (instructorsRes.apiData.content || []);
                instList.forEach((inst: any) => { iMap[inst.id] = `${inst.firstName} ${inst.lastName}`; });
            }
            setInstructorsMap(iMap);

            const masters = await timetableService.getByOfferingId(offeringId);
            if (masters && masters.length > 0) setTimetable(masters[0]);
        } catch (error) {
            console.error('Timetable load failed', error);
            toast.error('Failed to load your schedule');
        } finally {
            setLoading(false);
        }
    };

    const getSlotsForDay = (dayIndex: number): EnrichedSlot[] => {
        if (!timetable?.slots) return [];
        const targetBackendDay = dayIndex + 1;
        return timetable.slots
            .filter(slot => slot.dayOfWeek === targetBackendDay)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map(slot => ({
                ...slot,
                entries: (slot.entries || []).map(entry => ({
                    ...entry,
                    subjectName: subjectsMap[entry.subjectId] || 'Subject',
                    instructorName: entry.instructorId ? (instructorsMap[entry.instructorId] || 'Faculty') : 'Faculty'
                }))
            }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-[#2a6df4]" />
            </div>
        );
    }

    if (!timetable) {
        return (
            <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">
                <div className="rounded-2xl bg-[#f1f3f9] p-8 md:p-10">
                    <span className="text-[10px] font-semibold text-[#3c5ba9] uppercase tracking-widest">Class Schedule</span>
                    <h1 className="mt-2 text-3xl font-bold text-[#1a3d8a]">My Timetable</h1>
                </div>
                <div className="bg-surface rounded-2xl p-16 text-center shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)]">
                    <Calendar className="w-14 h-14 text-[#e0e2e8] mx-auto mb-4" />
                    <h2 className="text-lg font-bold text-[#181c20]">Schedule Not Published</h2>
                    <p className="text-sm text-[#424655] max-w-sm mx-auto mt-2">
                        Your class schedule has not been published yet. Please check back later.
                    </p>
                </div>
            </div>
        );
    }

    const activeSlots = getSlotsForDay(activeDayIdx);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">

            {/* ── Page Header ── */}
            <div className="rounded-2xl bg-[#f1f3f9] p-8 md:p-10 relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="text-[10px] font-semibold text-[#3c5ba9] uppercase tracking-widest">Class Schedule</span>
                        <h1 className="mt-2 text-3xl font-bold text-[#1a3d8a]">My Timetable</h1>
                        <p className="text-sm text-[#424655] mt-1">
                            {timetable.name ?? 'Academic semester schedule'}
                        </p>
                    </div>
                    <button
                        onClick={() => toast.success('PDF export processing...')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface rounded-xl text-sm font-semibold text-[#0054d1] shadow-[0_2px_8px_-2px_rgba(26,61,138,0.12)] hover:shadow-[0_4px_16px_-4px_rgba(26,61,138,0.16)] hover:-translate-y-0.5 transition-all duration-200 border border-[#dae2ff] self-start sm:self-auto"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                </div>
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#2a6df4]/8 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* ── Day Selector Tabs ── */}
            <div className="bg-surface rounded-2xl p-3 shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] flex items-center gap-2 overflow-x-auto no-scrollbar">
                {DAYS.map((day, idx) => {
                    const slotCount = getSlotsForDay(idx).length;
                    const isActive = activeDayIdx === idx;
                    return (
                        <button
                            key={day}
                            onClick={() => setActiveDayIdx(idx)}
                            className={`relative flex flex-col items-center gap-1 px-5 py-3 rounded-xl transition-all duration-200 min-w-[80px] group ${
                                isActive
                                    ? 'bg-gradient-to-br from-[#0054d1] to-[#2a6df4] text-white shadow-md'
                                    : 'text-[#424655] hover:bg-[#f1f3f9]'
                            }`}
                        >
                            <span className={`text-[10px] font-semibold uppercase tracking-widest ${isActive ? 'text-white/70' : 'text-[#64748b]'}`}>
                                {day.slice(0, 3)}
                            </span>
                            <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-[#181c20]'}`}>
                                {day.slice(0, 3)}
                            </span>
                            {slotCount > 0 && (
                                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                                    isActive ? 'bg-surface/20 text-white' : 'bg-[#dae2ff] text-[#0054d1]'
                                }`}>
                                    {slotCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Class Slots ── */}
            {activeSlots.length === 0 ? (
                <div className="bg-surface rounded-2xl py-20 text-center shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] flex flex-col items-center">
                    <div className="w-14 h-14 bg-[#f1f3f9] rounded-2xl flex items-center justify-center mb-4">
                        <Calendar className="w-7 h-7 text-[#c2c6d7]" />
                    </div>
                    <h3 className="text-base font-bold text-[#181c20]">Free Day</h3>
                    <p className="text-sm text-[#64748b] mt-1">No classes scheduled for {DAYS[activeDayIdx]}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {activeSlots.map((slot, sIdx) => {
                        const accent = SLOT_ACCENTS[sIdx % SLOT_ACCENTS.length];
                        return (
                            <div
                                key={slot.id}
                                className="group bg-surface rounded-2xl shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(26,61,138,0.1)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex"
                            >
                                {/* Left accent bar */}
                                <div className="w-1.5 shrink-0 rounded-l-2xl" style={{ backgroundColor: accent.bar }} />

                                <div className="flex-1 p-5 flex items-start gap-5">
                                    {/* Time */}
                                    <div className="flex flex-col items-center text-center min-w-[64px] shrink-0">
                                        <span className="text-sm font-bold" style={{ color: accent.text }}>
                                            {slot.startTime.substring(0, 5)}
                                        </span>
                                        <div className="my-1 w-px h-4 bg-[#e6e8ee]" />
                                        <span className="text-xs text-[#64748b]">{slot.endTime.substring(0, 5)}</span>
                                    </div>

                                    {/* Divider */}
                                    <div className="self-stretch w-px bg-[#f1f3f9] shrink-0" />

                                    {/* Entries */}
                                    <div className="flex-1 min-w-0">
                                        {slot.entries.length > 0 ? (
                                            slot.entries.map((entry, eIdx) => (
                                                <div key={eIdx} className="flex items-center justify-between gap-4 flex-wrap">
                                                    <div className="min-w-0">
                                                        <h3 className="text-base font-bold text-[#181c20] group-hover:text-[#0054d1] transition-colors truncate">
                                                            {entry.subjectName}
                                                        </h3>
                                                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                                                            <span className="flex items-center gap-1.5 text-xs text-[#424655]">
                                                                <User className="w-3.5 h-3.5 text-[#c2c6d7]" />
                                                                {entry.instructorName}
                                                            </span>
                                                            {entry.room && (
                                                                <span className="flex items-center gap-1.5 text-xs text-[#424655]">
                                                                    <MapPin className="w-3.5 h-3.5 text-[#c2c6d7]" />
                                                                    Room {entry.room}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span
                                                        className="shrink-0 text-[10px] font-semibold px-3 py-1 rounded-full"
                                                        style={{ backgroundColor: accent.bg, color: accent.text }}
                                                    >
                                                        Slot {sIdx + 1}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-[#64748b]">No entries for this slot</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Notice Banner ── */}
            <div className="bg-[#f1f3f9] rounded-2xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#dae2ff] flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-[#0054d1]" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-[#1a3d8a]">Schedule Notice</h4>
                    <p className="text-xs text-[#424655] mt-1 leading-relaxed">
                        All scheduled time blocks represent final institutional allocation. Any real-time changes will be communicated via the announcement feed.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MyTimetablePage;
