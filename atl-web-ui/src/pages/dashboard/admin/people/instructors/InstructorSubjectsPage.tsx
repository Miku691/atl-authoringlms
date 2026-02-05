import React, { useEffect, useState } from 'react';
import { instructorService, type InstructorSubject } from '../../../../../api/instructorService';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Book, Plus, Trash2 } from 'lucide-react';
import api from '../../../../../utils/api';

const InstructorSubjectsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [subjects, setSubjects] = useState<InstructorSubject[]>([]);
    const [allSubjects, setAllSubjects] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    const [newSub, setNewSub] = useState({ subjectId: '', level: 'PRIMARY' });

    const fetchData = async () => {
        if (!id) return;
        try {
            const [mySubs, all] = await Promise.all([
                instructorService.getSubjects(id),
                api.get('/ims-academic-service/subjects/tenant').catch(() => ({ data: { apiData: [] } }))
            ]);

            if (mySubs.status === 'SUCCESS') setSubjects(mySubs.apiData);
            if (all.data?.status === 'SUCCESS') setAllSubjects(all.data.apiData || []);
        } catch (e) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleAssign = async () => {
        if (!id || !newSub.subjectId) return;
        try {
            await instructorService.assignSubject({ ...newSub, instructorId: id });
            toast.success('Subject assigned');
            fetchData();
        } catch (e) {
            toast.error('Failed to assign subject');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 italic">Loading subjects...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Subject Expertise</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-end gap-6">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Select Subject</label>
                    <select
                        className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                        value={newSub.subjectId}
                        onChange={e => setNewSub({ ...newSub, subjectId: e.target.value })}
                    >
                        <option value="">Select Subject...</option>
                        {allSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="w-48">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Expertise Level</label>
                    <select
                        className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                        value={newSub.level}
                        onChange={e => setNewSub({ ...newSub, level: e.target.value })}
                    >
                        <option value="PRIMARY">Primary Expert</option>
                        <option value="SECONDARY">Secondary Expert</option>
                    </select>
                </div>
                <button
                    onClick={handleAssign}
                    className="bg-indigo-600 text-white px-8 py-2 rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Assign Subject
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.length === 0 ? (
                    <div className="col-span-full p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
                        No subjects assigned yet.
                    </div>
                ) : (
                    subjects.map(sub => (
                        <div key={sub.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                    <Book className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{sub.subjectName || 'N/A'}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Subject ID: {sub.subjectId}</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold mt-2 uppercase ${sub.level === 'PRIMARY' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {sub.level}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default InstructorSubjectsPage;
