import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import { academicService } from '../../../../api/academicService';
import { instructorService } from '../../../../api/instructorService';
import { timetableService, type TimetableMaster, type TimetableSlot } from '../../../../api/timetableService';
import { Calendar, Plus, Trash2, X, Clock, BookOpen, User as UserIcon, Edit2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import PageHeader from '../../../../components/common/PageHeader';

export default function TimetableManagementPage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const [offerings, setOfferings] = useState<any[]>([]);
    const [selectedOfferingId, setSelectedOfferingId] = useState<string>('');
    const [timetableMaster, setTimetableMaster] = useState<TimetableMaster | null>(null);
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [instructors, setInstructors] = useState<any[]>([]);

    const isAdmin = user?.roles?.some(r => ['TENANT_ADMIN', 'ADMIN'].includes(r));
    const [instructorId, setInstructorId] = useState<string | null>(null);

    // Modals
    const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
    const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [activeDay, setActiveDay] = useState<number>(1); // 1 = Monday
    const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

    const [newSlot, setNewSlot] = useState({
        startTime: '09:00',
        endTime: '10:00',
        slotLabel: 'Period 1',
        periodNumber: 1
    });

    const [newEntry, setNewEntry] = useState({
        subjectId: '',
        instructorId: '',
        room: ''
    });

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'danger' | 'warning' | 'info' | 'success';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    useEffect(() => {
        if (user?.tenantId) {
            fetchOfferings();
        }
    }, [user?.tenantId]);

    useEffect(() => {
        if (selectedOfferingId) {
            fetchTimetable();
            fetchSubjects();
            fetchInstructors();
        } else {
            setTimetableMaster(null);
        }
    }, [selectedOfferingId]);

    const fetchOfferings = async () => {
        if (!user?.tenantId) return;
        try {
            let instId = instructorId;
            if (!isAdmin && !instId && user?.email) {
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
            console.error('Error fetching offerings:', error);
            toast.error('Failed to load offerings');
        }
    };

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const data = await timetableService.getByOfferingAndTenant(selectedOfferingId, user?.tenantId || '');
            if (data && data.length > 0) {
                // Assuming one master per offering for now
                setTimetableMaster(data[0]);
            } else {
                setTimetableMaster(null);
            }
        } catch (error) {
            console.error('Error fetching timetable:', error);
            // toast.error('Failed to load timetable');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await academicService.getOfferingSubjects(selectedOfferingId);
            if (response.status === 'SUCCESS' && response.apiData) {
                setSubjects(response.apiData.map((os: any) => ({
                    id: os.subjectId,
                    name: os.subjectName
                })));
            } else {
                setSubjects([]);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchInstructors = async () => {
        if (!user?.tenantId) return;
        try {
            // 1. Get IDs of instructors assigned to this offering
            const assignRes = await academicService.getOfferingInstructors(selectedOfferingId);
            const assignedIds = (assignRes.apiData || []).map((a: any) => a.instructorId);

            if (assignedIds.length === 0) {
                setInstructors([]);
                return;
            }

            // 2. Get full instructor details for the tenant to get names
            const instRes = await instructorService.getInstructorsByTenant(user.tenantId);
            if (instRes.status === 'SUCCESS' && instRes.apiData) {
                const enriched = instRes.apiData
                    .filter((i: any) => assignedIds.includes(i.id))
                    .map((i: any) => ({
                        id: i.id,
                        name: `${i.firstName || ''} ${i.lastName || ''}`.trim() || 'Unnamed Instructor'
                    }));
                setInstructors(enriched);
            } else {
                setInstructors([]);
            }
        } catch (error) {
            console.error('Error fetching instructors:', error);
        }
    };

    const handleCreateMaster = async () => {
        setIsSubmitting(true);
        try {
            await timetableService.createMaster({
                tenantId: user?.tenantId || '',
                offeringId: selectedOfferingId,
                name: "Standard Timetable",
                academicYearId: new Date().getFullYear().toString(),
                timezone: "Asia/Kolkata"
            });
            toast.success('Timetable initialized');
            fetchTimetable();
        } catch (error) {
            console.error('Error creating master:', error);
            toast.error('Failed to initialize timetable');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddSlot = async () => {
        if (!timetableMaster) return;
        setIsSubmitting(true);
        try {
            await timetableService.createSlot({
                tenantId: user?.tenantId || '',
                timetableMasterId: timetableMaster.id,
                dayOfWeek: activeDay,
                startTime: newSlot.startTime + ":00", // Append seconds
                endTime: newSlot.endTime + ":00",
                slotLabel: newSlot.slotLabel,
                periodNumber: newSlot.periodNumber,
                entries: []
            });
            toast.success('Slot added');
            setIsAddSlotModalOpen(false);
            fetchTimetable();
        } catch (error) {
            console.error('Error adding slot:', error);
            toast.error('Failed to add slot');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSlot = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Time Slot',
            message: 'Are you sure you want to delete this time slot? All subjects assigned to this slot will also be removed.',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await timetableService.deleteSlot(id);
                    toast.success('Slot deleted');
                    fetchTimetable();
                } catch (error) {
                    console.error('Error deleting slot:', error);
                    toast.error('Failed to delete slot');
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleAddEntry = async () => {
        if (!selectedSlot) return;
        setIsSubmitting(true);
        try {
            const entryData = {
                tenantId: user?.tenantId || '',
                timetableSlotId: selectedSlot.id,
                offeringId: selectedOfferingId,
                subjectId: newEntry.subjectId,
                instructorId: newEntry.instructorId,
                room: newEntry.room
            };

            if (editingEntryId) {
                await timetableService.updateEntry(editingEntryId, entryData);
                toast.success('Entry updated');
            } else {
                await timetableService.createEntry(entryData);
                toast.success('Entry assigned');
            }
            setIsAddEntryModalOpen(false);
            setEditingEntryId(null);
            fetchTimetable();
        } catch (error) {
            console.error('Error adding/updating entry:', error);
            toast.error(`Failed to ${editingEntryId ? 'update' : 'assign'} entry`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEntry = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Remove Assignment',
            message: 'Are you sure you want to remove this subject assignment from the timetable?',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await timetableService.deleteEntry(id);
                    toast.success('Entry removed');
                    fetchTimetable();
                } catch (error) {
                    console.error('Error deleting entry:', error);
                    toast.error('Failed to remove entry');
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const openSlotModal = () => {
        if (activeSlots.length > 0) {
            const lastSlot = activeSlots[activeSlots.length - 1];
            const lastEndTime = lastSlot.endTime.substring(0, 5);

            // Calculate next hour for default end time
            const [hours, minutes] = lastEndTime.split(':').map(Number);
            const nextHourStr = String((hours + 1) % 24).padStart(2, '0');
            const nextEndTime = `${nextHourStr}:${String(minutes).padStart(2, '0')}`;

            // Find next period number
            const periodMatch = lastSlot.slotLabel.match(/Period (\d+)/);
            const nextPeriod = periodMatch ? `Period ${parseInt(periodMatch[1]) + 1}` : `Period ${activeSlots.length + 1}`;

            setNewSlot({
                startTime: lastEndTime,
                endTime: nextEndTime,
                slotLabel: nextPeriod,
                periodNumber: activeSlots.length + 1
            });
        } else {
            setNewSlot({ startTime: '09:00', endTime: '10:00', slotLabel: 'Period 1', periodNumber: 1 });
        }
        setIsAddSlotModalOpen(true);
    };

    const openEntryModal = (slot: TimetableSlot, entry?: any) => {
        setSelectedSlot(slot);
        if (entry) {
            setEditingEntryId(entry.id);
            setNewEntry({
                subjectId: entry.subjectId,
                instructorId: entry.instructorId,
                room: entry.room || ''
            });
        } else {
            setEditingEntryId(null);
            setNewEntry({ subjectId: '', instructorId: '', room: '' });
        }
        setIsAddEntryModalOpen(true);
    };

    const days = [
        { id: 1, name: 'Monday' },
        { id: 2, name: 'Tuesday' },
        { id: 3, name: 'Wednesday' },
        { id: 4, name: 'Thursday' },
        { id: 5, name: 'Friday' },
        { id: 6, name: 'Saturday' },
        { id: 7, name: 'Sunday' },
    ];

    // Helper to get slots for active day
    const activeSlots = timetableMaster?.slots
        ?.filter(s => s.dayOfWeek === activeDay)
        ?.sort((a, b) => a.startTime.localeCompare(b.startTime)) || [];

    const getSubjectName = (subId: string) => subjects.find(s => s && s.id === subId)?.name || 'Unknown Subject';
    const getInstructorName = (instId: string) => {
        const inst = instructors.find(i => i && i.id === instId);
        // Assuming instructor object has firstName/lastName or name
        return inst ? (inst.name || `${inst.firstName || ''} ${inst.lastName || ''}`) : 'Unknown Instructor';
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Timetable Management"
                description="Manage class schedules and teacher assignments"
            />

            {/* Selection Area */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Class/Offering</label>
                <select
                    className="w-full md:w-1/3 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={selectedOfferingId}
                    onChange={(e) => setSelectedOfferingId(e.target.value)}
                >
                    <option value="">-- Select Offering --</option>
                    {offerings.map(offering => (
                        <option key={offering.id} value={offering.id}>
                            {offering.name} ({offering.code})
                        </option>
                    ))}
                </select>
            </div>

            {selectedOfferingId && !timetableMaster && !loading && (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center">
                    <Calendar className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">No Timetable Found</h3>
                    <p className="text-slate-500 mb-6">There is no timetable configured for this offering yet.</p>
                    <button
                        onClick={handleCreateMaster}
                        disabled={isSubmitting}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 mx-auto"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Initialize Timetable
                    </button>
                </div>
            )}

            {loading && <div className="text-center py-12">Loading...</div>}

            {timetableMaster && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px]">
                    {/* Day Tabs */}
                    <div className="flex border-b overflow-x-auto">
                        {days.map(day => (
                            <button
                                key={day.id}
                                onClick={() => setActiveDay(day.id)}
                                className={`px-6 py-4 font-medium transition whitespace-nowrap ${activeDay === day.id
                                    ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                {day.name}
                            </button>
                        ))}
                    </div>

                    {/* Slots Area */}
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-slate-800">
                                {days.find(d => d.id === activeDay)?.name} Schedule
                            </h3>
                            {isAdmin && (
                                <button
                                    onClick={openSlotModal}
                                    className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Time Slot
                                </button>
                            )}
                        </div>

                        {activeSlots.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-400">
                                No slots configured for this day.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activeSlots.map(slot => (
                                    <div key={slot.id} className="border rounded-lg p-4 hover:shadow-md transition bg-white group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-sm font-medium flex items-center gap-2">
                                                    <Clock className="w-3 h-3" />
                                                    {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                                                </div>
                                                <h4 className="font-semibold text-slate-800">{slot.slotLabel}</h4>
                                            </div>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDeleteSlot(slot.id)}
                                                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Entries */}
                                        <div className="pl-4 border-l-2 border-indigo-100 space-y-2">
                                            {slot.entries && slot.entries.length > 0 ? (
                                                slot.entries.map(entry => (
                                                    <div key={entry.id} className="flex justify-between items-center bg-slate-50 p-2 rounded text-sm group/entry">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                                <BookOpen className="w-3 h-3" />
                                                                {getSubjectName(entry.subjectId)}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-slate-500">
                                                                <UserIcon className="w-3 h-3" />
                                                                {getInstructorName(entry.instructorId)}
                                                            </div>
                                                            {entry.room && (
                                                                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600">
                                                                    Room: {entry.room}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {isAdmin && (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEntryModal(slot, entry)}
                                                                    className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover/entry:opacity-100 transition"
                                                                    title="Edit Assignment"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteEntry(entry.id)}
                                                                    className="text-slate-400 hover:text-red-500"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <>
                                                    <div className="text-sm text-slate-400 italic">No subject assigned</div>
                                                    {isAdmin && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openEntryModal(slot)}
                                                            className="text-xs text-indigo-600 hover:underline mt-2 flex items-center gap-1"
                                                        >
                                                            <Plus className="w-3 h-3" /> Assign Subject/Instructor
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Slot Modal */}
            {isAddSlotModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Add Time Slot</h3>
                            <button type="button" onClick={() => setIsAddSlotModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Label (e.g. Period 1)</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg"
                                    value={newSlot.slotLabel}
                                    onChange={e => setNewSlot({ ...newSlot, slotLabel: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Period Number (for ordering)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-lg"
                                    value={newSlot.periodNumber}
                                    onChange={e => setNewSlot({ ...newSlot, periodNumber: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        className="w-full p-2 border rounded-lg"
                                        value={newSlot.startTime}
                                        onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        className="w-full p-2 border rounded-lg"
                                        value={newSlot.endTime}
                                        onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setIsAddSlotModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg" disabled={isSubmitting}>Cancel</button>
                            <button type="button" onClick={handleAddSlot} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Add Slot
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Entry Modal */}
            {isAddEntryModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">{editingEntryId ? 'Edit Assignment' : 'Assign Subject & Instructor'}</h3>
                            <button type="button" onClick={() => setIsAddEntryModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    value={newEntry.subjectId}
                                    onChange={e => setNewEntry({ ...newEntry, subjectId: e.target.value })}
                                >
                                    <option value="">-- Select Subject --</option>
                                    {subjects.filter(s => s != null).map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.name || sub.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Instructor</label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    value={newEntry.instructorId}
                                    onChange={e => setNewEntry({ ...newEntry, instructorId: e.target.value })}
                                >
                                    <option value="">-- Select Instructor --</option>
                                    {instructors.filter(i => i != null).map(inst => (
                                        <option key={inst.id} value={inst.id}>
                                            {inst.name || `${inst.firstName || ''} ${inst.lastName || ''}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Room (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="e.g. 101"
                                    value={newEntry.room}
                                    onChange={e => setNewEntry({ ...newEntry, room: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setIsAddEntryModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg" disabled={isSubmitting}>Cancel</button>
                            <button type="button" onClick={handleAddEntry} disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingEntryId ? 'Update' : 'Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
            />
        </div>
    );
}
