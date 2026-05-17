import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import { messageService, type MessageBroadcast, type BroadcastRequest } from '../../../../api/messageService';
import {
    Plus,
    Send,
    Mail,
    Bell,
    Calendar,
    CheckCircle2,
    Loader2,
    MessageSquare,
    AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../../../../components/common/Modal';

const MessageManagementPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [broadcasts, setBroadcasts] = useState<MessageBroadcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Pagination
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [formData, setFormData] = useState({
        subject: '',
        messageBody: '',
        targetAudience: 'ALL',
        channel: 'BOTH',
        customEmails: '',
        customUserIds: '',
    });

    const fetchBroadcasts = useCallback(async () => {
        if (!user?.tenantId) return;
        setLoading(true);
        try {
            const response = await messageService.getBroadcastHistory(user.tenantId, page, 10);
            if (response.apiData) {
                setBroadcasts(response.apiData.content || []);
                setTotalPages(response.apiData.totalPages || 1);
            }
        } catch (error) {
            console.error("Failed to load broadcast history", error);
            toast.error("Failed to load broadcast history");
        } finally {
            setLoading(false);
        }
    }, [user?.tenantId, page]);

    useEffect(() => {
        if (user?.tenantId) {
            fetchBroadcasts();
        }
    }, [fetchBroadcasts, user?.tenantId]);

    const handleOpenModal = () => {
        setFormData({
            subject: '',
            messageBody: '',
            targetAudience: 'ALL',
            channel: 'BOTH',
            customEmails: '',
            customUserIds: '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.tenantId) return;

        setSubmitting(true);
        try {
            const recipientEmails = formData.customEmails
                ? formData.customEmails.split(',').map(s => s.trim()).filter(Boolean)
                : ['test1@example.com', 'test2@example.com']; // Fallback demo emails if ALL selected

            const recipientUserIds = formData.customUserIds
                ? formData.customUserIds.split(',').map(s => s.trim()).filter(Boolean)
                : ['user-1', 'user-2']; // Fallback demo user IDs if ALL selected

            const payload: BroadcastRequest = {
                tenantId: user.tenantId,
                senderId: user.id || 'admin',
                subject: formData.subject,
                messageBody: formData.messageBody,
                targetAudience: formData.targetAudience,
                channel: formData.channel,
                recipientEmails: formData.channel === 'EMAIL' || formData.channel === 'BOTH' ? recipientEmails : undefined,
                recipientUserIds: formData.channel === 'IN_APP' || formData.channel === 'BOTH' ? recipientUserIds : undefined,
            };

            await messageService.sendBroadcast(payload);
            toast.success("Broadcast dispatched successfully!");
            setIsModalOpen(false);
            fetchBroadcasts();
        } catch (error) {
            console.error("Failed to send broadcast", error);
            toast.error("Failed to send broadcast");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary">Messages & Broadcasts</h1>
                    <p className="text-content-secondary">Multi-channel messaging hub for Email and In-App alerts</p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 font-bold"
                >
                    <Plus className="w-4 h-4" />
                    New Broadcast
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : broadcasts.length === 0 ? (
                <div className="bg-surface rounded-2xl p-12 text-center border border-border shadow-sm">
                    <MessageSquare className="w-12 h-12 text-content-muted mx-auto mb-4" />
                    <p className="text-content-secondary font-medium mb-2">No broadcasts sent yet</p>
                    <button
                        onClick={handleOpenModal}
                        className="text-indigo-600 hover:text-indigo-700 font-bold text-sm inline-flex items-center gap-1"
                    >
                        <span>Send your first broadcast</span>
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {broadcasts.map((item) => (
                            <div key={item.id} className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-all flex flex-col justify-between p-6">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                item.targetAudience === 'ALL' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                item.targetAudience === 'STUDENTS' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            }`}>
                                                {item.targetAudience}
                                            </span>
                                            <div className="flex items-center gap-1.5 bg-chrome px-2.5 py-1 rounded-full border border-border">
                                                {item.channel === 'EMAIL' || item.channel === 'BOTH' ? (
                                                    <Mail className="w-3 h-3 text-amber-500" />
                                                ) : null}
                                                {item.channel === 'IN_APP' || item.channel === 'BOTH' ? (
                                                    <Bell className="w-3 h-3 text-blue-500" />
                                                ) : null}
                                                <span className="text-[10px] font-bold text-content-secondary">{item.channel}</span>
                                            </div>
                                        </div>
                                        <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                                            item.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                        }`}>
                                            {item.status === 'SENT' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                            {item.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-content-primary mb-2">{item.subject}</h3>
                                    <p className="text-content-secondary text-sm mb-6 line-clamp-3 leading-relaxed">{item.messageBody}</p>
                                </div>
                                <div className="border-t border-border pt-4 flex items-center justify-between text-xs text-content-muted font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(item.sentAt).toLocaleString()}
                                    </div>
                                    <span className="text-content-secondary font-bold">Sender: #{item.senderId.substring(0, 8)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 pt-4">
                            <button
                                disabled={page === 0}
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 border border-border rounded-2xl bg-chrome text-content-primary font-bold disabled:opacity-50 hover:bg-surface transition-colors text-sm"
                            >
                                Previous
                            </button>
                            <span className="text-sm font-bold text-content-secondary">
                                Page {page + 1} of {totalPages}
                            </span>
                            <button
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 border border-border rounded-2xl bg-chrome text-content-primary font-bold disabled:opacity-50 hover:bg-surface transition-colors text-sm"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* New Broadcast Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="New Multi-Channel Broadcast"
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
                            form="broadcast-form"
                            disabled={submitting}
                            className="px-5 py-2 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>Send Broadcast</span>
                                </>
                            )}
                        </button>
                    </>
                }
            >
                <form id="broadcast-form" onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-content-primary mb-1.5 ml-1">Subject</label>
                        <input
                            required
                            className="w-full px-4 py-2.5 border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-chrome text-content-primary"
                            placeholder="Broadcast subject line..."
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-content-primary mb-1.5 ml-1">Message Body</label>
                        <textarea
                            required
                            rows={4}
                            className="w-full px-4 py-2.5 border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all bg-chrome text-content-primary"
                            placeholder="Write your broadcast message details here..."
                            value={formData.messageBody}
                            onChange={e => setFormData({ ...formData, messageBody: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-content-primary mb-1.5 ml-1">Target Audience</label>
                            <select
                                className="w-full px-4 py-2.5 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 bg-chrome text-content-primary font-bold"
                                value={formData.targetAudience}
                                onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
                            >
                                <option value="ALL">Everyone</option>
                                <option value="STUDENTS">All Students</option>
                                <option value="INSTRUCTORS">All Instructors</option>
                                <option value="STAFF">All Staff</option>
                                <option value="SPECIFIC">Specific Recipients</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-content-primary mb-1.5 ml-1">Delivery Channel</label>
                            <select
                                className="w-full px-4 py-2.5 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 bg-chrome text-content-primary font-bold"
                                value={formData.channel}
                                onChange={e => setFormData({ ...formData, channel: e.target.value })}
                            >
                                <option value="BOTH">Email & In-App</option>
                                <option value="EMAIL">Email Only</option>
                                <option value="IN_APP">In-App Only</option>
                            </select>
                        </div>
                    </div>

                    {formData.targetAudience === 'SPECIFIC' && (
                        <div className="space-y-4 pt-2 border-t border-border">
                            { (formData.channel === 'EMAIL' || formData.channel === 'BOTH') && (
                                <div>
                                    <label className="block text-sm font-bold text-content-primary mb-1.5 ml-1">Recipient Emails (Comma separated)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-chrome text-content-primary text-sm"
                                        placeholder="student1@example.com, teacher@example.com"
                                        value={formData.customEmails}
                                        onChange={e => setFormData({ ...formData, customEmails: e.target.value })}
                                    />
                                </div>
                            )}
                            { (formData.channel === 'IN_APP' || formData.channel === 'BOTH') && (
                                <div>
                                    <label className="block text-sm font-bold text-content-primary mb-1.5 ml-1">Recipient User IDs (Comma separated)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-chrome text-content-primary text-sm"
                                        placeholder="user-123, user-456"
                                        value={formData.customUserIds}
                                        onChange={e => setFormData({ ...formData, customUserIds: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    );
};

export default MessageManagementPage;
