package com.ims.platform.service;

import com.ims.platform.dto.ImsTenantSubscriptionsDto;

public interface TenantSubscriptionsService {
    ImsTenantSubscriptionsDto getTenantSubscription(String tenantId);
    void createInitialSubscription(String tenantId, String planName);
}
