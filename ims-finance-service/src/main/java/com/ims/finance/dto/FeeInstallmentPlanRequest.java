package com.ims.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a new Fee Installment Plan.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeInstallmentPlanRequest {
    private String name;
    private String description;
    private String offeringId;
    private String academicYear;
}
