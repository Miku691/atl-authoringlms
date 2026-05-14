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
    offeringId: string | null;
    levelId?: string;
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
    scope?: 'GLOBAL' | 'SIBLING' | 'MERIT' | 'CUSTOM';
    applicableFeeHeadIds?: string[];
}

export interface StudentFeeConcession {
    id?: string;
    studentId: string;
    feeDiscountId: string;
    academicYear: string;
    status?: string;
    remarks?: string;
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
    lateFeeAmount?: number;
    lateFeeApplied?: boolean;
    dueDate: string;
    status: FeeStatus;
    tenantId: string;
    installmentScheduleId?: string;
}

export interface Transaction {
    id: string;
    studentId: string;
    amount: number;
    paymentMode: PaymentMode;
    referenceNumber?: string;
    transactionDate: string;
    studentName?: string;
    offeringName?: string;
    tenantId: string;
    collectedBy: string;
    receiptNo?: string;
    feeHeadName?: string;
}

export interface FeePaymentDetail {
    feeRecordId: string;
    amount: number;
}

export interface CollectPaymentRequest {
    studentId: string;
    amount: number;
    paymentMode: PaymentMode;
    referenceNumber?: string;
    feeRecordIds?: string[];
    splitBreakdown?: FeePaymentDetail[];
    waiveLateFee?: boolean;
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

export interface FeeInstallmentSchedule {
    id?: string;
    feeHeadId: string;
    feeHeadName?: string;
    installmentNumber: number;
    amount: number;
    dueDate: string;
}

export interface FeeInstallmentPlan {
    id?: string;
    name: string;
    description?: string;
    offeringId: string;
    academicYear: string;
    schedules?: FeeInstallmentSchedule[];
}

export interface DefaulterDTO {
    studentId: string;
    studentName: string;
    offeringId: string;
    offeringName?: string;
    totalOverdue: number;
    totalLateFee: number;
    overdueInstallmentsCount: number;
    earliestDueDate: string;
}

export interface ExpenseCategory {
    id?: string;
    name: string;
    description?: string;
    tenantId?: string;
}

export interface Expense {
    id?: string;
    categoryId: string;
    categoryName?: string;
    amount: number;
    description: string;
    expenseDate: string;
    paymentMethod: string;
    referenceNo?: string;
    tenantId?: string;
}

export interface Budget {
    id?: string;
    categoryId: string;
    categoryName?: string;
    allocatedAmount: number;
    actualSpend?: number;
    academicYear: string;
    tenantId?: string;
}

export interface OutstandingFee {
    studentId: string;
    studentName: string;
    enrollmentId: string;
    offeringId: string;
    offeringName?: string;
    totalAllocated: number;
    totalPaid: number;
    totalOverdue: number;
    balance: number;
}

export interface IncomeExpenseReport {
    academicYear: string;
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    incomeByCategory: Record<string, number>;
    expenseByCategory: Record<string, number>;
}

