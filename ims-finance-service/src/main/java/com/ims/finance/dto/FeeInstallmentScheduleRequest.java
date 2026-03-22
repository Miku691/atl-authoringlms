package com.ims.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for adding/updating an installment schedule to a plan.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeInstallmentScheduleRequest {
    private String feeHeadId;
    private Integer installmentNumber;
    private BigDecimal amount;
    private LocalDate dueDate;
    private String lateFeeRuleId;
}
