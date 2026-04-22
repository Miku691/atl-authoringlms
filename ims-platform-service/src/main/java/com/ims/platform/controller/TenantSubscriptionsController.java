package com.ims.platform.controller;

import com.ims.platform.dto.ImsTenantSubscriptionsDto;
import com.ims.platform.service.TenantSubscriptionsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/platform/tenant")
@RequiredArgsConstructor
public class TenantSubscriptionsController {

    private final TenantSubscriptionsService service;

    /**
     * Internal/Secured API to fetch tenant limits and subscription status.
     * Used by other microservices to enforce limits.
     */
    @GetMapping("/{tenantId}/limits")
    public ResponseEntity<ImsTenantSubscriptionsDto> getTenantLimits(@PathVariable String tenantId) {
        return ResponseEntity.ok(service.getTenantSubscription(tenantId));
    }

    /**
     * API to manually provision a plan to a tenant (e.g., during onboarding).
     */
    @PostMapping("/{tenantId}/provision")
    public ResponseEntity<Void> provisionPlan(@PathVariable String tenantId, @RequestParam String planName) {
        service.createInitialSubscription(tenantId, planName);
        return ResponseEntity.ok().build();
    }
}
