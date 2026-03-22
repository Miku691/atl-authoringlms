package com.ims.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutstandingFeeDTO {
    private String studentId;
    private String studentName;
    private String enrollmentId;
    private String offeringId;
    private String offeringName;
    private BigDecimal totalAllocated;
    private BigDecimal totalPaid;
    private BigDecimal totalOverdue;
    private BigDecimal balance;
}
