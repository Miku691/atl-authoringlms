package com.ims.platform.controller;

import com.ims.platform.dto.ImsTenantSubscriptionsDto;
import com.ims.platform.service.TenantSubscriptionsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/platform/tenant")
@RequiredArgsConstructor
public class TenantSubscriptionController {

    private final TenantSubscriptionsService service;

    /**
     * Fetch current active subscription for a specific tenant.
     * Accessible by TENANT_ADMIN of that tenant.
     */
    @GetMapping("/{tenantId}/subscription")
    public ResponseEntity<ImsTenantSubscriptionsDto> getTenantSubscription(@PathVariable String tenantId) {
        return ResponseEntity.ok(service.getTenantSubscription(tenantId));
    }
}
