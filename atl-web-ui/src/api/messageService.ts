import api from '../utils/api';

export interface BroadcastRequest {
    tenantId: string;
    senderId: string;
    subject: string;
    messageBody: string;
    targetAudience: string;
    channel: string;
    attachmentUrl?: string;
    recipientUserIds?: string[];
    recipientEmails?: string[];
}

export interface MessageBroadcast {
    id: string;
    tenantId: string;
    senderId: string;
    subject: string;
    messageBody: string;
    targetAudience: string;
    channel: string;
    status: string;
    attachmentUrl?: string;
    sentAt: string;
}

export interface InAppNotification {
    id: string;
    broadcastId: string;
    recipientUserId: string;
    tenantId: string;
    subject: string;
    messageBody: string;
    isRead: boolean;
    createdAt: string;
    readAt?: string;
}

export const messageService = {
    sendBroadcast: async (data: BroadcastRequest) => {
        const response = await api.post('/ims-academic-service/messages/broadcast', data);
        return response.data;
    },

    getBroadcastHistory: async (tenantId: string, page = 0, size = 10) => {
        const response = await api.get(`/ims-academic-service/messages/broadcasts/tenant/${tenantId}?page=${page}&size=${size}`);
        return response.data;
    },

    getUnreadNotifications: async (userId: string, tenantId: string) => {
        const response = await api.get(`/ims-academic-service/messages/notifications/unread?userId=${userId}&tenantId=${tenantId}`);
        return response.data;
    },

    getAllNotifications: async (userId: string, tenantId: string) => {
        const response = await api.get(`/ims-academic-service/messages/notifications/all?userId=${userId}&tenantId=${tenantId}`);
        return response.data;
    },

    markAsRead: async (id: string) => {
        const response = await api.put(`/ims-academic-service/messages/notifications/${id}/read`);
        return response.data;
    }
};
