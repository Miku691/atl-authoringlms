
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import { announcementService, type Announcement } from '../../../../api/announcementService';
import {
    Plus,
    Megaphone,
    Calendar,
    Trash2,
    Loader2,
    AlertTriangle,
    Bell,
    X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AnnouncementManagementPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Announcement>>({
        title: '',
        content: '',
        targetAudience: 'ALL',
        priority: 'INFO'
    });

    useEffect(() => {
        if (user?.tenantId) {
            fetchAnnouncements();
        }
    }, [user?.tenantId]);

    const fetchAnnouncements = async () => {
        if (!user?.tenantId) return;
        setLoading(true);
        try {
            const response = await announcementService.getAnnouncementsByTenant(user.tenantId);
            setAnnouncements(response.apiData || []);
        } catch (error) {
            console.error("Failed to load announcements", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData, tenantId: user!.tenantId } as Announcement;
            await announcementService.createAnnouncement(payload);
            toast.success("Announcement posted successfully");
            setIsModalOpen(false);
            fetchAnnouncements();
            setFormData({ title: '', content: '', targetAudience: 'ALL', priority: 'INFO' });
        } catch (error) {
            console.error("Failed to post announcement", error);
            toast.error("Failed to post announcement");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this announcement?")) return;
        try {
            await announcementService.deleteAnnouncement(id);
            toast.success("Announcement deleted");
            fetchAnnouncements();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                    <p className="text-gray-500">Broadcast updates to students and staff</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                    <Plus className="w-4 h-4" />
                    New Announcement
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : announcements.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                    <Megaphone className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No announcements yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {announcements.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className={`h-1.5 w-full ${item.priority === 'URGENT' ? 'bg-red-500' :
                                item.priority === 'IMPORTANT' ? 'bg-amber-500' : 'bg-indigo-500'
                                }`} />
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${item.targetAudience === 'ALL' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        item.targetAudience === 'STUDENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            'bg-purple-50 text-purple-600 border-purple-100'
                                        }`}>
                                        {item.targetAudience}
                                    </span>
                                    <button onClick={() => handleDelete(item.id!)} className="text-gray-400 hover:text-red-600 transition-colors p-1">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">{item.content}</p>
                                <div className="flex items-center gap-4 border-t border-gray-50 pt-4">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(item.createdAt!).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <AlertTriangle className={`w-3.5 h-3.5 ${item.priority === 'URGENT' ? 'text-red-500' :
                                            item.priority === 'IMPORTANT' ? 'text-amber-500' : 'text-blue-500'
                                            }`} />
                                        {item.priority}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-600 text-white">
                            <div className="flex items-center gap-3">
                                <Bell className="w-6 h-6" />
                                <h2 className="text-xl font-bold">New Announcement</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-8 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Title</label>
                                <input
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Brief title for the announcement..."
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Content</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
                                    placeholder="Write your announcement details here..."
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Target Audience</label>
                                    <select
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                                        value={formData.targetAudience}
                                        onChange={e => setFormData({ ...formData, targetAudience: e.target.value as any })}
                                    >
                                        <option value="ALL">Everyone</option>
                                        <option value="STUDENT">Students Only</option>
                                        <option value="INSTRUCTOR">Instructors Only</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Priority</label>
                                    <select
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                                    >
                                        <option value="INFO">Information</option>
                                        <option value="IMPORTANT">Important</option>
                                        <option value="URGENT">Urgent!</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                                >
                                    Post Announcement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementManagementPage;
