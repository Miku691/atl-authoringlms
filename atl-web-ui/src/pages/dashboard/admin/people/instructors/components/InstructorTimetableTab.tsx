import React, { useState, useEffect } from 'react';
import { academicService, type TimetableEntry, type TimetableSlot } from '../../../../../../api/academicService';
import { Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../../../store/store';
import toast from 'react-hot-toast';

interface Props {
    instructorId: string;
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const InstructorTimetableTab: React.FC<Props> = ({ instructorId }) => {
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [slots, setSlots] = useState<TimetableSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        if (instructorId && user?.tenantId) {
            fetchData();
        }
    }, [instructorId, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [entriesRes, slotsRes] = await Promise.all([
                academicService.getTimetableByInstructor(instructorId),
                user?.tenantId ? academicService.getTimetableSlots(user.tenantId) : Promise.resolve({ status: 'ERROR', apiData: [] })
            ]);

            if (entriesRes.status === 'SUCCESS') setEntries(entriesRes.apiData);
            if (slotsRes.status === 'SUCCESS') setSlots(slotsRes.apiData);

        } catch (error) {
            toast.error("Failed to load timetable");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="p-12 text-center bg-surface rounded-xl border border-border italic text-content-muted">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            Synchronizing weekly schedule...
        </div>
    );

    // Identify unique time slots (rows) based on period number and time
    interface GridRow {
        periodNumber?: number;
        startTime: string;
        endTime: string;
        label: string;
    }

    const gridRows: GridRow[] = [];
    const seenRowsSelection = new Set<string>();

    slots.forEach(s => {
        const key = `${s.periodNumber}-${s.startTime}-${s.endTime}`;
        if (!seenRowsSelection.has(key)) {
            seenRowsSelection.add(key);
            gridRows.push({
                periodNumber: s.periodNumber,
                startTime: s.startTime,
                endTime: s.endTime,
                label: s.periodNumber ? `P${s.periodNumber}` : (s.slotLabel || 'P')
            });
        }
    });

    // Ensure instructor's own slots are included even if not in the general slotsRes
    entries.forEach(e => {
        if (e.slotDetails) {
            const s = e.slotDetails;
            const key = `${s.periodNumber}-${s.startTime}-${s.endTime}`;
            if (!seenRowsSelection.has(key)) {
                seenRowsSelection.add(key);
                gridRows.push({
                    periodNumber: s.periodNumber,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    label: s.periodNumber ? `P${s.periodNumber}` : (s.slotLabel || 'P')
                });
            }
        }
    });

    // Sort rows by period number, then start time
    const sortedGridRows = gridRows.sort((a, b) => {
        if (a.periodNumber && b.periodNumber) return a.periodNumber - b.periodNumber;
        if (a.periodNumber) return -1;
        if (b.periodNumber) return 1;
        return a.startTime.localeCompare(b.startTime);
    });

    const getEntryForDayAndTime = (dayValue: number, row: GridRow) => {
        return entries.find(e => {
            if (!e.slotDetails) return false;
            const s = e.slotDetails;
            return s.dayOfWeek === dayValue &&
                (row.periodNumber ? s.periodNumber === row.periodNumber :
                    (s.startTime === row.startTime && s.endTime === row.endTime));
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h3 className="text-lg font-bold text-content-primary flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" /> Weekly Schedule
                    </h3>
                    <div className="text-xs font-medium text-content-muted uppercase tracking-wider">
                        Current Session 2024-25
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-chrome/50">
                                <th className="p-4 border-b border-r text-left text-[10px] font-black uppercase text-content-muted sticky left-0 bg-chrome z-10">Time / Period</th>
                                {DAYS.map(day => (
                                    <th key={day} className="p-4 border-b text-center text-[10px] font-black uppercase text-content-muted">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedGridRows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="group hover:bg-indigo-50/20 transition-colors">
                                    <td className="p-4 border-b border-r sticky left-0 bg-surface z-10 group-hover:bg-indigo-50/50 transition-colors">
                                        <div className="font-bold text-content-primary text-sm">{row.label}</div>
                                        <div className="text-[10px] text-content-muted font-medium flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3 h-3" /> {row.startTime} - {row.endTime}
                                        </div>
                                    </td>
                                    {DAYS.map((dayName, index) => {
                                        const dayValue = index + 1;
                                        const entry = getEntryForDayAndTime(dayValue, row);

                                        return (
                                            <td key={dayName} className="p-2 border-b min-w-[160px]">
                                                {entry ? (
                                                    <div className="p-3 bg-surface border border-indigo-100 rounded-xl shadow-sm hover:shadow-md transition-all group/card relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                                        <div className="font-black text-indigo-600 text-xs uppercase truncate">{entry.subjectName || 'Subject'}</div>
                                                        <div className="text-[10px] font-bold text-content-secondary mt-1 uppercase truncate">{entry.offeringName}</div>
                                                        <div className="flex items-center gap-1 mt-2 text-[9px] font-black text-content-muted uppercase">
                                                            <MapPin className="w-3 h-3" /> {entry.room || 'TBA'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full min-h-[60px] flex items-center justify-center border border-dashed border-border rounded-xl bg-chrome/30">
                                                        <span className="text-[10px] font-bold text-gray-300 uppercase letter-spacing-widest">Free</span>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex gap-4 items-start">
                <div className="p-2 bg-surface rounded-lg text-indigo-600 shadow-sm shrink-0">
                    <Clock className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-indigo-900 text-sm">Instructor Availability Protocol</h4>
                    <p className="text-xs text-indigo-700/70 mt-1 leading-relaxed">
                        "This schedule is strictly binding for the current academic session. Any modifications or replacements must be approved by the Department Head and Academic Coordinator at least 24 hours in advance."
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InstructorTimetableTab;
