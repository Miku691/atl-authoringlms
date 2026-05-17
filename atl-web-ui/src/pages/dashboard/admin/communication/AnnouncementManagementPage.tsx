import React, { useEffect, useState, useCallback } from 'react';
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
    Edit,
    Search,
    Filter,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../../../../components/common/Modal';

const AnnouncementManagementPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [audienceFilter, setAudienceFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    const [formData, setFormData] = useState<Partial<Announcement>>({
        title: '',
        content: '',
        targetAudience: 'ALL',
        priority: 'INFO',
        expiryDate: '',
    });

    const fetchAnnouncements = useCallback(async () => {
        if (!user?.tenantId) return;
        setLoading(true);
        try {
            const response = await announcementService.getFilteredAnnouncements(
                user.tenantId,
                audienceFilter,
                priorityFilter,
                search
            );
            setAnnouncements(response.apiData || []);
        } catch (error) {
            console.error("Failed to load announcements", error);
            toast.error("Failed to load announcements");
        } finally {
            setLoading(false);
        }
    }, [user?.tenantId, audienceFilter, priorityFilter, search]);

    useEffect(() => {
        if (user?.tenantId) {
            fetchAnnouncements();
        }
    }, [fetchAnnouncements, user?.tenantId]);

    const handleOpenCreateModal = () => {
        setEditId(null);
        setFormData({ title: '', content: '', targetAudience: 'ALL', priority: 'INFO', expiryDate: '' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: Announcement) => {
        setEditId(item.id || null);
        setFormData({
            title: item.title,
            content: item.content,
            targetAudience: item.targetAudience,
            priority: item.priority,
            expiryDate: item.expiryDate ? item.expiryDate.substring(0, 16) : '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                tenantId: user!.tenantId,
                expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined
            } as Announcement;

            if (editId) {
                await announcementService.updateAnnouncement(editId, payload);
                toast.success("Announcement updated successfully");
            } else {
                await announcementService.createAnnouncement(payload);
                toast.success("Announcement posted successfully");
            }
            setIsModalOpen(false);
            fetchAnnouncements();
        } catch (error) {
            console.error("Failed to save announcement", error);
            toast.error(editId ? "Failed to update announcement" : "Failed to post announcement");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await announcementService.deleteAnnouncement(id);
            toast.success("Announcement deleted");
            setDeleteConfirmId(null);
            fetchAnnouncements();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary">Announcements</h1>
                    <p className="text-content-secondary">Broadcast updates to students and staff</p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 font-bold"
                >
                    <Plus className="w-4 h-4" />
                    New Announcement
                </button>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="bg-surface rounded-2xl p-4 border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-content-muted absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search announcements..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2 border border-border rounded-2xl bg-chrome text-content-primary focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-content-muted" />
                        <span className="text-xs font-bold text-content-secondary uppercase tracking-wider">Audience:</span>
                        <select
                            value={audienceFilter}
                            onChange={(e) => setAudienceFilter(e.target.value)}
                            className="border border-border rounded-2xl px-3 py-1.5 bg-chrome text-content-primary outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold"
                        >
                            <option value="">All Audiences</option>
                            <option value="STUDENT">Students</option>
                            <option value="INSTRUCTOR">Instructors</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-content-secondary uppercase tracking-wider">Priority:</span>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="border border-border rounded-2xl px-3 py-1.5 bg-chrome text-content-primary outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold"
                        >
                            <option value="">All Priorities</option>
                            <option value="INFO">Info</option>
                            <option value="IMPORTANT">Important</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : announcements.length === 0 ? (
                <div className="bg-surface rounded-2xl p-12 text-center border border-border shadow-sm">
                    <Megaphone className="w-12 h-12 text-content-muted mx-auto mb-4" />
                    <p className="text-content-secondary font-medium">No announcements match your search criteria</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {announcements.map((item) => (
                        <div key={item.id} className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div>
                                <div className={`h-1.5 w-full ${item.priority === 'URGENT' ? 'bg-red-500' :
                                    item.priority === 'IMPORTANT' ? 'bg-amber-500' : 'bg-indigo-500'
                                    }`} />
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${item.targetAudience === 'ALL' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            item.targetAudience === 'STUDENT' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            }`}>
                                            {item.targetAudience}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handleOpenEditModal(item)} className="text-content-muted hover:text-indigo-600 transition-colors p-1.5 rounded-lg hover:bg-chrome">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setDeleteConfirmId(item.id!)} className="text-content-muted hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-chrome">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-content-primary mb-2">{item.title}</h3>
                                    <p className="text-content-secondary text-sm mb-6 line-clamp-4 leading-relaxed">{item.content}</p>
                                </div>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-content-muted">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(item.createdAt!).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <AlertTriangle className={`w-3.5 h-3.5 ${item.priority === 'URGENT' ? 'text-red-500' :
                                            item.priority === 'IMPORTANT' ? 'text-amber-500' : 'text-blue-500'
                                            }`} />
                                        <span className="font-bold">{item.priority}</span>
                                    </div>
                                    {item.expiryDate && (
                                        <div className="flex items-center gap-1 text-red-500 font-medium">
                                            <span>Expires: {new Date(item.expiryDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editId ? "Edit Announcement" : "New Announcement"}
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-2xl font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="announcement-form"
                            className="px-5 py-2 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center"
                        >
                            {editId ? "Save Changes" : "Post Announcement"}
                        </button>
                    </>
                }
            >
                <form id="announcement-form" onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-content-primary mb-1.5 ml-1">Title</label>
                        <input
                            required
                            className="w-full px-4 py-2.5 border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-chrome text-content-primary"
                            placeholder="Brief title for the announcement..."
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-content-primary mb-1.5 ml-1">Content</label>
                        <textarea
                            required
                            rows={4}
                            className="w-full px-4 py-2.5 border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all bg-chrome text-content-primary"
                            placeholder="Write your announcement details here..."
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-content-primary mb-1.5 ml-1">Target Audience</label>
                            <select
                                className="w-full px-4 py-2.5 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 bg-chrome text-content-primary font-bold"
                                value={formData.targetAudience}
                                onChange={e => setFormData({ ...formData, targetAudience: e.target.value as any })}
                            >
                                <option value="ALL">Everyone</option>
                                <option value="STUDENT">Students Only</option>
                                <option value="INSTRUCTOR">Instructors Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-content-primary mb-1.5 ml-1">Priority</label>
                            <select
                                className="w-full px-4 py-2.5 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 bg-chrome text-content-primary font-bold"
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                            >
                                <option value="INFO">Information</option>
                                <option value="IMPORTANT">Important</option>
                                <option value="URGENT">Urgent!</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-content-primary mb-1.5 ml-1">Expiry Date (Optional)</label>
                        <input
                            type="datetime-local"
                            className="w-full px-4 py-2.5 border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-chrome text-content-primary"
                            value={formData.expiryDate}
                            onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                        />
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirmId}
                onClose={() => setDeleteConfirmId(null)}
                title="Confirm Deletion"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-2xl font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                            className="px-5 py-2 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                        </button>
                    </>
                }
            >
                <div className="py-4 text-content-secondary flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-content-primary mb-1">Are you sure you want to delete this announcement?</p>
                        <p className="text-xs text-content-muted">This action cannot be undone and will remove it permanently.</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AnnouncementManagementPage;
