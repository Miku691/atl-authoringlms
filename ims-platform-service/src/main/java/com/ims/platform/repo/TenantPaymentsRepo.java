package com.ims.platform.repo;

import com.ims.platform.entity.ImsTenantPayments;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TenantPaymentsRepo extends JpaRepository<ImsTenantPayments, String> {
    Optional<ImsTenantPayments> findByRazorpayOrderId(String orderId);
    List<ImsTenantPayments> findByTenantIdOrderByCreatedAtDesc(String tenantId);
}
