package com.ims.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeInstallmentScheduleResponse {
    private String id;
    private String feeHeadId;
    private String feeHeadName; // Useful for UI
    private Integer installmentNumber;
    private BigDecimal amount;
    private LocalDate dueDate;
    private String lateFeeRuleId;
}
