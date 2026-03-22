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
public class DefaulterDTO {
    private String studentId;
    private String studentName; // To be fetched from StudentServiceClient
    private String offeringId;
    private String offeringName; // To be fetched from AcademicService
    private BigDecimal totalOverdue;
    private BigDecimal totalLateFee;
    private int overdueInstallmentsCount;
    private LocalDate earliestDueDate;
}
