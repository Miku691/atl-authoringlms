import api from '../utils/api';
import type {
    FeeHead,
    FeeStructure,
    FeeDiscount,
    LateFeeRule,
    CollectPaymentRequest,
    RefundRequest,
    FeeInstallmentPlan,
    FeeInstallmentSchedule,
    ExpenseCategory,
    Expense,
    Budget
} from '../types/finance';

export interface Transaction {
    balance: number;
    status: 'PAID' | 'PARTIAL' | 'UNPAID';
}

export interface CollectionSummary {
    todayCollection: number;
    monthCollection: number;
    yearCollection: number;
    collectionByOffering: Record<string, number>;
    offeringNames: Record<string, string>;
    recentTransactions: Transaction[];
    pendingReceivables: number;
    monthlyTrend: { month: string; income: number; expense: number }[];
    feeDistribution: { name: string; value: number }[];
}

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

    // Student Fee Concessions
    grantConcession: async (data: any) => {
        const response = await api.post(`${BASE_URL}/concessions`, data);
        return response.data.apiData;
    },

    getConcessionsByStudent: async (studentId: string) => {
        const response = await api.get(`${BASE_URL}/concessions/student/${studentId}`);
        return response.data.apiData;
    },

    revokeConcession: async (id: string) => {
        const response = await api.delete(`${BASE_URL}/concessions/${id}/revoke`);
        return response.data;
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

    bulkAllocateFees: async (offeringId: string, academicYear: string) => {
        const response = await api.post(`${BASE_URL}/ledger/bulk-allocate?offeringId=${offeringId}&academicYear=${academicYear}`);
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
    },

    getCollectionSummary: async () => {
        const response = await api.get(`${BASE_URL}/stats/collection-summary`);
        return response.data.apiData;
    },

    // Installment Plans
    createInstallmentPlan: async (data: Partial<FeeInstallmentPlan>) => {
        const response = await api.post(`${BASE_URL}/installment-plans`, data);
        return response.data.apiData;
    },

    getInstallmentPlansByOffering: async (offeringId: string) => {
        const response = await api.get(`${BASE_URL}/installment-plans/offering/${offeringId}`);
        return response.data.apiData;
    },

    getInstallmentPlanById: async (planId: string) => {
        const response = await api.get(`${BASE_URL}/installment-plans/${planId}`);
        return response.data.apiData;
    },

    addSchedulesToPlan: async (planId: string, schedules: Partial<FeeInstallmentSchedule>[]) => {
        const response = await api.post(`${BASE_URL}/installment-plans/${planId}/schedules`, schedules);
        return response.data.apiData;
    },

    deleteInstallmentPlan: async (planId: string) => {
        const response = await api.delete(`${BASE_URL}/installment-plans/${planId}`);
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

    // Reports
    getDefaulters: async (offeringId?: string) => {
        const url = offeringId ? `${BASE_URL}/stats/defaulters?offeringId=${offeringId}` : `${BASE_URL}/stats/defaulters`;
        const response = await api.get(url);
        return response.data.apiData;
    },

    // Expenses
    getExpenseCategories: async () => {
        const response = await api.get(`${BASE_URL}/expenses/categories`);
        return response.data.apiData;
    },

    createExpenseCategory: async (data: ExpenseCategory) => {
        const response = await api.post(`${BASE_URL}/expenses/categories`, data);
        return response.data.apiData;
    },

    deleteExpenseCategory: async (id: string) => {
        const response = await api.delete(`${BASE_URL}/expenses/categories/${id}`);
        return response.data;
    },

    getExpenses: async () => {
        const response = await api.get(`${BASE_URL}/expenses`);
        return response.data.apiData;
    },

    recordExpense: async (data: Expense) => {
        const response = await api.post(`${BASE_URL}/expenses`, data);
        return response.data.apiData;
    },

    deleteExpense: async (id: string) => {
        const response = await api.delete(`${BASE_URL}/expenses/${id}`);
        return response.data;
    },

    // Budgets
    getBudgets: async (academicYear: string) => {
        const response = await api.get(`${BASE_URL}/budgets?academicYear=${academicYear}`);
        return response.data.apiData;
    },

    saveBudget: async (data: Budget) => {
        const response = await api.post(`${BASE_URL}/budgets`, data);
        return response.data.apiData;
    },

    getBudgetReport: async (academicYear: string) => {
        const response = await api.get(`${BASE_URL}/budgets/report?academicYear=${academicYear}`);
        return response.data.apiData;
    },

    deleteBudget: async (id: string) => {
        const response = await api.delete(`${BASE_URL}/budgets/${id}`);
        return response.data;
    },

    // Advanced Reports
    getDayBook: async (date: string) => {
        const response = await api.get(`${BASE_URL}/reports/day-book?date=${date}`);
        return response.data.apiData;
    },

    getOutstandingFees: async () => {
        const response = await api.get(`${BASE_URL}/reports/outstanding`);
        return response.data.apiData;
    },

    getIncomeExpenseReport: async (academicYear: string) => {
        const response = await api.get(`${BASE_URL}/reports/income-expense?academicYear=${academicYear}`);
        return response.data.apiData;
    },

    // Bulk Setup
    getBulkSetupStatus: async () => {
        const response = await api.get(`/ims-finance-service/api/v1/finance/bulk-setup/status`);
        return response.data;
    },
    setupFeeHeads: async () => {
        const response = await api.post(`/ims-finance-service/api/v1/finance/bulk-setup/fee-heads`);
        return response.data;
    },
    setupExpenseCategories: async () => {
        const response = await api.post(`/ims-finance-service/api/v1/finance/bulk-setup/expense-categories`);
        return response.data;
    }
};
