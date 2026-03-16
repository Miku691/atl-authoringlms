package com.ims.finance.repository;

import com.ims.finance.entity.FeeInstallmentPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeInstallmentPlanRepository extends JpaRepository<FeeInstallmentPlan, String> {
    List<FeeInstallmentPlan> findByOfferingIdAndTenantId(String offeringId, String tenantId);
    List<FeeInstallmentPlan> findByTenantId(String tenantId);
}
