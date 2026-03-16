package com.ims.finance.controller;

import com.ims.finance.dto.FeeInstallmentPlanRequest;
import com.ims.finance.dto.FeeInstallmentPlanResponse;
import com.ims.finance.dto.FeeInstallmentScheduleRequest;
import com.ims.finance.service.FeeInstallmentPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/finance/installment-plans")
@RequiredArgsConstructor
public class FeeInstallmentPlanController {

    private final FeeInstallmentPlanService planService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<?> createPlan(@RequestBody FeeInstallmentPlanRequest request) {
        FeeInstallmentPlanResponse response = planService.createPlan(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("apiData", response, "success", true));
    }

    @GetMapping("/offering/{offeringId}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT', 'STUDENT', 'GUARDIAN')")
    public ResponseEntity<?> getPlansByOffering(@PathVariable String offeringId) {
        List<FeeInstallmentPlanResponse> responses = planService.getPlansByOffering(offeringId);
        return ResponseEntity.ok(Map.of("apiData", responses, "success", true));
    }

    @GetMapping("/{planId}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT', 'STUDENT', 'GUARDIAN')")
    public ResponseEntity<?> getPlanById(@PathVariable String planId) {
        FeeInstallmentPlanResponse response = planService.getPlanById(planId);
        return ResponseEntity.ok(Map.of("apiData", response, "success", true));
    }

    @PostMapping("/{planId}/schedules")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<?> addSchedulesToPlan(
            @PathVariable String planId,
            @RequestBody List<FeeInstallmentScheduleRequest> requests) {
        FeeInstallmentPlanResponse response = planService.addSchedulesToPlan(planId, requests);
        return ResponseEntity.ok(Map.of("apiData", response, "success", true));
    }

    @DeleteMapping("/{planId}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<?> deletePlan(@PathVariable String planId) {
        planService.deletePlan(planId);
        return ResponseEntity.ok(Map.of("apiData", "Installment Plan deleted successfully", "success", true));
    }
}
