import api from '../utils/api';

export interface Staff {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    employeeId: string;
    joinDate: string;
    status: string;
    dob: string;
    gender: string;
    address: string;
    role: string;
    department: string;
    tenantId?: string;
    profileImageUrl?: string;
    monthlySalary?: number;
    qualification?: string;
    experience?: string;
}

export const staffService = {
    getAllStaff: async (page = 0, size = 10) => {
        const response = await api.get(`/ims-staff-service/staff?page=${page}&size=${size}`);
        return response.data;
    },

    getStaffByTenant: async (tenantId: string, page = 0, size = 10) => {
        const response = await api.get(`/ims-staff-service/staff/tenant/${tenantId}?page=${page}&size=${size}`);
        return response.data;
    },

    getStaffById: async (id: string) => {
        const response = await api.get(`/ims-staff-service/staff/${id}`);
        return response.data;
    },

    createStaff: async (data: Partial<Staff>) => {
        const response = await api.post('/ims-staff-service/staff', data);
        return response.data;
    },

    updateStaff: async (id: string, data: Partial<Staff>) => {
        const response = await api.put(`/ims-staff-service/staff/${id}`, data);
        return response.data;
    },

    deleteStaff: async (id: string) => {
        const response = await api.delete(`/ims-staff-service/staff/${id}`);
        return response.data;
    }
};
