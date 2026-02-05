package com.ims.finance.dto;

import com.ims.finance.entity.Transaction.PaymentMode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Transaction.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
    private String id;
    private String studentId;
    private BigDecimal amount;
    private PaymentMode paymentMode;
    private String referenceNumber;
    private LocalDateTime transactionDate;
    private String tenantId;
    private String collectedBy;
}
