export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type PaymentMode = 'CASH' | 'ONLINE' | 'CHEQUE' | 'BANK_TRANSFER';
export type FeeStatus = 'PAID' | 'PARTIAL' | 'UNPAID';

export interface FeeHead {
    id?: string;
    name: string;
    description?: string;
    tenantId?: string;
}

export interface FeeStructure {
    id?: string;
    feeHeadId: string;
    offeringId: string;
    amount: number;
    academicYear: string;
    tenantId?: string;
}

export interface FeeDiscount {
    id?: string;
    name: string;
    type: DiscountType;
    value: number;
    tenantId?: string;
}

export interface LateFeeRule {
    id?: string;
    name: string;
    type: DiscountType;
    value: number;
    gracePeriodDays: number;
    tenantId?: string;
}

export interface StudentFeeRecord {
    id: string;
    studentId: string;
    feeHeadId: string;
    feeHeadName?: string;
    offeringId: string;
    academicYear: string;
    amountDue: number;
    amountPaid: number;
    balance: number;
    dueDate: string;
    status: FeeStatus;
    tenantId: string;
}

export interface Transaction {
    id: string;
    studentId: string;
    amount: number;
    paymentMode: PaymentMode;
    referenceNumber?: string;
    transactionDate: string;
    tenantId: string;
    collectedBy: string;
}

export interface CollectPaymentRequest {
    studentId: string;
    amount: number;
    paymentMode: PaymentMode;
    referenceNumber?: string;
    feeRecordIds?: string[];
}

export interface RefundRequest {
    studentId: string;
    studentFeeRecordId: string;
    amount: number;
    refundMode: string;
    reason?: string;
}

export interface Refund {
    id: string;
    studentId: string;
    studentFeeRecordId: string;
    amount: number;
    refundMode: string;
    reason?: string;
    refundDate: string;
    processedBy: string;
    tenantId: string;
}

export interface FinanceSummary {
    totalDue: number;
    totalPaid: number;
    balance: number;
    pendingInvoices: number;
}

export interface DemandNote {
    id?: string;
    studentId: string;
    academicYear: string;
    billingMonth: string;
    feeHeadId: string;
    feeHeadName: string;
    amount: number;
    amountPaid: number;
    balance: number;
    dueDate: string;
    description: string;
    status: 'PENDING' | 'PAID' | 'PARTIAL';
    tenantId?: string;
}
