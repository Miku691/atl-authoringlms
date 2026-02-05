import api from '../utils/api';
import type {
    FeeHead,
    FeeStructure,
    FeeDiscount,
    LateFeeRule,
    CollectPaymentRequest,
    RefundRequest
} from '../types/finance';

const BASE_URL = '/ims-finance-service/api/v1/finance';

export const financeService = {
    // Fee Heads
    getFeeHeads: async () => {
        const response = await api.get(`${BASE_URL}/fee-heads`);
        return response.data.apiData;
    },

    createFeeHead: async (data: FeeHead) => {
        const response = await api.post(`${BASE_URL}/fee-heads`, data);
        return response.data.apiData;
    },

    updateFeeHead: async (id: string, data: Partial<FeeHead>) => {
        const response = await api.put(`${BASE_URL}/fee-heads/${id}`, data);
        return response.data.apiData;
    },

    deleteFeeHead: async (id: string) => {
        const response = await api.delete(`${BASE_URL}/fee-heads/${id}`);
        return response.data.apiData;
    },

    // Fee Structures
    getFeeStructures: async () => {
        const response = await api.get(`${BASE_URL}/fee-structures`);
        return response.data.apiData;
    },

    getFeeStructuresByOffering: async (offeringId: string) => {
        const response = await api.get(`${BASE_URL}/fee-structures/offering/${offeringId}`);
        return response.data.apiData;
    },

    createFeeStructure: async (data: FeeStructure) => {
        const response = await api.post(`${BASE_URL}/fee-structures`, data);
        return response.data.apiData;
    },

    updateFeeStructure: async (id: string, data: Partial<FeeStructure>) => {
        const response = await api.put(`${BASE_URL}/fee-structures/${id}`, data);
        return response.data.apiData;
    },

    deleteFeeStructure: async (id: string) => {
        const response = await api.delete(`${BASE_URL}/fee-structures/${id}`);
        return response.data.apiData;
    },

    // Fee Discounts
    getFeeDiscounts: async () => {
        const response = await api.get(`${BASE_URL}/fee-discounts`);
        return response.data.apiData;
    },

    createFeeDiscount: async (data: FeeDiscount) => {
        const response = await api.post(`${BASE_URL}/fee-discounts`, data);
        return response.data.apiData;
    },

    updateFeeDiscount: async (id: string, data: Partial<FeeDiscount>) => {
        const response = await api.put(`${BASE_URL}/fee-discounts/${id}`, data);
        return response.data.apiData;
    },

    deleteFeeDiscount: async (id: string) => {
        const response = await api.delete(`${BASE_URL}/fee-discounts/${id}`);
        return response.data.apiData;
    },

    // Late Fee Rules
    getLateFeeRules: async () => {
        const response = await api.get(`${BASE_URL}/late-fee-rules`);
        return response.data.apiData;
    },

    createLateFeeRule: async (data: LateFeeRule) => {
        const response = await api.post(`${BASE_URL}/late-fee-rules`, data);
        return response.data.apiData;
    },

    updateLateFeeRule: async (id: string, data: Partial<LateFeeRule>) => {
        const response = await api.put(`${BASE_URL}/late-fee-rules/${id}`, data);
        return response.data.apiData;
    },

    deleteLateFeeRule: async (id: string) => {
        const response = await api.delete(`${BASE_URL}/late-fee-rules/${id}`);
        return response.data.apiData;
    },

    // Student Ledger
    getStudentLedger: async (studentId: string) => {
        const response = await api.get(`${BASE_URL}/ledger/${studentId}`);
        return response.data.apiData;
    },

    getAllLedgerRecords: async () => {
        const response = await api.get(`${BASE_URL}/ledger`);
        return response.data.apiData;
    },

    allocateFees: async (studentId: string, offeringId: string, academicYear: string) => {
        const response = await api.post(`${BASE_URL}/ledger/allocate`, null, {
            params: { studentId, offeringId, academicYear }
        });
        return response.data;
    },

    getMyLedger: async () => {
        const response = await api.get(`${BASE_URL}/ledger/me`);
        return response.data.apiData;
    },

    getMySummary: async () => {
        const response = await api.get(`${BASE_URL}/ledger/me/summary`);
        return response.data.apiData;
    },

    getWardsLedger: async () => {
        const response = await api.get(`${BASE_URL}/ledger/wards`);
        return response.data.apiData;
    },

    // Collections
    collectPayment: async (data: CollectPaymentRequest) => {
        const response = await api.post(`${BASE_URL}/collect`, data);
        return response.data.apiData;
    },

    getStudentTransactions: async (studentId: string) => {
        const response = await api.get(`${BASE_URL}/transactions/${studentId}`);
        return response.data.apiData;
    },

    getMyTransactions: async () => {
        const response = await api.get(`${BASE_URL}/transactions/me`);
        return response.data.apiData;
    },

    getWardsTransactions: async () => {
        const response = await api.get(`${BASE_URL}/transactions/wards`);
        return response.data.apiData;
    },

    downloadReceipt: async (transactionId: string) => {
        const response = await api.get(`${BASE_URL}/transactions/${transactionId}/receipt`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Refunds
    processRefund: async (data: RefundRequest) => {
        const response = await api.post(`${BASE_URL}/refund`, data);
        return response.data.apiData;
    },

    // Demand Notes (Invoices)
    createDemandNote: async (data: any) => {
        const response = await api.post(`${BASE_URL.replace('/ledger', '')}/demand-notes`, data);
        return response.data;
    },

    getStudentDemandNotes: async (studentId: string) => {
        const response = await api.get(`${BASE_URL.replace('/ledger', '')}/demand-notes/student/${studentId}`);
        return response.data.apiData;
    },

    updateDemandNoteStatus: async (id: string, status: string) => {
        const response = await api.patch(`${BASE_URL.replace('/ledger', '')}/demand-notes/${id}/status?status=${status}`);
        return response.data.apiData;
    },

    deleteDemandNote: async (id: string) => {
        const response = await api.delete(`${BASE_URL.replace('/ledger', '')}/demand-notes/${id}`);
        return response.data.apiData;
    }
};
