package com.atl.auth.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "IMS-PLATFORM-SERVICE")
public interface PlatformClient {

    /**
     * Provisions the initial subscription plan for a newly registered tenant.
     * @param tenantId The unique ID of the tenant.
     * @param planName The name of the plan to provision (e.g., 'Starter (FREE)', 'Professional (PRO)').
     */
    @PostMapping("/api/v1/platform/tenant/{tenantId}/provision")
    void provisionPlan(@PathVariable("tenantId") String tenantId, @RequestParam("planName") String planName);
}
