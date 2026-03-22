package com.ims.finance.dto;

import com.ims.finance.entity.StudentFeeRecord.FeeStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Data Transfer Object for StudentFeeRecord.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentFeeRecordDTO {

    private String id;
    private String studentId;
    private String feeHeadId;
    private String feeHeadName; // Extension: to show name in UI
    private String offeringId;
    private String academicYear;
    private BigDecimal amountDue;
    private BigDecimal amountPaid;
    private BigDecimal balance;
    private LocalDate dueDate;
    private BigDecimal lateFeeAmount;
    private Boolean lateFeeApplied;
    private FeeStatus status;
    private String tenantId;
}
