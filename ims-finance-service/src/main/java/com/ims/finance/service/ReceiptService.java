package com.ims.finance.service;

import com.ims.finance.dto.TransactionDTO;

public interface ReceiptService {
    /**
     * Generates a PDF receipt for a given transaction.
     *
     * @param transactionDTO transaction details
     * @return PDF byte array
     */
    byte[] generateReceipt(TransactionDTO transactionDTO);
}
