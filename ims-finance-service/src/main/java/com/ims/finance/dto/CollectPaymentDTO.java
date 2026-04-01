package com.ims.finance.dto;

import com.ims.finance.entity.Transaction.PaymentMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

/**
 * Data Transfer Object for collecting payment.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CollectPaymentDTO {

    @NotBlank(message = "Student ID is mandatory")
    private String studentId;

    @NotNull(message = "Amount is mandatory")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Payment mode is mandatory")
    private PaymentMode paymentMode;

    private String referenceNumber;

    /**
     * Optional: List of specific fee record IDs to pay against.
     * If null or empty, payment will be applied to the oldest records first (FIFO).
     */
    private List<String> feeRecordIds;

    /**
     * Whether to waive the applied late fee for the targeted fee records.
     */
    private Boolean waiveLateFee;

    /**
     * Specific breakdown of amounts per fee head record.
     * This allows splitting a single transaction into multiple fee heads specifically.
     */
    private List<FeePaymentDetailDTO> splitBreakdown;
}
