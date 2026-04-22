package com.ims.platform.repo;

import com.ims.platform.entity.ImsTenantSubscriptions;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TenantSubscriptionsRepo extends JpaRepository<ImsTenantSubscriptions, String> {
    Optional<ImsTenantSubscriptions> findByTenantId(String tenantId);
    Optional<ImsTenantSubscriptions> findByTenantIdAndStatus(String tenantId, String status);
}
