package com.ims.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Response DTO returning the plan and its generated schedules.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeInstallmentPlanResponse {
    private String id;
    private String name;
    private String description;
    private String offeringId;
    private String academicYear;
    private List<FeeInstallmentScheduleResponse> schedules;
}
