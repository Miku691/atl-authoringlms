package com.ims.finance.service;

import com.ims.finance.dto.CollectPaymentDTO;
import com.ims.finance.dto.CollectionSummaryDTO;
import com.ims.finance.dto.RefundDTO;
import com.ims.finance.dto.TransactionDTO;
import java.util.List;

public interface FinanceService {
    /**
     * Retrieves a summary of collections for the dashboard.
     *
     * @return collection summary
     */
    CollectionSummaryDTO getCollectionSummary();
    /**
     * Collects a payment from a student and updates their ledger.
     *
     * @param collectPaymentDTO payment details
     * @return transaction record
     */
    TransactionDTO collectPayment(CollectPaymentDTO collectPaymentDTO);

    /**
     * Retrieves all transactions for a specific student.
     *
     * @param studentId student ID
     * @return list of transactions
     */
    List<TransactionDTO> getStudentTransactions(String studentId);

    /**
     * Retrieves a specific transaction by its ID.
     *
     * @param transactionId transaction ID
     * @return transaction details
     */
    TransactionDTO getTransactionById(String transactionId);

    /**
     * Processes a refund for a student fee record.
     *
     * @param refundDTO refund details
     * @return processed refund data
     */
    RefundDTO processRefund(RefundDTO refundDTO);

    /**
     * Retrieves transactions for the logged-in student.
     *
     * @return list of transactions
     */
    List<TransactionDTO> getMyTransactions();

    /**
     * Retrieves transactions for all wards of the logged-in guardian.
     *
     * @return map of ward IDs to their transactions
     */
    java.util.Map<String, List<TransactionDTO>> getWardsTransactions();
}
