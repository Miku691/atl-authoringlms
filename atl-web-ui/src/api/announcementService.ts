import api from '../utils/api';

export interface Announcement {
    id?: string;
    tenantId: string;
    title: string;
    content: string;
    targetAudience: 'ALL' | 'STUDENT' | 'INSTRUCTOR';
    priority: 'INFO' | 'IMPORTANT' | 'URGENT';
    expiryDate?: string;
    createdAt?: string;
}

export const announcementService = {
    createAnnouncement: async (data: Announcement) => {
        const response = await api.post('/ims-academic-service/announcements', data);
        return response.data;
    },

    getAnnouncementById: async (id: string) => {
        const response = await api.get(`/ims-academic-service/announcements/${id}`);
        return response.data;
    },

    getAnnouncementsByTenant: async (tenantId: string) => {
        const response = await api.get(`/ims-academic-service/announcements/tenant/${tenantId}`);
        return response.data;
    },

    getFilteredAnnouncements: async (tenantId: string, audience?: string, priority?: string, search?: string) => {
        const params = new URLSearchParams();
        if (audience) params.append('audience', audience);
        if (priority) params.append('priority', priority);
        if (search) params.append('search', search);
        const response = await api.get(`/ims-academic-service/announcements/tenant/${tenantId}/filter?${params.toString()}`);
        return response.data;
    },

    updateAnnouncement: async (id: string, data: Partial<Announcement>) => {
        const response = await api.put(`/ims-academic-service/announcements/${id}`, data);
        return response.data;
    },

    getActiveAnnouncements: async (tenantId: string, audience: string) => {
        const response = await api.get(`/ims-academic-service/announcements/tenant/${tenantId}/active?audience=${audience}`);
        return response.data;
    },

    deleteAnnouncement: async (id: string) => {
        const response = await api.delete(`/ims-academic-service/announcements/${id}`);
        return response.data;
    }
};
