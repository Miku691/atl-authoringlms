package com.ims.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DemandNoteDTO {
    private String id;
    private String studentId;
    private String academicYear;
    private String billingMonth;
    private String feeHeadId;
    private String feeHeadName;
    private BigDecimal amount;
    private BigDecimal amountPaid;
    private BigDecimal balance;
    private LocalDate dueDate;
    private String description;
    private String status;
    private String tenantId;
}
