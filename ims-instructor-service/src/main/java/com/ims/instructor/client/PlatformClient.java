package com.ims.instructor.client;

import com.ims.instructor.dto.SubscriptionLimitsDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ims-platform-service", path = "/api/v1/platform/tenant")
public interface PlatformClient {

    @GetMapping("/{tenantId}/limits")
    SubscriptionLimitsDto getTenantLimits(@PathVariable("tenantId") String tenantId);
}
