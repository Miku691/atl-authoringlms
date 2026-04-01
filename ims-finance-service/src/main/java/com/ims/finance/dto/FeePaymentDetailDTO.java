package com.ims.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * Data Transfer Object for specific fee head allocation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeePaymentDetailDTO {
    private String feeRecordId;
    private BigDecimal amount;
}
