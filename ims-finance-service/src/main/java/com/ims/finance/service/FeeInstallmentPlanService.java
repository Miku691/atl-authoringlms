package com.ims.finance.service;

import com.ims.finance.dto.FeeInstallmentPlanRequest;
import com.ims.finance.dto.FeeInstallmentPlanResponse;
import com.ims.finance.dto.FeeInstallmentScheduleRequest;

import java.util.List;

public interface FeeInstallmentPlanService {
    FeeInstallmentPlanResponse createPlan(FeeInstallmentPlanRequest request);
    List<FeeInstallmentPlanResponse> getPlansByOffering(String offeringId);
    FeeInstallmentPlanResponse getPlanById(String planId);
    FeeInstallmentPlanResponse addSchedulesToPlan(String planId, List<FeeInstallmentScheduleRequest> schedules);
    void deletePlan(String planId);
}
