import React, { useEffect, useState } from 'react';
import { instructorService, type InstructorAvailability } from '../../../../../api/instructorService';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, Trash } from 'lucide-react';

const InstructorAvailabilityPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Instructor ID
    const [availability, setAvailability] = useState<InstructorAvailability[]>([]);
    const [loading, setLoading] = useState(true);

    const [newSlot, setNewSlot] = useState({
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '17:00'
    });

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    const fetchData = async () => {
        if (!id) return;
        try {
            const res = await instructorService.getAvailability(id);
            if (res.status === 'SUCCESS') {
                setAvailability(res.apiData);
            }
        } catch (e) {
            toast.error('Failed to load availability');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleAdd = async () => {
        if (!id) return;
        try {
            await instructorService.setAvailability({ ...newSlot, instructorId: id, isAvailable: true } as any);
            toast.success('Slot added');
            fetchData();
        } catch (e) {
            toast.error('Failed to add slot');
        }
    };

    const handleDelete = async (slotId: string) => {
        try {
            await instructorService.deleteAvailability(slotId);
            toast.success('Slot removed');
            fetchData();
        } catch (e) {
            toast.error('Failed to remove slot');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 italic">Loading availability...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Weekly Availability</h1>

            {/* Add Slot */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-end gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Day</label>
                    <select
                        className="border border-gray-300 rounded-lg p-2 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                        value={newSlot.dayOfWeek}
                        onChange={e => setNewSlot({ ...newSlot, dayOfWeek: e.target.value })}
                    >
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Start</label>
                    <input
                        type="time"
                        className="border border-gray-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={newSlot.startTime}
                        onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">End</label>
                    <input
                        type="time"
                        className="border border-gray-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={newSlot.endTime}
                        onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    />
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                    Add Slot
                </button>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {days.map(day => {
                    const slots = availability.filter(a => a.dayOfWeek === day);
                    return (
                        <div key={day} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                            <h3 className="font-bold text-gray-900 mb-3 border-b pb-2 flex items-center justify-between">
                                {day}
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase">{slots.length} Slots</span>
                            </h3>
                            {slots.length === 0 ? (
                                <p className="text-sm text-gray-400 italic my-auto py-4 text-center">No slots defined</p>
                            ) : (
                                <div className="space-y-2">
                                    {slots.map(slot => (
                                        <div key={slot.id} className="flex justify-between items-center bg-emerald-50 p-2 rounded-lg border border-emerald-100 animate-fade-in">
                                            <div className="flex items-center gap-2 text-emerald-800 text-sm font-medium">
                                                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                                {slot.startTime} - {slot.endTime}
                                            </div>
                                            <button onClick={() => handleDelete(slot.id)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-100 rounded transition">
                                                <Trash className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InstructorAvailabilityPage;
